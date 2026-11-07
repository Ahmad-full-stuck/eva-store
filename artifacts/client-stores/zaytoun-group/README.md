# Zaytoun Group Store

نسخة متجر زيتون كروب المبنية على واجهة المتاجر المشتركة في Eva Store.

- Live storefront: https://zaytoun-group.eva-store.workers.dev/
- Orders dashboard: https://zaytoun-group.eva-store.workers.dev/admin
- Main module: `worker.js` (self-contained storefront + API + admin dashboard)
- Storage: Cloudflare KV namespace `zaytoun-group-orders` bound as `ORDERS`
- Admin PIN: configured as a Cloudflare Worker secret named `ADMIN_PIN`; never place it in source control.

## Deploy

```sh
npx wrangler deploy --config wrangler.jsonc
npx wrangler secret put ADMIN_PIN --config wrangler.jsonc
```

The public catalog starts with six sample products. Prices and stock are confirmed directly with the store. Product packshots are illustrative third-party catalog images and should be replaced with approved Zaytoun Group product photography before launch advertising.
