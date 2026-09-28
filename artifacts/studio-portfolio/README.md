# أثر — Creative Photography Studio Portfolio

## إضافة الصور

ضع ملفات الصور داخل مجلد التصنيف المناسب:

```text
public/images/
├── weddings/
├── events/
├── products/
├── sports/
├── portraits/
├── designs/
└── editing/
```

الصور المدعومة: `jpg`, `jpeg`, `png`, `webp`, `avif`, و`gif`.

يتم تحديث سجل الصور تلقائياً عند تشغيل التطوير أو بناء الموقع. لا تحتاج إلى تعديل مكونات React عند إضافة صور جديدة. استخدم `cover.jpg` لاحقاً كغلاف مخصص عند الحاجة؛ الصور الأخرى تُعرض بترتيب اسم الملف.

## إضافة تصنيف جديد

أضف اسم المجلد إلى قائمة التصنيفات في:

- `scripts/generate-image-manifest.mjs`
- `src/App.tsx`

ثم أضف بيانات التصنيف داخل `CATEGORIES` بنفس البنية الموجودة.

## تغيير الهوية والمحتوى

يمكن تغيير اسم المجموعة والنصوص وروابط التواصل مباشرة من أعلى `src/App.tsx`. استبدل `[GROUP LOGO]`، `[WHATSAPP LINK]`، `[INSTAGRAM LINK]`، `[TIKTOK LINK]`، و`[EMAIL LINK]` بالقيم الحقيقية عند جاهزية الهوية.

## التشغيل

```bash
pnpm run dev
```

الموقع RTL بالعربية، ويعرض حالة `Coming Soon` للتصنيفات التي لا تحتوي على أعمال بعد.