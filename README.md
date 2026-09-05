# Server Embassy Admin

Vite + React admin for catalog, orders, banners, shipping, RFQs, CMS pages, and settings. All data comes from the REST API (`serverembassy-api`) over `/api/admin/*` with JWT (Bearer) auth.

## Run

```bash
cp .env.example .env.local   # set VITE_API_URL (default http://localhost:4000)
npm install
npm run dev
```

Open [http://localhost:5174](http://localhost:5174).

Backend: `../serverembassy-api` on port **4000**. Storefront: `../serverembassy-web` on port **3000**.

## Auth

Staff login via `POST /api/auth/login`. The token is stored in `localStorage` (`se-admin-token`) and sent automatically with every request; expired/invalid tokens are cleared on 401.

Default seed admin (after `npm run db:seed` in the API): `admin@serverembassy.com` / `admin123`.

## Products & bulk upload

Products are managed under **Products** (CRUD at `/products`, form at `/products/new` or `/products/:id`) and bulk imported at `/products/import`.

The import accepts a **Google Shopping feed CSV**:

```
id,title,description,link,sale_price,price,brand,condition,gtin,image_link,mpn,product_type,quantity,shipping,tax,availablity,google_product,shipping_weight,custom_label_0
```

Behavior:

- `id` = product SKU. Existing SKUs are updated, new ones created. Quoted fields (descriptions with commas) and `|`-separated multiple image URLs in `image_link` are supported.
- `brand` is matched by name; unknown brands are auto-created.
- `product_type` (e.g. `Electronics > Networking`) is auto-expanded into a nested category tree; unknown categories are created.
- `price` is the selling price; a lower `sale_price` becomes the sale price with `price` kept as the strike-through `compareAtPrice` and the deal flag set.
- `availability` `in stock` maps to `status: published`; `out of stock` maps to `draft` with `stock: 0`. `quantity` overrides stock when present.
- `condition` values `new / refurbished / used` map to the internal enum.
- `availablity` (sic) is accepted as an alias; headers are matched case-insensitively (space/underscore-tolerant).

A **Download sample CSV** button on the import page produces a two-row example in the exact format.