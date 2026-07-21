# 🐉 Dragon Shop Bot — Termux Edition

بوت متجر الرومات لـ Discord — نسخة مُعدَّلة تشتغل على **Termux** (Android).

> **الفرق عن النسخة الأصلية:**  
> - ✅ لا يحتاج monorepo أو pnpm workspace  
> - ✅ يشتغل مباشرةً بـ `npm start`  
> - ⚠️ خاصية الـ AFK Voice Channel معطَّلة (تحتاج native ARM bindings)

---

## 🔧 المتطلبات

### على Termux:
```bash
pkg update && pkg upgrade -y
pkg install nodejs git postgresql
```

> **ملاحظة PostgreSQL:** إذا ما أردت تشغيل قاعدة البيانات محلياً على Termux،  
> يُفضَّل استخدام قاعدة بيانات خارجية مجانية مثل [Supabase](https://supabase.com) أو [Neon](https://neon.tech).

---

## ⚙️ الإعداد

### 1. تثبيت المشروع
```bash
git clone https://github.com/candysammy75-svg/termux
cd termux
npm install
```

### 2. إعداد متغيرات البيئة
```bash
cp .env.example .env
nano .env
```

افتح `.env` وأضف بياناتك:
```
DISCORD_TOKEN=توكن_البوت
OWNER_ID=الـ_ID_بتاعك
GUILD_ID=الـ_ID_بتاع_السيرفر
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### 3. إنشاء جداول قاعدة البيانات
```bash
npm run db:push
```

### 4. تشغيل البوت
```bash
npm start
```

---

## 🔁 الإبقاء على البوت شغّالاً (اختياري)

لتشغيل البوت في الخلفية حتى بعد إغلاق Termux:
```bash
# تثبيت termux-services
pkg install termux-services

# أو استخدام screen
pkg install screen
screen -S bot
npm start
# اضغط Ctrl+A ثم D للخروج مع إبقاء البوت شغّال
# للرجوع: screen -r bot
```

---

## 🗄️ قاعدة البيانات على Supabase (مجانية)

1. اذهب إلى [supabase.com](https://supabase.com) وأنشئ مشروعاً
2. من **Settings → Database → Connection string → URI** انسخ الرابط
3. الصقه في `.env` كـ `DATABASE_URL`
4. شغّل `npm run db:push` لإنشاء الجداول

---

## 📁 هيكل المشروع

```
src/
├── index.ts      ← نقطة الدخول
├── bot.ts        ← الكود الرئيسي للبوت
├── db.ts         ← الاتصال بقاعدة البيانات
├── schema.ts     ← هيكل جداول قاعدة البيانات
├── badwords.ts   ← قائمة الكلمات الممنوعة
└── logger.ts     ← نظام اللوجات
```
