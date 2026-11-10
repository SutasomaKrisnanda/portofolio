# Technical Strategy & Implementation Plan: Tech Mode Geometric Glyphs Restoration (Milestone 1)

**Author:** Explorer M1-2 (`teamwork_explorer`)  
**Parent:** orchestrator_gen4 (`8cd7df6d-a097-4806-b13b-e7c23793f6d5`)  
**Target Milestone:** Milestone 1 (Feature 1: R1.1 Tech Mode Geometric Glyphs Restoration)  
**Target Role:** Worker M1  
**Date:** 2026-11-10T13:07:00Z  

---

## 1. Executive Summary

This report delivers a verified, implementation-ready strategy for restoring the legacy procedural geometric glyphs (`DiamondArtifactGlyph`) for **Tech Mode** across the portfolio.

In earlier iterations, `ProjectModeIcon` was configured to unconditionally render static rasterized/SVG icon assets (`/icons/project-tech.svg`) for all project cards. Per **ORIGINAL_REQUEST.md (§ R1, Follow-up 2026-11-10T12:37:00Z)** and **PROJECT.md (§ Interface Contracts)**, Tech Mode projects must dynamically render the procedural geometric glyphs defined in `src/components/geometric-glyphs.tsx` lines 58–117, deterministically cycling across three procedural shapes based on project index:
1. **Liquid Chrome Sphere** (`index % 3 === 0`)
2. **Crystal Octahedron** (`index % 3 === 1`)
3. **Holographic Crystal Column** (`index % 3 === 2`)

### Key Discoveries & Vulnerabilities Identified:
1. **SVG `<defs>` Fragility in `DiamondArtifactGlyph`**:
   - In `geometric-glyphs.tsx`, gradient IDs are interpolated as `chrome-${visualType}-${index}` and `holo-${visualType}-${index}`.
   - In `src/data/projects.json`, `visualType` contains whitespace and special characters (e.g., `"Smart IoT & AI"`, `"Brand & Media"`, `"System Architecture"`).
   - In XML/SVG and CSS specifications, `url(#chrome-Smart IoT & AI-0)` contains spaces and unencoded ampersands, which breaks URL fragment resolution in standard browser SVG rendering engines, causing the glyph to render with missing gradients (black/transparent fills).
   - Furthermore, when the same project is rendered in multiple DOM locations simultaneously (e.g. Hero mobile card + Hero desktop carousel), duplicate SVG IDs cause cross-component gradient unbinding on unmount/re-render.
   - **Remedy**: Sanitize `visualType` via regex and inject unique React instance identifiers (`React.useId()`) sanitized for CSS/XML names.
2. **Missing Dimension/Class Propagation**:
   - `DiamondArtifactGlyph` currently hardcodes `className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-md"`.
   - When embedded inside `ProjectModeIcon` containers (such as `w-6 h-6` on Hero mobile, or `w-full h-full` on gallery cards), the hardcoded dimensions cause visual overflow and distortion.
   - **Remedy**: Update `DiamondArtifactGlyph` to accept optional `className`, `style`, `role`, and `aria-label` props with backward-compatible defaults.
3. **Missing `index` Prop on `ProjectModeIcon`**:
   - `ProjectModeIconProps` currently lacks the `index?: number` property.
   - **Remedy**: Add `index?: number` to `ProjectModeIconProps`, with a robust defensive fallback that resolves the project's index in `PORTFOLIO_PROJECTS` if `index` is omitted by the caller.

---

## 2. Deep Dive: `DiamondArtifactGlyph` & The 3 Procedural Shapes

Located in `src/components/geometric-glyphs.tsx` (lines 58–117), `DiamondArtifactGlyph` renders procedural SVG vector artifacts using `index % 3`:

