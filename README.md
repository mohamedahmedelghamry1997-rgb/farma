# نظام إدارة فارما بيتش - Pharma Beach Resort (PWA)

نظام إداري متكامل مخصص للهواتف المحمولة لإدارة حجوزات الشاليهات والعمليات الميدانية.

## 🚀 الخطوات النهائية للنشر المباشر

### 1. الرفع على GitHub
افتح الـ Terminal في مجلد المشروع ونفذ:
```bash
git init
git add .
git commit -m "🚀 إطلاق النسخة الأولى - PWA Mobile App"
git branch -M main
git remote add origin https://github.com/mohamedahmedelghamry1997-rgb/farma.git
git push -u origin main
```

### 2. النشر على Vercel (الموقع المباشر)
لجعل الموقع متاحاً للجميع برابط مباشر:
- قم بتثبيت Vercel CLI: `npm install -g vercel`
- نفذ أمر الربط: `vercel`
- نفذ أمر النشر النهائي: `vercel --prod`
*ملاحظة: تأكد من إضافة مفاتيح Firebase في لوحة تحكم Vercel (Settings -> Environment Variables).*

## 📱 كيفية تثبيت التطبيق على هاتفك

### على iPhone (Safari):
1. افتح الرابط في **Safari**.
2. اضغط على زر **Share** (المشاركة).
3. اختر **Add to Home Screen** (إضافة إلى الشاشة الرئيسية).

### على Android (Chrome):
1. افتح الرابط في **Chrome**.
2. ستظهر لك رسالة "تثبيت التطبيق" تلقائياً، أو اضغط على النقاط الثلاث واختر **Install App**.

## 🛠 المميزات التقنية
- **PWA:** يدعم العمل بدون اتصال وتثبيت الأيقونة.
- **Mobile-First:** واجهة مستخدم سفلية مريحة للموبايل.
- **Real-time:** تحديثات لحظية عبر Firebase.
- **Automation:** نظام فحص ميداني متكامل للمشرفين.