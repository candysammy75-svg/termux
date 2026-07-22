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
  // Supabase Transaction Pooler بيقطع الـ idle connections — keepAlive يحافظ عليها
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
  // إعادة المحاولة لو الـ connection انقطع
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
  max: 5,
});

// منع الـ pool error من يـcrash البوت كله
pool.on("error", (err) => {
  console.error("[pg-pool] idle client error — will reconnect automatically:", err.message);
});

export const db = drizzle(pool, { schema });
export * from "./schema.js";
