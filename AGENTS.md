# Portfolio Workspace Rules & Guardrails

## 1. Strict TypeScript & Linter Verification
- Never rely solely on `next build` if `next.config.ts` has `ignoreBuildErrors: true`.
- Always run `npm run typecheck` (`tsc --noEmit`) and `npm run lint` before committing or declaring a task complete.
- When renaming any variable or identifier, audit and update all references across the codebase, including log statements, fallback handlers, and template literals.
- Clean up unused imports and variables immediately to prevent CI linter failures (`@typescript-eslint/no-unused-vars`).

## 2. GitHub Pages Static Asset Referencing
- Next.js projects deployed to GitHub Pages project repositories run under a repository subpath (e.g., `https://<user>.github.io/<repo>/`).
- Never pass hardcoded domain-root strings (e.g., `'/models/...'`, `'/favicon.ico'`) to client-side loaders (`GLTFLoader`, `fetch`, audio/video players, `<link rel="icon">`).
- Always route static asset URLs through `getAssetPath(...)` from `@/lib/utils` and provide multi-candidate fallback paths (basePath, relative `./`, and root `/`).
- Static binary 3D models (GLB, GLTF) must reside in `public/models/`, never in `src/`, to prevent bundle bloat and memory exhaustion during static export.
