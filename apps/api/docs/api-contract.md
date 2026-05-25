# CyberShop API Contract

Base URL: `http://localhost:4000/api`

All responses should follow this shape:

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Validation failed"
}
```

## Health

`GET /health`

- Purpose: check API status.
- Auth: public.

## Auth

`POST /auth/admin/login`

- Purpose: authenticate admin user.
- Auth: public.
- Request body:

```json
{
  "email": "admin@cybershop.com",
  "password": "123456"
}
```

- Response data:

```json
{
  "admin": {
    "id": "string",
    "name": "System Admin",
    "email": "admin@cybershop.com",
    "role": "super_admin"
  },
  "accessToken": "jwt"
}
```

`GET /auth/admin/me`

- Purpose: get currently authenticated admin.
- Auth: bearer token required.

`POST /auth/admin/refresh`

- Purpose: issue a new access token.
- Auth: refresh token required.

`POST /auth/admin/logout`

- Purpose: revoke refresh token.
- Auth: bearer token or refresh token required.

## Categories

`GET /categories`

- Purpose: list categories for user-facing pages.
- Auth: public.
- Query:
  - `page`
  - `limit`
  - `search`
  - `isActive`

`GET /categories/:slug`

- Purpose: get category detail.
- Auth: public.

`POST /admin/categories`

- Purpose: create a category.
- Auth: admin required.

`PATCH /admin/categories/:id`

- Purpose: update a category.
- Auth: admin required.

`DELETE /admin/categories/:id`

- Purpose: soft delete or disable a category.
- Auth: admin required.

## Products

`GET /products`

- Purpose: list products for user-facing pages.
- Auth: public.
- Query:
  - `page`
  - `limit`
  - `search`
  - `category`
  - `featured`
  - `status`
  - `sortBy`
  - `order`

`GET /products/:slug`

- Purpose: get product detail page data.
- Auth: public.

`POST /admin/products`

- Purpose: create a product.
- Auth: admin required.

`PATCH /admin/products/:id`

- Purpose: update a product.
- Auth: admin required.

`DELETE /admin/products/:id`

- Purpose: archive a product.
- Auth: admin required.

## Customers

`GET /admin/customers`

- Purpose: list customers for admin.
- Auth: admin required.
- Query:
  - `page`
  - `limit`
  - `search`
  - `status`

`GET /admin/customers/:id`

- Purpose: get customer detail for admin.
- Auth: admin required.

## Orders

`POST /orders`

- Purpose: create a cash-on-delivery customer order from checkout.
- Auth: customer bearer token required.
- Request body:

```json
{
  "customer": {
    "name": "Nguyen Van A",
    "email": "a@example.com",
    "phone": "0900000000"
  },
  "shippingAddress": {
    "fullName": "Nguyen Van A",
    "phone": "0900000000",
    "addressLine1": "123 Street",
    "city": "Ho Chi Minh City",
    "country": "Vietnam"
  },
  "paymentMethod": "cod",
  "shippingMethodId": "free",
  "items": [
    {
      "productId": "mongo_object_id",
      "quantity": 1
    }
  ],
  "note": ""
}
```

`POST /payments/vnpay/create`

- Purpose: create a pending order, reserve stock, and return a hosted VNPay payment URL.
- Auth: customer bearer token required.
- Request body:

```json
{
  "customer": {
    "name": "Nguyen Van A",
    "email": "a@example.com",
    "phone": "0900000000"
  },
  "shippingAddress": {
    "fullName": "Nguyen Van A",
    "phone": "0900000000",
    "addressLine1": "123 Street",
    "city": "Ho Chi Minh City",
    "country": "Vietnam"
  },
  "shippingMethodId": "express",
  "items": [
    {
      "productId": "mongo_object_id",
      "quantity": 1
    }
  ],
  "note": ""
}
```

`GET /payments/vnpay/ipn`

- Purpose: receive the VNPay server-to-server callback, verify checksum and amount, then finalize the order state.
- Auth: public.

`GET /payments/vnpay/return`

- Purpose: verify the VNPay checksum and redirect the browser back to the storefront result page.
- Auth: public.

`GET /payments/vnpay/status/:txnRef`

- Purpose: let the signed-in customer poll the latest VNPay order status after the browser redirect completes.
- Auth: customer bearer token required.

`GET /admin/orders`

- Purpose: list orders for admin.
- Auth: admin required.
- Query:
  - `page`
  - `limit`
  - `search`
  - `orderStatus`
  - `paymentStatus`

`GET /admin/orders/:id`

- Purpose: get order detail for admin.
- Auth: admin required.

`PATCH /admin/orders/:id/status`

- Purpose: update order status.
- Auth: admin required.

## Dashboard

`GET /admin/dashboard/summary`

- Purpose: provide summary cards and recent performance data for admin.
- Auth: admin required.
