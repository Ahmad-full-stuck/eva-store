# Eva Store — Client storefronts

Seventeen independent client storefront Workers are configured here. Each has its own Workers.dev hostname and brand profile. The responsive React storefront is shared and receives brand-specific text, products, photography, palette, categories and shape tokens.

Existing stores: BRAND_LAYA, مكتب النجوم, شركة لنا, SCOOPER and MUKHTAR.

New client previews:
- أقمشة حيدر طائف — https://hayder-taif.eva-store.workers.dev/
- Apple Center العامرية — https://apple-center-amiriya.eva-store.workers.dev/
- الماس ستور — https://almass-mobile.eva-store.workers.dev/
- الأوحد للهواتف النقالة — https://alawhad-mobile.eva-store.workers.dev/
- عالم القلعة — https://aalam-alqalaa.eva-store.workers.dev/
- 1989 Restaurant — https://nineteen89-rest.eva-store.workers.dev/
- شركة إخوان الصفا — https://alsifa-company.eva-store.workers.dev/
- SHAM Couture — https://sham-couture.eva-store.workers.dev/
- FINK Factory — https://fink-factory.eva-store.workers.dev/
- مركز ابل ستور — https://apple-store-98h.eva-store.workers.dev/
- مركز الساعة — https://center-alsaa.eva-store.workers.dev/
- MORVO Handmade — https://morvo-handmade.eva-store.workers.dev/

New previews are demo-only. Sample products, photography and prices are illustrative, not confirmed inventory or client-approved material. Store records are namespaced by tenant slug in the shared demo KV namespace and demo checkout rejects actual orders. Exact Instagram avatars could not be retrieved from the public web session; current marks are typographic previews awaiting approved brand assets.

Cloudflare Worker resources and workers.dev subdomains for the twelve new previews were provisioned separately before first script upload to avoid first-deploy metadata lookup race conditions.


## Phase 2 — bespoke visual direction

The twelve new client previews now use dedicated vertical storefront home compositions selected by business category rather than only recoloring one shared home page. Their category navigation, editorial/food/device imagery, product-card treatment, hero composition and responsive layouts are separately art-directed. The shared catalog and product-detail screens also receive per-brand visual refinements. Demo imagery and catalog data remain illustrative until each client supplies approved assets and stock data.
