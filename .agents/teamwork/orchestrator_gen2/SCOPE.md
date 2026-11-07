# Scope: Milestone 1 Completion & Milestone 2 / 3 Progression

## Architecture
- Framework: Next.js 15.5.6 (App Router, Static Export `output: 'export'`) with React 19, TypeScript, Tailwind CSS v3.
- Milestone 1 Deliverables: Visual backgrounds (`HeroBackground` with 6 AVIF layers & WCAG AAA contrast scrims), dynamic project SVG icons (`ProjectModeIcon` reactive to activeMode), accessible glassmorphic 404 page (`not-found.tsx`), and complete build/static export stabilization (`patch-fs.js` & `clean.js`).

## Milestones State
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Visual Backgrounds, Dynamic Project Icons & Build Stabilization | Features 1, 2, 3, 8, 9, 19 (R1, R3, Favicon fix) | none | DONE |
| M2 | 3D WebGL Canvas & GLB Models Integration | Features 4, 5, 6, 7 (R2: Medical Heart, Academic Quill, Tech Polyhedron) | M1 | IN_PROGRESS |
| M3 | Dynamic Project Navigation, Modal Refactor, Animations & Tooltips | Features 10, 11, 12, 13, 14, 15, 16, 17, 18 (R4, R5, R6) | M1 | PLANNED |
| M4 | Final Milestone: 100% E2E Test Pass & Adversarial Hardening | Features 21 (Tiers 1-4 pass + Tier 5 coverage audit) | M2, M3, E2E | PLANNED |
