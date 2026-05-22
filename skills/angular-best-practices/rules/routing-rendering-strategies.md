---
title: Choose Correct Rendering Strategy (CSR/SSR/SSG)
impact: MEDIUM
impactDescription: Impacts SEO, initial load performance, and Core Web Vitals
tags: routing, ssr, ssg, csr, rendering, hydration, performance
---

## Choose Correct Rendering Strategy

Select the appropriate rendering strategy based on content type, SEO requirements, and interactivity needs.

### Decision Matrix

| Requirement | Strategy |
|------------|----------|
| SEO + Static Content | SSG (Prerendering) |
| SEO + Dynamic Content | SSR |
| No SEO + High Interactivity | CSR |
| Mixed requirements | Hybrid (route-based) |

### Client-Side Rendering (CSR) — Default

Content rendered entirely in the browser. Best for internal tools and dashboards.

```typescript
// Default Angular setup — no additional configuration needed
```

### Server-Side Rendering (SSR)

Content rendered on server for initial request. Enable with Angular CLI:

```bash
ng add @angular/ssr
```

### Static Site Generation (SSG / Prerendering)

HTML generated at build time. Best for marketing pages, blogs, documentation.

```typescript
// angular.json or app config
{
  "prerender": true
}
```

### Hydration

Hydration makes server-rendered HTML interactive. Angular supports:

- **Full Hydration**: Entire app becomes interactive at once
- **Incremental Hydration**: Parts become interactive on demand using `@defer`
- **Event Replay**: Captures user events that happened before hydration completes

### Best Practices

- Use SSR/SSG for public-facing pages that need SEO
- Use CSR for authenticated internal apps
- Combine strategies per-route for hybrid apps
- Always pass `abortSignal` in SSR data fetching
- `afterRenderEffect` only runs client-side — never during SSR
