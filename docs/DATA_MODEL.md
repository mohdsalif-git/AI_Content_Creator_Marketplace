# Genra data model

Genra models the creator marketplace around four durable concepts: creators, portfolio work, briefs, and engagements. The frontend seed mirrors these shapes so the preview remains useful when a database is not configured.

## Creator
A creator stores identity, discovery vocabulary, tool receipts, formats, pricing, commercial-use terms, workflow metadata, and a 0–100 verification score. `specializations` and `skills` are filterable; `tools` carries a kind (`video`, `image`, `audio`, `3d`, `upscale`, or `workflow`) and a verification flag.

```json
{
  "_id": "mara-lennox",
  "name": "Mara Lennox",
  "handle": "@maralennox",
  "specializations": ["product-film", "brand-identity", "3d-render"],
  "tools": [{"name":"Veo","kind":"video","verified":true}],
  "formats": ["16:9", "9:16"],
  "availability": "open",
  "pricing": {"from": 2400, "currency": "USD", "unit": "per-project"},
  "commercialUse": true,
  "verification": {"toolsVerified": true, "workflowVerified": true, "pastWorkVerified": true, "score": 97}
}
```

## PortfolioItem
Portfolio items belong to a creator and expose the evidence behind a thumbnail: `mediaUrl`, `thumbUrl`, `aspectRatio`, `durationSec`, `toolsUsed`, `modelsUsed`, `promptSummary`, `workflowNotes`, `clientName`, `year`, `pastWorkVerified`, and `tags`.

```json
{
  "_id": "portfolio-001",
  "creator": "mara-lennox",
  "title": "The object, reimagined",
  "type": "video",
  "mediaUrl": "https://example.com/video.mp4",
  "aspectRatio": "16:9",
  "toolsUsed": ["Veo", "ComfyUI"],
  "pastWorkVerified": true,
  "year": 2025
}
```

## Brief
A brief turns intent into structured work. It stores a brand, title, raw idea, objective, campaign description, content type, style, reference links, formats, duration, deliverable count, required tools and skills, budget, deadline, and commercial usage terms. `usage.requireProvenance` makes provenance explicit for AI-specific work.

```json
{
  "_id": "brief-01",
  "brand": {"name":"Aster & Co.","company":"Aster & Co.","contactEmail":"hello@aster.example"},
  "title": "A new kind of morning",
  "contentType": "brand-film",
  "style": ["cinematic", "minimal"],
  "formats": ["16:9", "9:16"],
  "requiredTools": ["Veo", "ComfyUI"],
  "budget": {"min": 8000, "max": 12000, "currency": "USD"},
  "usage": {"commercialUse": true, "channels": ["paid-social", "web"], "territories": ["Global"], "durationMonths": 12, "exclusivity": false, "requireProvenance": true}
}
```

## Engagement
An engagement joins a `brief` and a `creator` and moves through `invited`, `proposal`, `shortlisted`, `hired`, and `delivered`. It also carries a message array and timestamps. The matching endpoint returns an explainable score with tool overlap, skill overlap, format coverage, commercial-use compatibility, and verification components.
