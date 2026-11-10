# Test Infrastructure Specification (TEST_INFRA.md)

## 1. Overview & Mission
This document defines the test infrastructure, architecture, and verification methodology for the Portfolio Performance Optimization & UI/UX Refresh project, derived directly from `ORIGINAL_REQUEST.md` and `PROJECT.md`.

The test suite is built on an **opaque-box requirement-driven methodology**, evaluating the system against observable user requirements, explicit interface contracts, and authoritative data sources rather than transient implementation internals.

---

## 2. Test Architecture & 4-Tier Taxonomy
The test suite implements a systematic 4-tier testing hierarchy guaranteeing comprehensive feature coverage, robust error handling, cross-feature state integrity, and authentic end-to-end user journeys:

```
tests/e2e/
├── runner.mjs                            # Central CLI test runner & reporter
├── helpers/
│   ├── fixtures.mjs                      # Asset paths, mode configs, and dataset loaders
│   ├── oracle.mjs                        # Authoritative requirement oracles and format parsers
│   ├── simulator.mjs                     # Headless state machine simulating user interactions
│   └── assertions.mjs                    # Assertions for 3D procedural models, layouts, SVG, and contracts
├── tier1-feature-coverage.test.mjs       # Tier 1: 24 tests (6 tests per feature for R1-R4)
├── tier2-boundary-corner.test.mjs        # Tier 2: 24 tests (6 tests per feature for R1-R4)
├── tier3-cross-feature.test.mjs          # Tier 3: 8 pairwise & systemic interaction tests
└── tier4-application-scenarios.test.mjs  # Tier 4: 5 full user walkthrough scenarios
```

### Tier 1: Feature Coverage (>=5 test cases per feature across R1 - R4)
- **R1: Model 3D Hero-Section Ringan per Mode** (6 tests):
  - T1.1.1: Tech mode procedural Polyhedron geometry, wireframe cage, orbital nodes (0 kB download).
  - T1.1.2: Medical mode procedural Helix DNA dual curve tubes, base-pair rungs, terminal spheres (0 kB download).
  - T1.1.3: Academic mode procedural Pena Bulu curved spine tube, ribbon vanes, brass nib (0 kB download).
  - T1.1.4: Instantaneous synchronous 3D model transitions across all 3 modes.
  - T1.1.5: 60 FPS rendering loop & complete recursive GPU resource disposal (`disposeHierarchy`) on unmount.
  - T1.1.6: Hero 3D captions & skeleton loader text per mode.

- **R2: Peringkasan Category Pill Galeri** (6 tests):
  - T1.2.1: Projects gallery category pills single-row horizontal scroll on mobile (<640px) saving >80% vertical space.
  - T1.2.2: Achievements gallery dedicated compact filter row with horizontal scroll on mobile.
  - T1.2.3: Category filter mode synchronization: auto-reset `selectedCategory` to `'All'` on `activeMode` change across both galleries.
  - T1.2.4: Projects gallery filter execution by category matches expected items.
  - T1.2.5: Achievements gallery filter execution by category matches expected items.
  - T1.2.6: Search query and sorting controls work concurrently with category filtering.

- **R3: Sistem Smart Bento Grid Adaptif pada Bagian Tentang Saya** (6 tests):
  - T1.3.1: 5-Tile 12-Column modular Bento Grid layout contracts eliminating vertical disparity ("timpang sebelah").
  - T1.3.2: Tile 5 full container width (`lg:col-span-12`) for adaptive history track.
  - T1.3.3: Interactive Segmented History Switcher (`Semua`, `Organisasi`, `Kepanitiaan`) in Tile 5.
  - T1.3.4: Auto-flowing 3-column subgrid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
  - T1.3.5: Progressive disclosure toggle ("Tampilkan N Lainnya / Ringkas") with threshold of 6 items.
  - T1.3.6: Balanced layout adaptation across mobile, tablet, and desktop viewports.

- **R4: Penyesuaian Logo Icon Proyek Berdasarkan Mode Aktif** (6 tests):
  - T1.4.1: Project card mode icon SVG assets presence and validity (Tech, Medical, Academic).
  - T1.4.2: Single-mode project displays icon matching its primary mode.
  - T1.4.3: Multi-mode project dynamically matches `activeMode` when activeMode is in `secondaryModes`.
  - T1.4.4: Multi-mode project falls back to primary `project.mode` when `activeMode` is not supported.
  - T1.4.5: Fallback behavior for null/missing project reference defaults to `activeMode` / `'tech'`.
  - T1.4.6: Accessible alt text generation per project and active mode.