### 2.1 Shape 0: Liquid Chrome Sphere (`index % 3 === 0`)
- **Visual Concept**: An organic, liquid metal chrome droplet/sphere with physical ground shadow and specular reflections.
- **ViewBox**: `0 0 80 80`
- **Key Geometric Elements**:
  1. `<linearGradient id={...}>`: 4-stop metallic gradient:
     - `0%`: `#f8fafc` (slate-50 chrome specular highlight)
     - `45%`: `#64748b` (slate-500 mid-tone metallic specular body)
     - `75%`: `#cbd5e1` (slate-300 secondary metallic reflection)
     - `100%`: `#1e293b` (slate-800 deep chrome shadow core)
  2. Ground Contact Shadow: `<ellipse cx="42" cy="67" rx="16" ry="4" fill="rgba(15,23,42,0.28)" />`
  3. Organic Droplet Spline: `<path d="M38 12 C52 14, 56 28, 46 38 C58 46, 54 62, 38 64 C24 62, 24 46, 34 36 C24 26, 28 14, 38 12 Z" stroke="#e2e8f0" strokeWidth="1.2" />` filled by the linear gradient.
  4. Top Specular Glint: `<circle cx="37" cy="25" r="5" fill="#ffffff" fillOpacity="0.65" />`
  5. Lower Curvature Light-Bounce: `<path d="M32 48 Q40 56 47 46" stroke="#94a3b8" strokeWidth="2" fill="none" />`

### 2.2 Shape 1: Crystal Octahedron (`index % 3 === 1`)
- **Visual Concept**: A precision-faceted gemstone/octahedron prism casting soft magenta/rose refraction.
- **ViewBox**: `0 0 80 80`
- **Key Geometric Elements**:
  1. Ground Contact Shadow: `<ellipse cx="40" cy="64" rx="22" ry="5" fill="rgba(15,23,42,0.25)" />`
  2. Top Facet Polygon: `<polygon points="40,20 66,34 40,48 14,34" fill="#fbcfe8" stroke="#f9a8d4" strokeWidth="1" />` (pale rose facet with crisp border)
  3. Bottom-Left Facet Polygon: `<polygon points="14,34 40,48 40,60 14,46" fill="#f472b6" />` (mid rose facet)
  4. Bottom-Right Facet Polygon: `<polygon points="66,34 40,48 40,60 66,46" fill="#db2777" />` (deep rose shadow facet)
  5. Inner Diamond Refraction Plane: `<polygon points="40,25 55,33 40,41 25,33" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />` (internal silver-slate reflection plane)

### 2.3 Shape 2: Holographic Crystal Column (`index % 3 === 2`)
- **Visual Concept**: A vertical cybernetic crystal column / prism monolith standing on an engineered pedestal, energized with iridescent cyan-purple-pink luminescence.
- **ViewBox**: `0 0 80 80`
- **Key Geometric Elements**:
  1. Primary Luminescent Gradient:
     - `0%`: `#22d3ee` (cyan-400)
     - `50%`: `#c084fc` (purple-400)
     - `100%`: `#f472b6` (pink-400)
  2. Side Refraction Gradient:
     - `0%`: `#38bdf8` (sky-400)
     - `100%`: `#0f766e` (teal-700)
  3. Ground Contact Shadow: `<ellipse cx="42" cy="67" rx="14" ry="4" fill="rgba(15,23,42,0.28)" />`
  4. Crystal Top-Cap: `<polygon points="38,14 58,22 44,30 24,22" fill="#e0f2fe" />` (ice blue facet)
  5. Front-Left Column Face: `<polygon points="24,22 44,30 44,58 24,50" />` with primary holo gradient fill.
  6. Front-Right Column Face: `<polygon points="44,30 58,22 58,50 44,58" />` with side refraction gradient fill.
  7. Base Engineering Plinth: `<rect x="40" y="56" width="4" height="8" rx="1.5" fill="#334155" />` (slate-700 dark base)

---

## 3. Integration Architecture: `src/components/project-mode-icon.tsx`

### 3.1 Mode Resolution Flow
In `ProjectModeIcon`, mode resolution operates via:
```typescript
const resolvedMode: ModeId = !project
  ? (mode || 'tech')
  : project.mode !== mode && !project.secondaryModes?.includes(mode)
  ? (project.mode || 'tech')
  : (mode || 'tech');
```
When `resolvedMode === 'tech'`:
- The component must return `<DiamondArtifactGlyph ... />`.
- When `resolvedMode === 'medical'` or `'academic'`:
  - The component renders `<Image src={MODE_ICON_MAP[resolvedMode]} ... />`.

