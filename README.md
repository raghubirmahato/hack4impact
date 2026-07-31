# HealthAI

HealthAI is a React and TypeScript healthcare appointment experience with patient, clinician, and administrator workspaces. It is intended for education and demonstration—not diagnosis, emergency response, or storage of production health data.

## What works

- Patient workspace: book appointments, view care history, and cancel an upcoming request.
- Clinician workspace: review consultations and confirm, complete, or cancel them.
- Administrator workspace: verify clinicians, suspend/restore patient access, and review appointment activity.
- Doctor discovery, appointment scheduling, messaging UI, QR appointment lookup, profile tools, and AI-health UI.
- Offline demo mode backed by browser `localStorage`, plus an Express/PostgreSQL backend path for configured environments.

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173`). For the API server in a separate terminal:

```bash
npm run server
```

## Demo accounts

All demo accounts use password `demo123`.

| Role | Email |
| --- | --- |
| Patient | `patient@demo.com` |
| Administrator | `admin@demo.com` |

The seeded clinicians can be browsed in the booking flow. The offline fallback is for local demos only; do not use localStorage credentials or records in a real deployment.

## Environment

Create `.env` from `.env.example` before running the backend. At minimum, configure a unique `JWT_SECRET`, PostgreSQL settings, and (optionally) `GEMINI_API_KEY`. Never commit `.env` files or real API keys.

## Validation

```bash
npm test
npm run build
```

## Architecture

```text
React + Vite UI
├── pages/          patient, clinician, and administrator experiences
├── components/     reusable interaction and health UI
├── contexts/       current authenticated session
└── services/       API adapters and offline demo fallback

Express API (server.cjs) → PostgreSQL (optional local backend)
```

## Security notes

- The current offline mode intentionally uses browser storage and plain demo passwords. It is not production authentication.
- Configure TLS, secure HTTP-only cookies or a hardened token strategy, rate limiting, audit logs, validation, least-privilege database roles, and encrypted health-data storage before any deployment involving real users.
- AI responses should be clearly labelled as informational and reviewed by a qualified clinician when appropriate. Direct users with urgent symptoms to local emergency services.

## Development

Useful scripts:

- `npm run dev` — start the frontend
- `npm run server` — start the Express API
- `npm run db:init` — initialize the configured PostgreSQL schema
- `npm test` — run unit tests
- `npm run build` — make a production frontend bundle

## License

No license file was included in the downloaded repository. Add an explicit license before distributing or accepting contributions.
