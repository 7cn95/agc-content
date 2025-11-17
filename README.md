# AGC Content – Backend (Render Ready)

- Node.js + Express + MongoDB
- جاهز للنشر على Render.

## تشغيل محلياً

```bash
cd backend
npm install
cp .env.example .env
# عدّل MONGODB_URI و JWT_SECRET
npm run dev
```

## نشر على Render

- اربط الريبو مع Render.
- تأكد أن `rootDir = backend` كما في `render.yaml`.
- ضع المتغيرات:
  - `MONGODB_URI`
  - `MONGODB_DB` (اختياري)
  - `JWT_SECRET`