### 3.2 Index Resolution & Fallback Strategy
To guarantee determinism even when a consumer omits the `index` prop:
```typescript
const resolvedIndex: number =
  typeof index === 'number'
    ? index
    : project
    ? Math.max(0, PORTFOLIO_PROJECTS.findIndex((p) => p.id === project.id))
    : 0;
```
If `index` is passed: uses `index`.  
If `index` is omitted but `project` is provided: looks up the project's ordinal position in `PORTFOLIO_PROJECTS`.  
If neither: safely defaults to `0`.

---

## 4. Consumer Audit & Verification Matrix

| Consumer Component | Location | Current State | Required Update | Verified Invariant |
|-------------------|----------|---------------|-----------------|--------------------|
| `src/components/hero.tsx` (Mobile Card) | lines 198–203 | `<ProjectModeIcon mode={activeMode} project={currentHeroProject} className="w-6 h-6 object-contain" priority />` | Pass `index={activeSlideIndex % heroSlides.length}` | Shape strictly tracks active slide selection |
| `src/components/hero.tsx` (Desktop Carousel) | lines 348–353 | `<ProjectModeIcon mode={activeMode} project={slideProj} className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" priority={idx === 0} />` | Pass `index={idx}` | Slide 0 = Sphere, Slide 1 = Octahedron, Slide 2 = Column |
| `src/components/projects.tsx` (Grid Cards) | lines 287–291 | `<ProjectModeIcon mode={activeMode} project={project} className="w-full h-full object-contain drop-shadow" />` | Pass `index={idx}` | Alternating 3-shape pattern across gallery columns |
| `src/components/project-modal.tsx` (Header) | lines 95–115 | Renders plain text title and category badge; no mode icon | Optionally embed `ProjectModeIcon` with `mode={modeConfig.id}` and `project={project}` | Consistent brand presence across modal and cards |

---

## 5. Exact Implementation Plan for Worker

### 5.1 File 1: `src/components/geometric-glyphs.tsx`
**Goal:** Make `DiamondArtifactGlyph` robust against spaces/ampersands in `visualType`, eliminate DOM ID collisions via `useId()`, and support `className`, `style`, `role`, and `aria-label`.

