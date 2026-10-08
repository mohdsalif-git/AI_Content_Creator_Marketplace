# Genra — Hire AI-Native Creators

Genra is a cinematic AI Content Creator Marketplace for brands and creative agencies. It helps teams discover verified AI creators, publish structured briefs, evaluate AI-specific portfolios, and move from match to invitation.

## Run it

```bash
npm install
npm run dev
```

The Vite preview runs on `http://localhost:3000`; the Express API runs on `http://localhost:4000`. `npm run seed` prints the deterministic seed receipt. MongoDB is optional: if `MONGODB_URI` is absent or unavailable, the API uses the included memory dataset.

## Architecture

The React client in `client/src` owns the cinematic marketplace experience and demo data. The Express service in `server/index.mjs` exposes the REST contract and optional Mongoose connection point. The app is intentionally credentialless in this demo: Brand/Creator is a localStorage role toggle, not a password flow. Media URLs live in `client/src/data/assets.ts` so the supplied references can be swapped in one place.

The design is dark editorial liquid-glass: Instrument Serif for display, Kanit for UI, verification teal `#5EEAD4`, and a purple-to-orange CTA gradient. The visual language is inspired by the supplied Higgsfield and Leonardo references, but all copy and fictional creators are original.

## API

`GET /api/health`; `GET /api/creators` with `q`, `skills`, `tools`, and `verifiedOnly`; `GET /api/creators/:id`; `POST/PUT /api/creators`; `GET /api/briefs`; `GET /api/briefs/:id`; `POST/PUT /api/briefs`; `GET /api/briefs/:id/matches`; `POST /api/briefs/:id/invite`; `POST /api/brief-builder`.

## Assumptions

The first preview uses deterministic in-memory data for reliability. Brief-builder extraction is rule-based so the flow works without an AI provider key; a future adapter can replace that function with structured LLM output. The app uses CSS orb and gradient poster treatments instead of introducing new generated images, keeping the supplied video assets replaceable and the initial load lightweight.
