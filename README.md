# GrowPhone — deploy guide (Netlify + Render + MongoDB + Zoho Mail)

Step-by-step context for **growphone.in**: frontend on **Netlify**, API on **Render**, database on **MongoDB Atlas**, outbound email via **Zoho** (`info@growphone.in`) and **Nodemailer**.

**→ Printable checklist:** [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md)

---

## Will SMTP work with `info@growphone.in` on Zoho?

**Yes**, as long as:

1. That address is a **real mailbox** (or alias that can send) in **Zoho Mail** for your domain.
2. You use the **SMTP host and port Zoho shows** for your account (often **`smtp.zoho.com`**, sometimes **`smtp.zoho.in`** for India-hosted mail — check in Zoho: **Settings → Mail Accounts → SMTP**).
3. **`SMTP_USER`** is the full email: `info@growphone.in`.
4. **`SMTP_PASS`** is that mailbox’s password (or Zoho **app password** if you use 2FA / app-specific passwords).
5. **`MAIL_FROM`** is `info@growphone.in` (must match an allowed sender).

Defaults in `server/.env.example` use **port 587** + **`SMTP_SECURE=false`** (STARTTLS). If that fails, try **port 465** + **`SMTP_SECURE=true`** (SSL), as Zoho documents for some setups.

---

## What each piece is (plain English)

| Piece | What it does |
|--------|----------------|
| **MongoDB** | Stores leads, blogs, admins, templates, settings. Use **Atlas** in production. |
| **Render** | Runs the **Node API** (`server/`) 24/7. |
| **Netlify** | Hosts the **React** site (`client/` build output). |
| **Nodemailer** | Sends mail through **Zoho’s SMTP** using env vars — no Zoho SDK required. |

---

## Run locally (two terminals)

1. **MongoDB:** local install *or* Atlas — set `MONGODB_URI` in `server/.env` (copy from `server/.env.example`).
2. **`server/.env`:** set `JWT_SECRET`, `CLIENT_URL` to include `http://localhost:5173,http://127.0.0.1:5173`, and **Zoho SMTP** fields (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, etc.).
3. **`client/.env`:** optional — leave **`VITE_API_URL` empty**. Vite proxies `/api` → `http://localhost:5000` (see `client/vite.config.js`).
4. Terminal A: `cd server && npm install && npm run dev`
5. Terminal B: `cd client && npm install && npm run dev`
6. Open **http://localhost:5173** — API calls go to the same origin and proxy to port 5000.

Put your **`logo.png`** in **`client/public/logo.png`**. The navbar shows the image **on the left**, then the wordmark **GrowPhone** (with **Phone** in green).

**Seed (optional):** `cd server && npm run seed` — creates default admin + email templates if the DB is empty.

---

## 1. MongoDB Atlas

1. Create a cluster and database user.
2. **Network Access:** allow **`0.0.0.0/0`** so Render can connect (tighten later if you want).
3. Copy the **connection string** → use as **`MONGODB_URI`** on Render.

---

## 2. Render (backend)

1. **New Web Service** → repo → root directory **`server`**
2. **Build:** `npm install` — **Start:** `npm start`
3. Set environment variables (see **`server/.env.example`**). Important:
   - **`CLIENT_URL`** — production origins only, comma-separated, **no trailing slash**, e.g.  
     `https://growphone.in,https://www.growphone.in`
   - **Zoho SMTP** — same as local, but use production secrets in Render’s dashboard only.

---

## 3. Netlify (frontend)

1. Base directory **`client`**, build **`npm run build`**, publish **`dist`**
2. **`VITE_API_URL`** = your Render API URL, **no trailing slash**, e.g. `https://your-service.onrender.com`
3. Redeploy after changing `VITE_API_URL`

---

## 4. Domain (growphone.in)

- **Netlify:** add custom domain; apply DNS records at your registrar.
- **Optional API subdomain** (e.g. `api.growphone.in`) on Render — then set **`VITE_API_URL`** to that URL and rebuild Netlify.
- **CORS:** **`CLIENT_URL` on Render** must list every browser origin you use (www and non-www).

---

## 5. Email templates

Seeded templates are in the admin **Email Templates** section. Variables: `{{name}}`, `{{email}}`, `{{businessType}}`, `{{phone}}`, `{{budget}}`, `{{submittedAt}}`.

---

## Project layout

- `client/` — React (Vite)  
- `server/` — Express, Nodemailer, MongoDB  

---

## Security

- Never commit **`server/.env`** or real **`SMTP_PASS`** to Git.
- Use strong **`JWT_SECRET`** in production; rotate if leaked.

For a step-by-step tick list (local + production), open **[`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md)**.