```tsx
<<<<
export const DiamondArtifactGlyph: React.FC<{
  visualType: Project['visualType'];
  index: number;
  isActive?: boolean;
}> = ({ visualType, index }) => {
  if (index % 3 === 0) {
    return (
      <svg viewBox="0 0 80 80" className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-md">
        <defs>
          <linearGradient id={`chrome-${visualType}-${index}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="45%" stopColor="#64748b" />
            <stop offset="75%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        <ellipse cx="42" cy="67" rx="16" ry="4" fill="rgba(15,23,42,0.28)" />
        <path
          d="M38 12 C52 14, 56 28, 46 38 C58 46, 54 62, 38 64 C24 62, 24 46, 34 36 C24 26, 28 14, 38 12 Z"
          fill={`url(#chrome-${visualType}-${index})`}
          stroke="#e2e8f0"
          strokeWidth="1.2"
        />
        <circle cx="37" cy="25" r="5" fill="#ffffff" fillOpacity="0.65" />
        <path d="M32 48 Q40 56 47 46" stroke="#94a3b8" strokeWidth="2" fill="none" />
      </svg>
    );
  }
  if (index % 3 === 1) {
    return (
      <svg viewBox="0 0 80 80" className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-md">
        <ellipse cx="40" cy="64" rx="22" ry="5" fill="rgba(15,23,42,0.25)" />
        <polygon points="40,20 66,34 40,48 14,34" fill="#fbcfe8" stroke="#f9a8d4" strokeWidth="1" />
        <polygon points="14,34 40,48 40,60 14,46" fill="#f472b6" />
        <polygon points="66,34 40,48 40,60 66,46" fill="#db2777" />
        <polygon points="40,25 55,33 40,41 25,33" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 80" className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-md">
      <defs>
        <linearGradient id={`holo-${visualType}-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id={`holo-side-${visualType}-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <ellipse cx="42" cy="67" rx="14" ry="4" fill="rgba(15,23,42,0.28)" />
      <polygon points="38,14 58,22 44,30 24,22" fill="#e0f2fe" />
      <polygon points="24,22 44,30 44,58 24,50" fill={`url(#holo-${visualType}-${index})`} />
      <polygon points="44,30 58,22 58,50 44,58" fill={`url(#holo-side-${visualType}-${index})`} />
      <rect x="40" y="56" width="4" height="8" rx="1.5" fill="#334155" />
    </svg>
  );
};
====
export const DiamondArtifactGlyph: React.FC<{
  visualType?: Project['visualType'] | string;
  index?: number;
  isActive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  role?: string;
}> = ({
  visualType = 'artifact',
  index = 0,
  className = 'w-12 h-12 sm:w-16 sm:h-16 drop-shadow-md',
  style,
  'aria-label': ariaLabel,
  role,
}) => {
  const reactId = React.useId().replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeType = String(visualType || 'artifact').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const chromeGradId = `chrome-${safeType}-${index}-${reactId}`;
  const holoGradId = `holo-${safeType}-${index}-${reactId}`;
  const holoSideGradId = `holo-side-${safeType}-${index}-${reactId}`;

  const normIndex = Math.abs(Math.floor(index));

  if (normIndex % 3 === 0) {
    return (
      <svg
        viewBox="0 0 80 80"
        className={className}
        style={style}
        role={role}
        aria-label={ariaLabel}
      >
        <defs>
          <linearGradient id={chromeGradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="45%" stopColor="#64748b" />
            <stop offset="75%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        <ellipse cx="42" cy="67" rx="16" ry="4" fill="rgba(15,23,42,0.28)" />
        <path
          d="M38 12 C52 14, 56 28, 46 38 C58 46, 54 62, 38 64 C24 62, 24 46, 34 36 C24 26, 28 14, 38 12 Z"
          fill={`url(#${chromeGradId})`}
          stroke="#e2e8f0"
          strokeWidth="1.2"
        />
        <circle cx="37" cy="25" r="5" fill="#ffffff" fillOpacity="0.65" />
        <path d="M32 48 Q40 56 47 46" stroke="#94a3b8" strokeWidth="2" fill="none" />
      </svg>
    );
  }
  if (normIndex % 3 === 1) {
    return (
      <svg
        viewBox="0 0 80 80"
        className={className}
        style={style}
        role={role}
        aria-label={ariaLabel}
      >
        <ellipse cx="40" cy="64" rx="22" ry="5" fill="rgba(15,23,42,0.25)" />
        <polygon points="40,20 66,34 40,48 14,34" fill="#fbcfe8" stroke="#f9a8d4" strokeWidth="1" />
        <polygon points="14,34 40,48 40,60 14,46" fill="#f472b6" />
        <polygon points="66,34 40,48 40,60 66,46" fill="#db2777" />
        <polygon points="40,25 55,33 40,41 25,33" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      style={style}
      role={role}
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id={holoGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id={holoSideGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <ellipse cx="42" cy="67" rx="14" ry="4" fill="rgba(15,23,42,0.28)" />
      <polygon points="38,14 58,22 44,30 24,22" fill="#e0f2fe" />
      <polygon points="24,22 44,30 44,58 24,50" fill={`url(#${holoGradId})`} />
      <polygon points="44,30 58,22 58,50 44,58" fill={`url(#${holoSideGradId})`} />
      <rect x="40" y="56" width="4" height="8" rx="1.5" fill="#334155" />
    </svg>
  );
};
>>>>
```

### 5.2 File 2: `src/components/project-mode-icon.tsx`
**Goal:** Support `index?: number` in props, import `DiamondArtifactGlyph` and `PORTFOLIO_PROJECTS`, and dynamically branch on `resolvedMode === 'tech'`.

```tsx
<<<<
import React from 'react';
import Image, { StaticImageData } from 'next/image';
import { ModeId, Project } from '@/data/portfolio-data';
====
import React from 'react';
import Image, { StaticImageData } from 'next/image';
import { ModeId, Project, PORTFOLIO_PROJECTS } from '@/data/portfolio-data';
import { DiamondArtifactGlyph } from './geometric-glyphs';
>>>>
```

And in `ProjectModeIconProps`:
```tsx
<<<<
export interface ProjectModeIconProps {
  /** Current active portfolio mode ('tech' | 'medical' | 'academic') */
  mode: ModeId;
  /**
   * Optional project reference.
   * If provided and project does not support `mode`, falls back to `project.mode`.
   */
  project?: Project | null;
  /** Custom CSS classes for sizing, drop-shadow, filter, transitions, etc. */
  className?: string;
  /** Inline CSS style overrides */
  style?: React.CSSProperties;
  /** Accessible alt description */
  alt?: string;
  /** Natural pixel width for layout reservation (default: 48) */
  width?: number;
  /** Natural pixel height for layout reservation (default: 48) */
  height?: number;
  /** Priority preload */
  priority?: boolean;
}
====
export interface ProjectModeIconProps {
  /** Current active portfolio mode ('tech' | 'medical' | 'academic') */
  mode: ModeId;
  /**
   * Optional project reference.
   * If provided and project does not support `mode`, falls back to `project.mode`.
   */
  project?: Project | null;
  /**
   * Optional zero-based index of the item (e.g. in grid or carousel).
   * Used by tech mode geometric glyphs to deterministically pick 1 of 3 procedural shapes.
   * If omitted, attempts to resolve from PORTFOLIO_PROJECTS or defaults to 0.
   */
  index?: number;
  /** Custom CSS classes for sizing, drop-shadow, filter, transitions, etc. */
  className?: string;
  /** Inline CSS style overrides */
  style?: React.CSSProperties;
  /** Accessible alt description */
  alt?: string;
  /** Natural pixel width for layout reservation (default: 48) */
  width?: number;
  /** Natural pixel height for layout reservation (default: 48) */
  height?: number;
  /** Priority preload */
  priority?: boolean;
}
>>>>
```

And in the component body:
```tsx
<<<<
export const ProjectModeIcon: React.FC<ProjectModeIconProps> = ({
  mode,
  project,
  className = 'w-8 h-8 object-contain drop-shadow',
  style,
  alt,
  width = 48,
  height = 48,
  priority = false,
}) => {
  // 1. Dynamic multi-mode resolution with defensive fallback
  const resolvedMode: ModeId = !project
    ? (mode || 'tech')
    : project.mode !== mode && !project.secondaryModes?.includes(mode)
    ? (project.mode || 'tech')
    : (mode || 'tech');

  // 2. Select asset
  const iconAsset = MODE_ICON_MAP[resolvedMode] || MODE_ICON_MAP.tech;
  const accessibleAlt =
    alt ||
    (project && project.title
      ? `${project.title} — Logo Mode ${MODE_LABELS[resolvedMode] || MODE_LABELS.tech}`
      : `Logo Mode ${MODE_LABELS[resolvedMode] || MODE_LABELS.tech}`);


  return (
    <Image
      src={iconAsset}
      alt={accessibleAlt}
      width={width}
      height={height}
      className={`transition-all duration-300 ${className}`}
      style={style}
      priority={priority}
      unoptimized
    />
  );
};
====
export const ProjectModeIcon: React.FC<ProjectModeIconProps> = ({
  mode,
  project,
  index,
  className = 'w-8 h-8 object-contain drop-shadow',
  style,
  alt,
  width = 48,
  height = 48,
  priority = false,
}) => {
  // 1. Dynamic multi-mode resolution with defensive fallback
  const resolvedMode: ModeId = !project
    ? (mode || 'tech')
    : project.mode !== mode && !project.secondaryModes?.includes(mode)
    ? (project.mode || 'tech')
    : (mode || 'tech');

  const accessibleAlt =
    alt ||
    (project && project.title
      ? `${project.title} — Logo Mode ${MODE_LABELS[resolvedMode] || MODE_LABELS.tech}`
      : `Logo Mode ${MODE_LABELS[resolvedMode] || MODE_LABELS.tech}`);

  // 2. Resolve deterministic index for procedural geometric glyphs
  const resolvedIndex: number =
    typeof index === 'number'
      ? index
      : project
      ? Math.max(0, PORTFOLIO_PROJECTS.findIndex((p) => p.id === project.id))
      : 0;

  // 3. For Tech mode, render the authentic restored DiamondArtifactGlyph
  if (resolvedMode === 'tech') {
    return (
      <DiamondArtifactGlyph
        visualType={project?.visualType || 'artifact'}
        index={resolvedIndex}
        className={`transition-all duration-300 ${className}`}
        style={style}
        role="img"
        aria-label={accessibleAlt}
      />
    );
  }

  // 4. Select asset for Medical / Academic modes
  const iconAsset = MODE_ICON_MAP[resolvedMode] || MODE_ICON_MAP.tech;

  return (
    <Image
      src={iconAsset}
      alt={accessibleAlt}
      width={width}
      height={height}
      className={`transition-all duration-300 ${className}`}
      style={style}
      priority={priority}
      unoptimized
    />
  );
};
>>>>
```

### 5.3 File 3: `src/components/hero.tsx`
**Goal:** Pass `index` explicitly to both mobile and desktop preview cards.

Lines 198–203:
```tsx
<<<<
                    <ProjectModeIcon
                      mode={activeMode}
                      project={currentHeroProject}
                      className="w-6 h-6 object-contain"
                      priority
                    />
====
                    <ProjectModeIcon
                      mode={activeMode}
                      project={currentHeroProject}
                      index={((activeSlideIndex % heroSlides.length) + heroSlides.length) % heroSlides.length}
                      className="w-6 h-6 object-contain"
                      priority
                    />
>>>>
```

Lines 348–354:
```tsx
<<<<
                          <ProjectModeIcon
                            mode={activeMode}
                            project={slideProj}
                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                            priority={idx === 0}
                          />
====
                          <ProjectModeIcon
                            mode={activeMode}
                            project={slideProj}
                            index={idx}
                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                            priority={idx === 0}
                          />
>>>>
```

### 5.4 File 4: `src/components/projects.tsx`
**Goal:** Pass `index={idx}` to each project card in the grid.

Lines 287–292:
```tsx
<<<<
                      <div className="shrink-0 w-12 h-12 p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                        <ProjectModeIcon
                          mode={activeMode}
                          project={project}
                          className="w-full h-full object-contain drop-shadow"
                        />
                      </div>
====
                      <div className="shrink-0 w-12 h-12 p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                        <ProjectModeIcon
                          mode={activeMode}
                          project={project}
                          index={idx}
                          className="w-full h-full object-contain drop-shadow"
                        />
                      </div>
>>>>
```

### 5.5 File 5: `src/components/project-modal.tsx` (Verification & Optional Header Brand Icon)
In `src/components/project-modal.tsx`, the component receives `project` and `modeConfig`.
If desired to reinforce visual identity inside the modal header alongside the title, Worker can optionally include:
```tsx
<ProjectModeIcon
  mode={modeConfig.id}
  project={project}
  className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow shrink-0"
/>
```
Or verify that `project-modal.tsx` metadata pill ribbon displays `{project.visualType || '-'}` smoothly without errors.

---

## 6. Verification Methods & Acceptance Gate

After Worker applies these changes:
1. **Type Safety & Build Integrity**:
   - `cmd /c npm run typecheck`: Must complete with exit code 0 and zero TypeScript diagnostic errors.
   - `cmd /c npm run lint`: Must complete without linting errors.
   - `cmd /c npm run build`: Next.js static export must build cleanly into `out/`.
2. **E2E Test Suites**:
   - `node tests/e2e/runner.mjs`: All 61 tests across Tiers 1–4 must continue to pass (100% pass rate).
   - `node tests/e2e/tier5-adversarial-m1.test.mjs`: Must pass cleanly.
3. **Deterministic Visual Inspection**:
   - Switch to **Tech Mode** (`?mode=tech`).
   - Verify Project card 0 in Projects gallery renders the **Liquid Chrome Sphere**.
   - Verify Project card 1 renders the **Crystal Octahedron**.
   - Verify Project card 2 renders the **Holographic Crystal Column**.
   - Verify Hero desktop preview cards render shapes 0, 1, 2 for slides 1, 2, 3.
   - Verify no SVG gradients turn black or disappear when toggling between slides.
   - Switch to **Medical Mode**: Cards must render `/icons/project-medical.svg`.
   - Switch to **Academic Mode**: Cards must render `/icons/project-academic.svg`.
