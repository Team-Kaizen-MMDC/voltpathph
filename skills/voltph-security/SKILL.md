---
name: voltph-security
description: Security and privacy guidance for Voltpath PH, covering API protection, user location privacy, authentication, and secure data handling in the Philippines context.
---

# Voltpath PH Security Skill

Ensuring the safety of user data and the integrity of the Voltpath PH platform. Ties to **NFR-05** ("OWASP Top 10 compliance", credentials encrypted at rest, JWT on protected routes).

## 🛡 Security Priorities

- **PII & Location Privacy:** Trip plans and user locations are sensitive — never log them in plain text.
- **Secret Protection:** `GOOGLE_MAPS_API_KEY`, Supabase keys, and DB credentials never touch source control (`.env*` and `*.pem` are gitignored — keep it that way). The `SUPABASE_SERVICE_ROLE_KEY` is server-only — never ship it to web/mobile clients.
- **Authentication = Supabase Auth (decided).** Do **not** hand-roll JWT/password hashing. Clients authenticate with Supabase Auth (`SUPABASE_URL` + `SUPABASE_ANON_KEY`); the API **verifies** the Supabase JWT in middleware (`SUPABASE_JWT_SECRET`) on protected routes. This satisfies NFR-05 with far less custom security code. Currently no auth middleware exists yet — it is the next implementation pass.

## ✅ Hardening Checklist (verify per PR)

- [ ] **Auth middleware** verifies the Supabase JWT before serving protected routes (trips, profile, station reports).
- [ ] **No raw secrets to clients** — only the anon key reaches web/mobile; the service-role key stays server-side.
- [ ] **Input validation** at every route using the shared zod schemas — no `req.body as T` casts.
- [ ] **No raw error leakage** — never return the caught `error` object; use a central error handler that logs server-side and returns a safe message. (Currently `trips/stations/evModels` routes return `{ error }`.)
- [ ] **CORS allowlist** in production (currently `app.use(cors())` allows all origins).
- [ ] **`helmet`**, **rate limiting**, and a **JSON body-size limit** are applied in `index.ts`.
- [ ] **App tables store no passwords** — credentials live in Supabase `auth.users`; the app `user` table is a profile keyed by `auth.users.id`.
- [ ] **Row-Level Security (RLS)** considered so users access only their own trips/reports.
- [ ] **Parameterized queries only** — never string-concatenate user input into SQL/PostGIS (QueryBuilder params are good).
- [ ] **`synchronize: false` in prod** — schema drift via auto-sync is a data-integrity risk.

## 🚀 Key Workflows

### 1. Environment Auditing

- Check `.gitignore` excludes env files; confirm no secrets are committed (`git log -p` / secret scanners).
- Use `dotenv` for local dev only; inject prod secrets via the platform's secret manager (Railway vars / GitHub Secrets / 1Password CLI).

### 2. Pre-claim verification

- Before stating "OWASP compliant" or "auth implemented", confirm the code actually exists. Don't document security controls that aren't built — soften to "Planned" until they are.
