# CyberShop API

Express.js + MongoDB backend scaffold for the CyberShop monorepo.

## Run

1. Copy `.env.example` to `.env`
2. Install dependencies
3. Start the API

```bash
npm --workspace apps/api install
npm --workspace apps/api run dev
```

## Seed admin

```bash
npm --workspace apps/api run seed:admin
```
