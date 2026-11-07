# Scope: Milestone 4 Completion & Project Victory Verification

## Architecture
- Framework: Next.js 15.5.6 (App Router, Static Export `output: 'export'`) with React 19, TypeScript, Tailwind CSS v3.
- Milestone 1 Deliverables (DONE): Visual backgrounds (`HeroBackground` with 6 AVIF layers & WCAG AAA contrast scrims), dynamic project SVG icons (`ProjectModeIcon` reactive to activeMode), accessible glassmorphic 404 page (`not-found.tsx`), and complete build/static export stabilization (`patch-fs.js` & `clean.js`).
- Milestone 2 Deliverables (DONE): 3D WebGL Canvas (`Hero3DScene` in `src/components/hero-3d-scene.tsx`) integrating Three.js, `GLTFLoader`, `MeshoptDecoder` for Medical `model-jantung.glb`, Academic `model-quill.glb`, and Tech procedural crystal, with `public/models/` mirroring, memory cleanup, and dynamic import in `src/components/hero.tsx`.
- Milestone 3 Deliverables (DONE): Dynamic JSON dataset highlight navigation (`featured: true`, dynamic indicators matching filtered count `btn-indicator-${idx}`, slide index auto-reset on mode switch), 3-tier Flexbox modal overhaul (sticky non-jumping header, confined scrollbar, zero double scrollbars, single-click card trigger, `btn-cta-detail`), slide block reactive transition animations (`key={currentHeroProject?.id}`), and accessible Radix UI `<Tooltip>` wrappers on all interactive controls.
- Milestone 4 Deliverables (DONE): Final Milestone: 100% E2E test suite validation (78/78 tests across 16 suites), all 7 Tier 5 adversarial regression suites (105/105 tests across 36 suites, grand total 183/183 automated tests passed), strict TypeScript typecheck (0 errors), Next.js production static export (`out/` fully generated), and certified CLEAN Project Victory Forensic Audit.

## Milestones State
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Visual Backgrounds, Dynamic Project Icons & Build Stabilization | Features 1, 2, 3, 8, 9, 19 (R1, R3, Favicon fix) | none | DONE |
| M2 | 3D WebGL Canvas & GLB Models Integration | Features 4, 5, 6, 7 (R2: Medical Heart, Academic Quill, Tech Polyhedron) | M1 | DONE |
| M3 | Dynamic Project Navigation, Modal Refactor, Animations & Tooltips | Features 10, 11, 12, 13, 14, 15, 16, 17, 18 (R4, R5, R6) | M1, M2 | DONE |
| M4 | Final Milestone: 100% E2E Test Pass & Adversarial Hardening | Features 20, 21 (Tiers 1-4 pass + Tier 5 coverage audit + Victory Audit) | M1, M2, M3, E2E | DONE |
