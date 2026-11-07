# Test Infrastructure Specification (TEST_INFRA.md)

## 1. Overview & Mission
This document defines the test infrastructure, architecture, and verification methodology for the Portfolio Hero-Section Enhancement & Cross-Mode UI/UX Refinement project, derived directly from `ORIGINAL_REQUEST.md` and `PROJECT.md`.

The test suite is built on an **opaque-box methodology**, evaluating the system against observable user requirements, explicit interface contracts, and authoritative data sources rather than transient implementation internals.

---

## 2. Test Architecture & 4-Tier Taxonomy
The test suite implements a systematic 4-tier testing hierarchy guaranteeing comprehensive feature coverage, robust error handling, cross-feature state integrity, and authentic end-to-end user journeys:

```
tests/e2e/
├── runner.mjs                            # Central CLI test runner & reporter
├── helpers/
│   ├── fixtures.mjs                      # Asset paths, mode configs, and dataset loader
│   ├── oracle.mjs                        # Authoritative requirement oracles and format parsers
│   ├── simulator.mjs                     # Headless state machine simulating user interactions
│   └── assertions.mjs                    # Assertions for binary GLB, AVIF, SVG, and contracts
├── tier1-feature-coverage.test.mjs       # Tier 1: 35 tests (>=5 tests per feature R1-R6)
├── tier2-boundary-corner.test.mjs        # Tier 2: 30 tests (5 tests per feature R1-R6)
├── tier3-cross-feature.test.mjs          # Tier 3: 8 pairwise combination tests
└── tier4-application-scenarios.test.mjs  # Tier 4: 5 full user walkthrough scenarios
```

### Tier 1: Feature Coverage (>=5 test cases per feature across R1 - R6)
- **R1: Visual Hero-Section per Mode** (6 tests): Validates presence and ISOBMFF header integrity of all 6 `.avif` background images (`bg-tech-dark.avif`, `bg-tech-light.avif`, `bg-medical-dark.avif`, `bg-medical-light.avif`, `bg-academic-dark.avif`, `bg-academic-light.avif`), background resolution oracle mapping, cross-fade transitions, and contrast vignettes.
- **R2: 3D Model Integration for Medical & Academic** (6 tests): Validates binary glTF 2.0 format of `model-jantung.glb` and `model-quill.glb`, verifies `EXT_meshopt_compression` and `KHR_mesh_quantization` on the medical heart model, mode-to-model dispatch contract (Tech procedural crystal vs Medical heart vs Academic quill), 3D pointer drag rotation, and public model mirror paths.
- **R3: Dynamic Project SVG Icons** (6 tests): Validates presence and XML markup of `project-tech.svg`, `project-medical.svg`, and `project-academic.svg`, dynamic icon resolution per active mode, and dynamic icon morphing on multi-mode projects (e.g. `proj-hmsso`).
- **R4: Dynamic Highlight Navigation from Dataset JSON** (6 tests): Validates dynamic filtering by `p.featured && (p.mode === activeMode || p.secondaryModes.includes(activeMode))`, elimination of static '1, 2, 3, 4' buttons in favor of dynamic count (3 items per mode), Next/Prev cyclic bounds math, slide index auto-reset to 0 on mode change, and active slide synchronization.
- **R5: Project Modal Refactor & Integration** (6 tests): Validates single-click modal opening from active project cards, click opening from "Lihat Detail" CTA, 3-tier Flexbox layout constraints (fixed header, scrollable body, fixed footer), scrollbar boundary confinement (zero border-radius leakage), and responsive viewport constraints.
- **R6: Animations, Block Transitions & Accessible Tooltips** (5 tests): Validates reactive animation keys (`key={currentHeroProject?.id}`), Radix Tooltip integration across all interactive buttons, tooltip hover activation, keyboard focus tooltip activation, and smooth transition classes.

