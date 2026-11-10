# Execution Plan: Portfolio Performance Optimization & UI/UX Refresh

## 1. Context & Objectives
- Platform: GitHub Pages (Static export, Next.js 15, Three.js)
- Core Goals:
  - R1: Lightweight 3D Hero-Section models (Polyhedron for Tech, Helix DNA for Medical, Feather Quill / Pena Bulu for Academic) with zero lag and smooth transitions.
  - R2: Compact Category Pills in Project & Achievement galleries, responsive across mobile & desktop.
  - R3: Smart Adaptive Bento Grid in "About Me" (preventing lopsidedness as history/experience grows).
  - R4: Dynamic Project Logo Icons matching active mode, with consistent fallback.
  - Verification: `npm run build`, `npm run lint`, browser runtime & visual checks, zero console errors.

## 2. Phase 0: Survey (Parallel 3 Explorers)
- **Explorer Survey 1**: Focus on R1 (Hero-Section 3D models). Investigate current Three.js implementation (`hero-3d-scene.tsx`, assets, procedural vs lightweight GLB, transitions, memory disposal, performance on GitHub Pages).
- **Explorer Survey 2**: Focus on R2 & R4 (Gallery Category Pills & Project Logo Icons). Investigate gallery components, category pills rendering, mobile vertical space issues, desktop UX, project card icons, multi-mode matching, and fallback logic.
- **Explorer Survey 3**: Focus on R3 & Build/Testing Infrastructure (Smart Bento Grid in About section & E2E suite). Investigate Bento grid layout in About section, balance mechanisms, responsiveness, existing build scripts, linting, and existing tests.

## 3. Phase 1: Synthesis & Decomposition
- Merge Survey reports into `PROJECT.md` Feature Inventory.
- Decompose into Milestones (e.g. M1: Category Pills & Dynamic Icons; M2: Smart Bento Grid; M3: Lightweight 3D Hero Scene; M4: E2E Regression & Final Hardening).
- Dispatch E2E Testing Track and Milestone subagents.

## 4. Phase 2: Iterative Execution & Gating
- Each milestone: 3 Explorers -> 1 Worker -> 2 Reviewers -> 2 Challengers -> 1 Forensic Auditor.
- Gating: Binary veto on audit, strict AND on all approvals.
