# نظام إدارة فارما بيتش - Pharma Beach Resort (PWA)

نظام إداري متكامل مخصص للهواتف المحمولة لإدارة حجوزات الشاليهات والعمليات الميدانية، محول بالكامل إلى تطبيق ويب تقدمي (PWA).

## 🚀 الخطوات النهائية للنشر المباشر

### 1. الرفع على GitHub
افتح الـ Terminal في مجلد المشروع ونفذ الأوامر التالية لربط الكود بمستودعك:
```bash
git init
git add .
git commit -m "🚀 إطلاق النسخة الأولى - PWA Mobile App"
git branch -M main
git remote add origin https://github.com/mohamedahmedelghamry1997-rgb/farma.git
git push -u origin main
```

### 2. النشر على Vercel (الموقع المباشر)
لجعل الموقع متاحاً للجميع برابط مباشر ومحمي:
- قم بتثبيت Vercel CLI: `npm install -g vercel`
- نفذ أمر الربط الأول: `vercel` (اتبع التعليمات واضغط Enter للموافقة)
- نفذ أمر النشر النهائي: `vercel --prod`
*ملاحظة: تأكد من إضافة مفاتيح Firebase في لوحة تحكم Vercel (Settings -> Environment Variables) لضمان عمل قاعدة البيانات.*

## 📱 كيفية تثبيت التطبيق على هاتفك

### على iPhone (Safari):
1. افتح الرابط المنشور في متصفح **Safari**.
2. اضغط على زر **Share** (المشاركة) في الأسفل.
3. اختر **Add to Home Screen** (إضافة إلى الشاشة الرئيسية).

### على Android (Chrome):
1. افتح الرابط في متصفح **Chrome**.
2. ستظهر لك رسالة "تثبيت التطبيق" تلقائياً، أو اضغط على النقاط الثلاث واختر **Install App**.

## 🛠 المميزات التقنية المضافة
- **PWA Ready:** يدعم العمل بدون اتصال وتثبيت الأيقونة على الشاشة الرئيسية.
- **Mobile-First UI:** واجهة مستخدم سفلية (Bottom Nav) مريحة للتحكم بيد واحدة.
- **Service Worker:** تخزين مؤقت للملفات لسرعة استجابة فائقة.
- **Real-time Integration:** مزامنة لحظية مع Firebase Firestore و Authentication.
- **Safe Area Support:** متوافق مع هواتف الـ Notch (iPhone & Android).

---
تم التطوير والتحويل بواسطة AI Partner - نظام فارما بيتش الإداري.