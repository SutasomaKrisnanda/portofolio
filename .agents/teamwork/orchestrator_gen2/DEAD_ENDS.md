# Dead Ends Log

| Iteration | Approach Tried | Why It Failed | Files Touched |
|-----------|---------------|---------------|---------------|
| M1 It1 | Native Next.js 15.5 export on WSL with incremental cache | WSL DrvFs file handle locks and missing `not-found.tsx` | `.next`, `src/app/not-found.tsx` |
| M1 It2 | Intercepting only lock errors on trace files | Next.js 15 export crashed on `fs.promises.rename` ENOENT on `500.html` | `patch-fs.js` |
| M1 It3 | Intercepting only `500.html` rename without handling `pages-manifest.json` ENOENT | Clean scratch build crashes when Next.js App Router attempts to read `.next/server/pages-manifest.json` during page data collection; `out/` export not emitted | `patch-fs.js`, `package.json` |
