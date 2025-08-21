# Dynamic Server (Express + Vite)

This converts the original static Vite site into a dynamic web app powered by **Express** while keeping the UI unchanged.

## Run (development)

```bash
npm install
cp .env.example .env
npm run dev
```

This runs Express with the Vite dev middleware, so hot-reload works and the UI stays the same.

## Build & Run (production)

```bash
npm run build
npm run start
```

- Express serves the built assets from `dist/`.
- Dynamic endpoints are available under `/api/*`.

## Included dynamic endpoints

- `GET /api/health` — simple health check.
- `POST /api/echo` — echoes posted JSON.
- `POST /api/contact` — logs submissions to `data/submissions.json`.
- `POST /api/contact-email` — sends an email via SMTP using env vars `SMTP_*` and `MAIL_*`. Optional.

## Notes

- No UI changes were made. The frontend remains your existing Vite + TS app.
- If your HTML uses strict CSP, ensure it allows the API endpoints you use (e.g., `connect-src 'self'` and `form-action 'self'`).
