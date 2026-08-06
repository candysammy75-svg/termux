import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL غير موجود. أضفه في ملف .env\nمثال: DATABASE_URL=postgresql://user:pass@localhost:5432/dragonbot",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // keepAlive يحافظ على الـ connections من الإغلاق التلقائي
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
  // idleTimeoutMillis أقل → الـ pool يطلق الـ connections الميتة أسرع
  idleTimeoutMillis: 10_000,
  // وقت انتظار أقل قبل اعتبار الـ connection فشل (Termux network drops)
  connectionTimeoutMillis: 15_000,
  // statement_timeout عشان مايتقلقش في query بايظة
  statement_timeout: 30_000,
  max: 3,
});

// منع الـ pool error من يـcrash البوت كله
pool.on("error", (err) => {
  console.error("[pg-pool] idle client error — will reconnect automatically:", err.message);
});

export const db = drizzle(pool, { schema });
export * from "./schema.js";

/**
 * بيعيد تنفيذ أي عملية DB لحد 3 مرات لو فشلت بسبب connection error.
 * مفيد على Termux حيث الـ network بيتقطع أحياناً.
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 2_000,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isNetworkErr =
        msg.includes("Connection terminated") ||
        msg.includes("connection timeout") ||
        msg.includes("ENOTFOUND") ||
        msg.includes("ECONNRESET") ||
        msg.includes("ETIMEDOUT") ||
        msg.includes("ECONNABORTED") ||
        msg.includes("getaddrinfo");

      if (!isNetworkErr || attempt === retries) throw err;

      console.warn(`[db-retry] محاولة ${attempt}/${retries} فشلت — هعيد بعد ${delayMs}ms: ${msg}`);
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
  throw lastErr;
}
