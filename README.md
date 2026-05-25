# CyberShop

CyberShop is a monorepo ecommerce demo with three apps:
- `apps/user`: customer storefront
- `apps/admin`: admin dashboard
- `apps/api`: Node.js + Express + MongoDB backend

## Requirements
- Node.js 20+
- npm 10+
- MongoDB running locally on `mongodb://127.0.0.1:27017`

## Install
```bash
npm install
```

## Environment Setup
Create local `.env` files from the examples:

```bash
copy apps\api\.env.example apps\api\.env
copy apps\admin\.env.example apps\admin\.env
copy apps\user\.env.example apps\user\.env
```

If you are on macOS or Linux:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/user/.env.example apps/user/.env
```

## Seed Demo Data
```bash
npm --workspace apps/api run seed:demo
```

This seeds:
- 1 admin account
- demo categories
- demo products
- demo customer accounts
- demo orders

## Run The Project
Use three terminals.

Terminal 1:
```bash
npm --workspace apps/api run start
```

Terminal 2:
```bash
npm --workspace apps/admin run dev
```

Terminal 3:
```bash
npm --workspace apps/user run dev
```

## Local URLs
- API: `http://localhost:4000`
- Admin: Vite dev URL shown in terminal, usually `http://localhost:5173/admin/login` or similar
- User: Vite dev URL shown in terminal, usually `http://localhost:5174/` or similar

## Demo Accounts
### Admin
- Email: `admin@cybershop.com`
- Password: `Admin@123456`

### Customer
- Email: `minhanh@cybershop.com`
- Password: `Customer@123`

## Core Demo Flow
### Guest
- can browse storefront
- can search products
- can view public pages
- cannot add to wishlist
- cannot add to cart
- cannot checkout

### Customer
- can sign up and sign in
- can add to wishlist
- can add to cart
- can checkout
- can view profile and orders

### Admin
- can sign in
- can view dashboard
- can manage categories, products, orders, customers, transactions

## Notes
- Shared images live in `shared/assets/images`
- Images are served by the backend at `/assets/images/...`
- Frontend apps depend on the API server for image loading and live data
- Some admin modules are intentionally left as empty-state placeholders: coupons, brands, media, reviews, control authority

## VNPay Sandbox Preparation
- Fill `VNPAY_TMN_CODE` and `VNPAY_HASH_SECRET` in `apps/api/.env`
- Set `API_PUBLIC_URL` to a public HTTPS URL that reaches your API server
- If you do not set explicit callback URLs, the API will derive:
  - Return URL: `${API_PUBLIC_URL}/api/payments/vnpay/return`
  - IPN URL: `${API_PUBLIC_URL}/api/payments/vnpay/ipn`
- If you do not set `VNPAY_FRONTEND_RETURN_URL`, the API will redirect back to `${CLIENT_USER_URL}/checkout/payment/result`
- For local development, use an HTTPS tunnel such as Cloudflare Tunnel or ngrok because VNPay IPN requires a public callback URL