### Tier 2: Boundary & Corner Cases (>=5 test cases per feature across R1 - R6)
- **R1 Boundary**: Unknown mode fallback to 'tech', system theme resolution, rapid mode toggling, extreme viewports (320px mobile to 3840px ultrawide), and missing image resilience.
- **R2 Boundary**: WebGL context loss recovery, large 90MB quill model progressive loading state, corrupted glTF buffer handling, window resize camera aspect recalculation, and zero pointer movement drag damping.
- **R3 Boundary**: Projects with undefined `secondaryModes`, unassociated project exclusion, case-insensitive mode mapping resilience, SVG high-DPI scaling, and rapid mode icon swapping.
- **R4 Boundary**: Single featured project handling (count === 1), empty dataset handling, out-of-bounds slide index clamping, negative slide index wrap-around, and burst navigation clicks.
- **R5 Boundary**: Escape key modal closing, backdrop click vs modal content click isolation, projects with missing optional fields, long text line clamping, and rapid open/close toggle stability.
- **R6 Boundary**: Fast keyboard navigation (`Tab` + `Enter`), non-interactive element ignoring, tooltip max-width wrapping, instant focus delay vs hover delay, and reduced motion preference (`prefers-reduced-motion`) compliance.

### Tier 3: Cross-Feature Combinations (Pairwise Interactions)
- **T3.1**: Mode Change + Modal Lifecycle Interaction
- **T3.2**: Mode Change + Slide Navigation Index Reset to 0
- **T3.3**: Multi-Mode Project Icon Morphing (`proj-hmsso` in Tech -> Medical -> Academic)
- **T3.4**: Mode Switch + 3D Model Swap + Background Image Synchronous State Update
- **T3.5**: Modal Open Blocks Background Keyboard Slide Navigation
- **T3.6**: Slide Navigation + Tooltip Reactive Synchronization
- **T3.7**: Theme Switch (Dark <-> Light) across all 3 modes preserving contrast & 3D lighting
- **T3.8**: Direct URL / LocalStorage Mode Initialization (`?mode=medical`)

### Tier 4: Real-World Application Scenarios (Full User Walkthroughs)
- **T4.1**: Complete Tech Portfolio Exploration Walkthrough (Dark theme, polyhedron, HMSSO modal deep-dive)
- **T4.2**: Complete Medical Portfolio Clinical Walkthrough (Heart GLB, Bunda Bahagia community health modal)
- **T4.3**: Complete Academic Portfolio Research Walkthrough (Quill GLB, SIPADU RI scholarly modal)
- **T4.4**: Complete Theme Inversion Matrix (All 3 modes in Light & Dark themes)
- **T4.5**: Responsive Mobile to Desktop Viewport Adaptation Walkthrough (320px to 3840px)

---

## 3. Technology Stack & Execution Environment
- **Runtime**: Node.js v26.7.0 with native ESM (`import/export`).
- **Test Framework**: Native `node:test` and `node:assert/strict` — zero heavy external testing dependencies, fast execution (< 2 seconds for 78 tests), cross-platform compatibility.
- **Binary & Format Parsers**: Native Node.js `Buffer` parsing for ISOBMFF AVIF headers and glTF 2.0 binary chunks.

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

# Run Tiers 1 and 3
node tests/e2e/runner.mjs --tier 1,3
```

### Filter Tests by Name Pattern
```bash
# Run all tests containing "Medical"
node tests/e2e/runner.mjs --filter "Medical"

# Run all tests containing "Modal"
node tests/e2e/runner.mjs --filter "Modal"
```

### List Inventory Without Running
```bash
node tests/e2e/runner.mjs --list
```

### Run Directly via Node's Native Test Runner
```bash
node --test tests/e2e/*.test.mjs
```

---

## 5. Exit Code & CI/CD Contract
- **Exit Code 0**: All executed test cases passed successfully.
- **Exit Code 1**: One or more test cases failed. Full error stack, assertion differences, and failing line numbers are printed to stderr/stdout.

---

## 6. Progressive Testability & Dual-Track Verification
During milestone implementation (M1: Backgrounds & Icons, M2: 3D Models, M3: Navigation & Modal), the E2E suite serves as the source of truth for acceptance.
In Milestone 4 (Final Milestone), 100% of tests must pass with exit code 0 before release sign-off.
