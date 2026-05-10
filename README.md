# نظام إدارة فارما بيتش - Pharma Beach Resort

نظام إداري متكامل (PWA) مخصص للهواتف المحمولة لإدارة حجوزات الشاليهات والعمليات الميدانية.

## 🚀 أوامر الرفع على GitHub

افتح الـ Terminal في مجلد المشروع ونفذ الأوامر التالية:

```bash
git init
git add .
git commit -m "Initial commit - PWA Mobile App"
git branch -M main
git remote add origin https://github.com/mohamedahmedelghamry1997-rgb/farma.git
git push -u origin main
```

## 🌐 أوامر النشر على Vercel

لرفع المشروع على استضافة Vercel:

1. تأكد من تثبيت Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. قم بتشغيل أمر الربط:
   ```bash
   vercel
   ```
3. للنشر النهائي:
   ```bash
   vercel --prod
   ```
*ملاحظة: تأكد من إضافة متغيرات بيئة Firebase في لوحة تحكم Vercel.*

## 📱 خطوات التثبيت كتطبيق (PWA)

### على iPhone (iOS):
1. افتح الموقع في متصفح **Safari**.
2. اضغط على زر **Share** (المشاركة) في الأسفل.
3. اختر **Add to Home Screen** (إضافة إلى الشاشة الرئيسية).

### على Android:
1. افتح الموقع في متصفح **Chrome**.
2. اضغط على النقاط الثلاث بالأعلى.
3. اختر **Install App** (تثبيت التطبيق).

## 🛠 التقنيات المستخدمة
- **Framework:** Next.js 15 (App Router)
- **UI:** Tailwind CSS + ShadCN UI
- **Database & Auth:** Firebase (Firestore & Auth)
- **AI:** Genkit (Google Gemini)
- **PWA:** Service Workers & Web Manifest
