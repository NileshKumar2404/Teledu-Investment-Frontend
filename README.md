# StartupIQ OS Frontend

React + Vite frontend for the Investment OS / StartupIQ application.

## Requirements

- Node.js 20+
- npm
- A running backend API

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs locally at `http://localhost:5173`.

## Environment Variables

Create a `.env` file for local development and add the same variable in Vercel.

```bash
VITE_API_URL=https://investment-app-backend-1.onrender.com
```

`VITE_API_URL` should be the backend origin only. Do not include `/api/v1`.

If `VITE_API_URL` is omitted during local development, Vite proxies `/api` to the default backend configured in `vite.config.js`.

## Scripts

```bash
npm run dev      # Start local dev server
npm run build    # Create production build in dist/
npm run preview  # Preview production build locally
npm run lint     # Run oxlint
```

## Vercel Deploy

This project includes `vercel.json`.

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL`

The Vercel rewrite sends frontend routes to `index.html` while leaving `/api/*` untouched.
