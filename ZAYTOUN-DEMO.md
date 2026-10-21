# Zaytoun Group — interactive store preview

This branch adds a standalone static storefront preview at the repository root while leaving the original `main` branch unchanged.

## Preview features
- Responsive Arabic RTL storefront for Zaytoun Group
- Product search and category filters
- Product flavor selection and cart
- Customer details form that prepares an order inquiry for WhatsApp
- Prices and stock deliberately remain “upon request” until the business confirms real data

## Important
This is a sales-demo preview, not a production commerce backend. Orders are not stored on a server; the checkout opens WhatsApp and requires the customer to press Send. Product imagery is loaded from public product/social pages and may be subject to their hosting, rights, or availability. Before a production launch, confirm image permissions, product data, stock, prices, shipping rules and the correct order numbers with Zaytoun Group.

## Deployment
The root `index.html` is static and can be published as Cloudflare Pages static assets with no build command and the branch root as the output directory.
