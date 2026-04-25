# Deployment checklist — GrowPhone (growphone.in)

Use this when going from **local** → **production** (Netlify + Render + MongoDB + Zoho Mail).

---

## Local — run on your PC first

- [ ] **MongoDB** running locally *or* Atlas URI ready (`MONGODB_URI` in `server/.env`).
- [ ] **`server/.env`** copied from `server/.env.example` and filled:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET` (any long random string for dev)
  - [ ] `CLIENT_URL` includes `http://localhost:5173` and `http://127.0.0.1:5173`
  - [ ] **Zoho SMTP** (see below)
- [ ] **`client/.env`** optional — leave `VITE_API_URL` **empty** so Vite proxies `/api` → `http://localhost:5000`.
- [ ] **Terminal 1:** `cd server && npm install && npm run dev` (API on port **5000**).
- [ ] **Terminal 2:** `cd client && npm install && npm run dev` (app on **5173**).
- [ ] Open `http://localhost:5173` — site loads, no CORS errors.
- [ ] **`GET http://localhost:5000/api/health`** returns JSON `ok: true`.
- [ ] **Seed once** (optional): `cd server && npm run seed` — creates admin + email templates.
- [ ] **Logo:** add **`client/public/logo.png`** (your asset). Navbar shows image + **GrowPhone** (green “Phone”).
- [ ] **Contact form** submits; if SMTP is correct, confirmation + admin emails send.
- [ ] **Zoho SMTP test** — if mail fails, check Zoho **SMTP host** (sometimes `smtp.zoho.in` for India), port **587** + `SMTP_SECURE=false`, or **465** + `SMTP_SECURE=true`.

### Zoho Mail (`info@growphone.in`) — typical env

| Variable | Typical value |
|----------|----------------|
| `SMTP_HOST` | `smtp.zoho.com` (or `smtp.zoho.in` if Zoho shows that for your account) |
| `SMTP_PORT` | `587` with `SMTP_SECURE=false`, **or** `465` with `SMTP_SECURE=true` |
| `SMTP_USER` | `info@growphone.in` |
| `SMTP_PASS` | Mailbox password or Zoho app-specific password |
| `MAIL_FROM` | `info@growphone.in` |

Confirm the exact host/port in **Zoho Mail → Settings → Mail Accounts → SMTP configuration**.

---

## Production — MongoDB Atlas

- [ ] Cluster created; **database user** + password saved.
- [ ] **Network Access** allows `0.0.0.0/0` (or Render’s IPs if you lock it down later).
- [ ] Connection string copied → **`MONGODB_URI`** on Render (password URL-encoded if it has special chars).

---

## Production — Render (API)

- [ ] Web service: root **`server`**, build `npm install`, start `npm start`.
- [ ] **Environment variables** set (no secrets in Git):
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET` (new, strong, **different** from local)
  - [ ] `CLIENT_URL` = `https://growphone.in,https://www.growphone.in` (and Netlify URL if needed) — **no trailing slashes**
  - [ ] Zoho: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL`
- [ ] Deploy succeeds; copy API URL (e.g. `https://xxx.onrender.com`).
- [ ] **`GET https://your-api/api/health`** works in browser.
- [ ] Run **seed** once against production DB (local `.env` pointing to Atlas, or Render shell): `npm run seed`.

---

## Production — Netlify (frontend)

- [ ] Site from Git; base **`client`**, build `npm run build`, publish **`dist`**.
- [ ] **`VITE_API_URL`** = `https://your-render-api.onrender.com` (no trailing slash) — **or** your API custom domain.
- [ ] Redeploy after any API URL change (Vite bakes this in at build time).

---

## Domain & DNS

- [ ] **Netlify:** custom domain `growphone.in` / `www` — DNS records added at registrar.
- [ ] **Render (optional):** API on `api.growphone.in` — DNS + SSL on Render.
- [ ] **`CLIENT_URL` on Render** includes every **https** origin visitors use.

---

## Final smoke tests (production)

- [ ] Homepage loads; navbar: **logo + GrowPhone** (green “Phone”).
- [ ] Contact form → lead saved; **user** receives email from `info@growphone.in`; **admin** receives notification.
- [ ] Admin login at `/admin-portal`; change default password if you used seed.
- [ ] HTTPS everywhere; no mixed-content errors.

---

## Files reference

| Item | Location |
|------|-----------|
| API env template | `server/.env.example` |
| Client env template | `client/.env.example` |
| Navbar brand | `client/src/components/Nav.jsx` |
| Logo file | `client/public/logo.png` (you provide) |

Longer explanations: **`README.md`**.
