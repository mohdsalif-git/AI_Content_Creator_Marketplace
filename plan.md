# Genra — implementation plan

## Product approach
Genra is a cinematic discovery layer for brands and agencies hiring AI-native creators. The first release prioritizes the landing-page wow factor, creator discovery, and a brief-to-match flow that is demonstrable without external credentials. The client is a React/Vite app with React Router-style view state, a small Express API for creators/briefs/matches, and an in-memory seed fallback so preview always works.

## Design direction
- **Design movement:** cinematic editorial / liquid glass, borrowing the atmospheric restraint of AI creative tools without copying either reference site.
- **Core principles:** show the work first; make verification tangible; use generous negative space; make every action feel like a film cut.
- **Color philosophy:** black is the stage, cool steel typography keeps the interface quiet, and teal is reserved for trust signals. The CTA gradient is an event, not a background color.
- **Layout paradigm:** full-bleed chapters, offset editorial rails, sticky cards, and horizontal portfolio bands instead of a centered dashboard grid.
- **Signature elements:** rounded glass nav, oversized serif headlines with italic contrast words, and thin luminous rings around verified metrics.
- **Interaction philosophy:** search and filters respond immediately; role toggles change the call-to-action language; matches explain themselves rather than behaving like an opaque recommendation engine.
- **Animation:** slow ambient drift for the hero orb and marquee, restrained fade/slide entrances, and reduced-motion fallbacks that preserve hierarchy without motion.
- **Typography:** Instrument Serif for display/brand voice; Kanit for UI, metadata, and dense information.
- **Brand essence:** AI-native talent, made legible for ambitious brands. Personality: assured, cinematic, exacting.
- **Brand voice:** sharp, human, and craft-aware. Example lines: “Hire the AI-native creators.” / “Verification is the new creative credential.”
- **Wordmark & logo:** a compact “G/” monogram with a cut-out orbital stroke paired with the Genra wordmark.
- **Signature brand color:** verification teal `#5EEAD4`.

## Architecture
- `client/`: Vite React entry, page components, styling, asset constants, frontend seed data.
- `server/`: Express API with in-memory seed data and optional MongoDB/Mongoose connection point.
- `public/manus-routes.json`: complete navigable route manifest for preview.
- `docs/`: data-model and demo notes.
- Root scripts run the client and server together; preview serves the Vite app on port 3000.

## Scope decisions
- Fake auth is localStorage-backed and intentionally credentialless.
- The brief builder uses deterministic keyword extraction in the client for instant demos; the API exposes the matching endpoint shape for later model integration.
- Portfolio media uses the supplied replaceable video URLs plus CSS poster treatments, so the app never depends on generated assets to render.
- The backend uses optional Mongoose when `MONGODB_URI` exists, but the preview path always works with memory data.

## Finalized landing-page order
1. Hero — cinematic entry point with creator search and brief CTA.
2. Creator Discovery — searchable network preview with creator cards.
3. Brief Marketplace — structured brief-to-match workflow and builder CTA.
4. Portfolio Showcase — marquee rail of AI-native work and visible process.
5. Engagement Management — trust signals, invitations, workspace handoff, and final CTA.

The landing page now uses a precision white/light base with near-black editorial typography, neon purple CTA energy, and cyan verification accents. The existing layout, content, interactions, motion, and responsive breakpoints remain unchanged.