### Tier 2: Boundary & Corner Cases (>=5 test cases per feature across R1 - R4)
- **R1 Boundary**: Rapid mode toggles (1,000 transitions) with zero memory leak, WebGL unsupported/context lost graceful fallback, mobile screen size (<1024px) skip to eliminate lag, pointer drag rotation bounds clamping, corrupt mode input fallback, and recursive disposal of deep hierarchies.
- **R2 Boundary**: Extreme category label length (150 chars) layout preservation, empty search query result with "Reset Filter" restoration, special regex/SQL injection strings safety, rapid category switching without state divergence, viewport boundary transitions (320px to 3840px), and whitespace-only search handling.
- **R3 Boundary**: Custom/empty history list handling, exactly 6 items boundary suppressing disclosure button, odd counts (1, 3, 5, 7, 11) natural subgrid flowing, rapid tab switching state determinism, extreme viewport bounds (320px to 3840px) maintaining column integrity, and long text description wrapping.
- **R4 Boundary**: Project with empty/null `secondaryModes`, corrupt primary mode fallback to `'tech'`, null/undefined project reference safety, rapid mode toggles (1,000 cycles) zero-lag icon synchronization, SVG viewBox attributes for high-DPI scaling, and duplicate mode entries deduplication.

### Tier 3: Cross-Feature Combinations (Pairwise & Systemic Interactions)
- **T3.1**: Mode Switch + Category Pill Auto-Reset + Dynamic Project Icon Synchronous Update
- **T3.2**: Mode Switch + 3D Model Geometry Change + Bento History Track Refresh
- **T3.3**: Multi-Mode Project Filtering by Category + Dynamic Icon Morphing across Tech, Medical, Academic
- **T3.4**: Mobile Viewport + Horizontal Scroll Category Pills + 3-Column Bento Grid Responsive Stacking
- **T3.5**: Search Filter + Category Filter + Dynamic Project Mode Icon Alignment
- **T3.6**: Bento Segmented Tab Switch + Progressive Disclosure + Mode Change Interaction
- **T3.7**: Theme Switch (Dark <-> Light) across all 3 modes preserving 3D scene & icon contracts
- **T3.8**: Direct URL Parameter Initialization (`?mode=medical`) hydrates all 4 features synchronously

### Tier 4: Real-World Application Scenarios (Full User Walkthroughs)
- **T4.1**: Complete Tech Portfolio End-to-End Walkthrough (Polyhedron 3D -> Web Development filter -> Tech Bento -> Tech icons)
- **T4.2**: Complete Medical Portfolio Clinical Walkthrough (Helix DNA 3D -> Category auto-reset -> Clinical filter -> Medical Bento history -> Medical icons)
- **T4.3**: Complete Academic Portfolio Scholarly Walkthrough (Pena Bulu 3D -> Scholarly publications filter -> Academic committees history -> Academic icons)
- **T4.4**: Cross-Disciplinary Recruiter Walkthrough across All 3 Modes with interactive filter & disclosure expansions
- **T4.5**: Responsive Viewport & Multi-Theme Matrix Validation (Mobile, Tablet, Desktop across Dark & Light)

---

## 3. Technology Stack & Execution Environment
- **Runtime**: Node.js v26.7.0 with native ESM (`import/export`).
- **Test Framework**: Native `node:test` and `node:assert/strict` — zero external test runner dependencies, ultra-fast execution (~2.3s for 61 tests), deterministic cross-platform compatibility.
- **Graphics & Geometry Engine**: Three.js in-memory geometry generation and mesh traversal for 3D model validation.
- **Dataset Integration**: Direct JSON dataset parsing (`projects.json`, `achievements.json`, `experience.json`, `committees.json`, `education.json`, `profile.json`).

---

## 4. How to Run the Tests

### Run Full Test Suite (Default)
```bash
node tests/e2e/runner.mjs
```

### Run by Specific Tier
```bash
# Run Tier 1 only (Feature Coverage)
node tests/e2e/runner.mjs --tier 1

# Run Tier 2 only (Boundary & Corner Cases)
node tests/e2e/runner.mjs --tier 2

# Run Tier 3 only (Cross-Feature Interactions)
node tests/e2e/runner.mjs --tier 3

# Run Tier 4 only (Real-World Scenarios)
node tests/e2e/runner.mjs --tier 4

# Run Tiers 1 and 2
node tests/e2e/runner.mjs --tier 1,2
```

### Filter Tests by Name Pattern
```bash
# Run all tests matching "Bento"
node tests/e2e/runner.mjs --filter "Bento"

# Run all tests matching "Medical"
node tests/e2e/runner.mjs --filter "Medical"

# Run all tests matching "Icon"
node tests/e2e/runner.mjs --filter "Icon"
```

### List Inventory Without Running
```bash
node tests/e2e/runner.mjs --list
```
