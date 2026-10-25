# hiredhand

AI teammates you actually own.

Hiredhand is open source AI staff: hire a bot, hand it real work, and it runs on your machines, with your models, under your rules. It signs in to your tools, uses them the way you do, and comes back when it needs you.

- Apache-2.0, self-hosted
- Your keys, your model, your sandbox
- Humans approve what matters; bots do the rest

## Get started

```bash
npx hiredhand init
```

## This repository

This repo contains the Hiredhand website and control-plane app:

- `src/` — React 19 + Vite frontend (Tailwind, shadcn/ui)
- `api/` — Hono + tRPC backend
- `db/` — Drizzle ORM schema (MySQL)
- `contracts/` — shared types between client and server

## Develop

```bash
cp .env.example .env   # fill in your values
npm install
npm run dev
```

## License

Apache-2.0
