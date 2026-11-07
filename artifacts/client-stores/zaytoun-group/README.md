# Zaytoun Group Store

متجر زيتون كروب مبني على تطبيق Eva Store نفسه: واجهة React متعددة الصفحات، كتالوج، صفحات منتجات، سلة، إتمام طلب، تتبع، مفضلة، صفحات معلومات، ولوحة إدارة.

## روابط التشغيل

- واجهة المتجر: https://zaytoun-group.eva-store.workers.dev/
- لوحة الإدارة: https://zaytoun-group.eva-store.workers.dev/#/admin

## البنية

- `worker.js`: واجهة API الخاصة بزيتون كروب، إدارة الطلبات والمحتوى والمنتجات، وخدمة الصور المحسّنة.
- `ORDERS`: مساحة KV مستقلة باسم `zaytoun-group-orders`، منفصلة عن بيانات Eva Store وبقية المتاجر.
- `STATIC`: Service Binding إلى Worker `laya` لإعادة استخدام ملفات React/CSS/fonts المشتركة نفسها دون نسخ حزمة التطبيق.
- الصور تمر عبر `/media/zaytoun/:id` وتُحوّل إلى AVIF/WebP بعرض مناسب وتُخزن مؤقتاً على Cloudflare.

## النشر

```sh
npx wrangler deploy --config wrangler.jsonc
npx wrangler secret put ADMIN_PIN --config wrangler.jsonc
```

لا تضع قيمة `ADMIN_PIN` في Git أو ملفات الإعداد. الأسعار ورسوم التوصيل والعبوات والنكهات والتوفر يؤكدها فرع زيتون كروب قبل اعتماد الطلب.
