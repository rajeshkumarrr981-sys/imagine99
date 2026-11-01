# Imagine99

Imagine99 is a small full-stack e-commerce store built with **Next.js 16 (App Router)**, **MongoDB + Mongoose** and **Auth.js (NextAuth v4)**.
The UI is based on the free [NextMerce](https://github.com/NextMerce/nextjs-ecommerce-template) template; this version replaces its static demo data with a real backend.

## Features

- **Products from MongoDB**: home page, shop with category filter, search, sort and price range, and a product page for each item
- **Accounts**: email + password sign-up/sign-in (bcrypt-hashed), optional **Google** sign-in
- **Cart**: Redux, saved in the browser, quantities capped at available stock
- **Checkout**: creates real orders (cash on delivery for now). Prices and stock are checked on the server, and stock is reserved when the order is placed
- **Order confirmation emails** via SMTP (logged to the console when SMTP isn't set up)
- **My Account**: order history, order detail pages, saved shipping address, profile and password change
- **Wishlist**: saved to the account when signed in (guest items are merged on sign-in), and to the browser for guests
- **Product reviews**: one review per customer per product (editable), with average rating shown on cards
- **Admin panel** at `/admin`: dashboard, product create/edit/delete, order list with status updates

## Getting started

Requirements: Node.js 20+ and a MongoDB database (local, Docker, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster).

```bash
npm install
cp .env.example .env.local     # then edit the values
npm run seed                   # sample products + admin account
npm run dev
```

Open http://localhost:3000. Sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local` to reach `/admin`.

Run MongoDB locally with Docker if you don't have it installed:

```bash
docker run -d --name mongo -p 27017:27017 mongo:8
```

### Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | yes | e.g. `mongodb://127.0.0.1:27017/imagine99` |
| `NEXTAUTH_URL` | yes | `http://localhost:3000` in development |
| `NEXTAUTH_SECRET` | yes | generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | no | enables the Google button. Redirect URI: `<NEXTAUTH_URL>/api/auth/callback/google` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` | no | order emails. Without `SMTP_HOST`, emails are printed to the server log |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | for seeding | `npm run seed` creates or updates this admin user |

`npm run seed` skips products if some already exist. Use `npm run seed -- --force` to replace them.

## Project structure

```
src/
  app/
    (site)/              storefront pages (shop, product, cart, checkout, account, orders)
    (admin)/admin/       admin panel
    api/                 auth, signup, orders, wishlist, reviews, account
  components/            UI components (from the NextMerce template, wired to real data)
  lib/                   db connection, auth config, product queries, pricing, email
  models/                Mongoose models: User, Product, Order, Review
  redux/                 cart, wishlist and UI state
scripts/seed.ts          sample data + admin user
```

## Not included yet

- Online payments (Stripe etc.). Orders are created as "cash on delivery"
- Image uploads in the admin (products use image paths/URLs)
- Password reset by email

## License note

The upstream NextMerce free template doesn't ship a license file. Check with its authors before using the UI commercially.
