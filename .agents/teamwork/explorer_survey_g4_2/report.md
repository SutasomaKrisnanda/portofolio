# Technical Survey Report: Cursor Physics, Manual Drag & Inertia on 3D Model (Requirement R3)

**Author**: Teamwork Explorer 2 (`explorer_survey_g4_2`)  
**Mission**: Technical Investigation, Mathematical Formulation, and Architecture Design for Requirement R3  
**Date**: 2026-11-10  
**Target File**: `src/components/hero-3d-scene.tsx` (and `src/components/hero.tsx`, `src/components/crystal-canvas.tsx`)  
**Workspace**: `w:\home\krisnanda\Code\Project\Personal - github\portofolio`  

---

## 1. Executive Summary

Requirement R3 of the follow-up specification (`ORIGINAL_REQUEST.md`, 2026-11-10T12:37:00Z) mandates a complete physics overhaul of the 3D model interaction in the Hero section:
1. **Physical Cursor Tracking**: The 3D model must smoothly track the user's cursor position across the screen, orienting and tilting towards the cursor coordinates without translating or drifting from its fixed spatial anchor.
2. **Elimination of Idle Auto-Spin**: Constant automatic rotation (`rotation.y += constant`) while the cursor is stationary or absent must be completely disabled. The model must remain still when there is no active input.
3. **Manual Drag & Authentic Physical Inertia**: Users can click/touch and drag to rotate the model freely. When the drag is released, rotation momentum must decay smoothly via authentic friction damping to zero angular velocity, without snapping, jerking, or resetting to default orientation.
4. **Touch & Mouse Coexistence**: Seamless support for both desktop mouse cursors and mobile/tablet touch screens, eliminating scroll conflicts and pointer focus drops.

This survey establishes the complete mathematical model, scene hierarchy, event handling strategy, and React 19 / Three.js 60 FPS performance guarantees necessary for implementation.

---

## 2. Codebase Audit of Current 3D Implementation

### 2.1 File Map & Responsibilities

| File Path | Role | Current Status Regarding R3 |
|---|---|---|
| `src/components/hero-3d-scene.tsx` | Main Three.js WebGL canvas rendering 3D models | **Deficient**: Has constant auto-rotation, lacks cursor position tracking, has broken velocity accumulation, and fires obsolete modal click callback. |
| `src/components/hero.tsx` | Hero section spatial stage and parent of 3D scene | **Deficient**: Contains an expensive `onMouseMove` handler updating React state (`setHeroParallax`), but does not pass pointer data to `Hero3DScene`. Passes `onModelClick` which triggers project modal. |
| `src/components/crystal-canvas.tsx` | Fallback 2D canvas for WebGL-disabled devices | Has hardcoded continuous spin (`vy += (0.0075 - vy) * 0.05`). |

---

### 2.2 Deep-Dive into Current Defects in `hero-3d-scene.tsx`

#### Defect 1: Hardcoded Continuous Auto-Rotation on Idle
In `src/components/hero-3d-scene.tsx` (lines 598, 610, 633):
```typescript
// Current render loop in hero-3d-scene.tsx
if (activeMode === 'tech') {
  if (!prefersReducedMotion) {
    currentPivot.rotation.y += 0.007; // <--- CONSTANT AUTO-ROTATION BUG
    currentPivot.rotation.x = Math.sin(elapsedTime * 0.8) * 0.04 + dragRotationRef.current.x;
    currentPivot.position.y = Math.sin(elapsedTime * 1.5) * 0.05;
  }
  currentPivot.rotation.y += dragVelocityRef.current.y;
} else if (activeMode === 'medical') {
  // ...
  currentPivot.rotation.y += 0.008; // <--- CONSTANT AUTO-ROTATION BUG
  // ...
} else if (activeMode === 'academic') {
  // ...
  currentPivot.rotation.y += 0.005; // <--- CONSTANT AUTO-ROTATION BUG
}
```
*Violation*: The model spins indefinitely around the Y-axis even if the mouse is completely motionless or outside the browser window. Requirement R3 explicitly states:
> *"Model tidak berputar otomatis jika kursor tidak bergerak atau saat model tidak sedang digerakkan oleh kursor."*
> *"Model 3D tidak berotasi konstan saat kursor diam atau ketika tidak sedang digerakkan."*

#### Defect 2: Complete Absence of Cursor Position Tracking
In `hero-3d-scene.tsx` lines 682–684:
```typescript
const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
  if (!isDraggingRef.current) return; // <--- Completely ignores cursor hover movement!
  // ...
};
```
- Pointer event listeners are attached *only* to the `<canvas>` element (`w-[320px] ... lg:w-[480px]`), so moving the cursor across the surrounding Hero section or page never fires events on the canvas.
- Even when moving inside the canvas bounds, the handler immediately returns when `!isDraggingRef.current`.
- As a result, the model is completely blind to cursor position and does not orient towards the pointer at all.

#### Defect 3: Incoherent Drag Velocity Integration & State Duplication
In `hero-3d-scene.tsx`:
```typescript
// In handlePointerMove (lines 688-693):
dragRotationRef.current.x = Math.max(-0.7, Math.min(0.7, dragRotationRef.current.x + dy * 0.008));
dragRotationRef.current.y += dx * 0.008;
dragVelocityRef.current = { x: dy * 0.002, y: dx * 0.005 };

// In animate loop (lines 585-590):
dragRotationRef.current.x = Math.max(-0.7, Math.min(0.7, dragRotationRef.current.x + dragVelocityRef.current.x));
dragRotationRef.current.y += dragVelocityRef.current.y;

// In mode update (line 604):
currentPivot.rotation.y += dragVelocityRef.current.y;
```
*Analysis of bugs*:
1. `dragVelocityRef.current.y` is added **twice**: once to `dragRotationRef.current.y` (line 590), and then again directly to `currentPivot.rotation.y` (line 604).
2. `dragRotationRef.current.y` was never assigned to `currentPivot.rotation.y`. Instead, `currentPivot.rotation.y` was just continuously incremented by auto-rotation plus the second velocity addition.
3. Velocity was calculated from instantaneous pixel delta `(dx, dy)` between sporadic pointer events without factoring in elapsed time $\Delta t$. High-frequency gaming mice (1000Hz) produced tiny velocities, while low-frequency touch screens produced massive velocity spikes.
4. If a user dragged and paused their finger/mouse before releasing, `lastPointerPos` remained static, but `dragVelocityRef` retained the velocity from previous movement, resulting in an unnatural "phantom fling" on release.

#### Defect 4: Obsolete Click-to-Modal Event
In `hero-3d-scene.tsx` (lines 708–710) and `hero.tsx` (lines 301–303):
```typescript
// hero-3d-scene.tsx
if (totalDragDistRef.current < 5) {
  onModelClick?.();
}
// hero.tsx
<Hero3DScene ... onModelClick={() => { if (currentHeroProject) onOpenProject(currentHeroProject); }} />
```
*Violation*: Clicking or tapping on the 3D canvas pops open the project case study modal. The new specification explicitly states:
> *"Hilangkan event listener klik pada model 3D yang memunculkan modal project."*
> Acceptance Criteria: *"Mengklik model 3D tidak lagi membuka modal project."*

---

## 3. Mathematical Physics Specification

### 3.1 Normalized Cursor Coordinates

Let the tracking container (Hero section or viewport) have width $W$, height $H$, and top-left coordinates $(x_0, y_0)$.  
For a pointer event at client coordinates $(X, Y)$:

$$u = \text{clamp}\left(\frac{X - (x_0 + W/2)}{W/2}, -1.0, 1.0\right)$$
$$v = \text{clamp}\left(\frac{Y - (y_0 + H/2)}{H/2}, -1.0, 1.0\right)$$

- $u \in [-1.0, +1.0]$: Horizontal offset ($-1$ = far left, $+1$ = far right, $0$ = center).
- $v \in [-1.0, +1.0]$: Vertical offset ($-1$ = top, $+1$ = bottom, $0$ = center).

If the cursor leaves the window or section:
$$(u_{\text{target}}, v_{\text{target}}) \to (0, 0)$$

---

### 3.2 Target Tracking Angles & Critical Damping

#### Target Orientation Mapping:
- **Yaw (Rotation around Y-axis)**: The model turns horizontally to face the cursor:
  $$\theta_{y,\text{target}} = u \cdot \Theta_{y,\max}$$
  where $\Theta_{y,\max} = 0.40 \text{ rad} \approx 23^\circ$.
- **Pitch (Rotation around X-axis)**: The model tilts vertically to face the cursor:
  $$\theta_{x,\text{target}} = v \cdot \Theta_{x,\max}$$
  where $\Theta_{x,\max} = 0.28 \text{ rad} \approx 16^\circ$.
- **Roll (Rotation around Z-axis)**: Subtle dynamic lean for authentic physical weight:
  $$\theta_{z,\text{target}} = -u \cdot 0.06 \text{ rad}$$

#### Frame-Rate Independent Exponential Smoothing:
To ensure silky, non-jittery tracking at variable refresh rates (60Hz, 120Hz, 144Hz):
Let $\Delta t$ be the elapsed frame delta in seconds, clamped to $\Delta t \le 0.05\text{ s}$.
Using exponential smoothing with tracking rate $k_{\text{track}} = 5.5 \text{ s}^{-1}$:

$$\alpha = 1.0 - e^{-k_{\text{track}} \Delta t}$$

$$\theta_x(t + \Delta t) = \theta_x(t) + (\theta_{x,\text{target}} - \theta_x(t)) \cdot \alpha$$
$$\theta_y(t + \Delta t) = \theta_y(t) + (\theta_{y,\text{target}} - \theta_y(t)) \cdot \alpha$$
$$\theta_z(t + \Delta t) = \theta_z(t) + (\theta_{z,\text{target}} - \theta_z(t)) \cdot \alpha$$

#### Spatial Anchor Invariance:
The model's position in 3D world space is strictly invariant to cursor movement:
$$\vec{p}(t) = (0, y_{\text{base}}, 0)$$
No translation or linear displacement is applied.

---

### 3.3 Manual Drag & Physical Inertia Math

#### Direct Rotational Integration (During Drag):
Let $(X_t, Y_t)$ and $(X_{t-1}, Y_{t-1})$ be successive pointer positions with time interval $\Delta t_p = T_t - T_{t-1} > 0$.
$$\Delta x = X_t - X_{t-1}, \quad \Delta y = Y_t - Y_{t-1}$$

Rotational sensitivity constants:
$$S_y = 0.0055 \text{ rad/px (horizontal drag to yaw)}$$
$$S_x = 0.0055 \text{ rad/px (vertical drag to pitch)}$$

Update drag orientation angles $\vec{\phi} = (\phi_x, \phi_y)$:
$$\phi_y \leftarrow \phi_y + \Delta x \cdot S_y$$
$$\phi_x \leftarrow \text{clamp}(\phi_x + \Delta y \cdot S_x, -\Phi_{x,\max}, +\Phi_{x,\max})$$
where $\Phi_{x,\max} = 0.70 \text{ rad} \approx 40.1^\circ$ (enforces pitch boundary to prevent model from flipping upside-down).

#### Instantaneous Angular Velocity Estimation:
Instantaneous velocity in radians per second:
$$\omega_{y,\text{inst}} = \frac{\Delta x \cdot S_y}{\Delta t_p}$$
$$\omega_{x,\text{inst}} = \frac{\Delta y \cdot S_x}{\Delta t_p}$$

Apply an Exponential Moving Average (EMA) with smoothing weight $\beta = 0.45$ to eliminate micro-jitter while tracking gesture momentum:
$$\omega_y \leftarrow \omega_y \cdot (1 - \beta) + \omega_{y,\text{inst}} \cdot \beta$$
$$\omega_x \leftarrow \omega_x \cdot (1 - \beta) + \omega_{x,\text{inst}} \cdot \beta$$

Velocity clamp to prevent erratic spinning from mouse teleportation:
$$\omega_y \leftarrow \text{clamp}(\omega_y, -12.0, 12.0) \text{ rad/s}$$
$$\omega_x \leftarrow \text{clamp}(\omega_x, -8.0, 8.0) \text{ rad/s}$$

#### Release Idle Protection:
If the user holds the pointer stationary before releasing:
$$\text{If } (T_{\text{release}} - T_{\text{last\_move}}) > 60\text{ ms}: \quad \omega_x = 0, \quad \omega_y = 0$$

---

### 3.4 Coasting Phase & Exponential Friction Damping

When the drag is released (`isDragging = false`), the model enters the coasting inertia phase.

#### Viscous Damping Differential Equation:
$$\frac{d\vec{\omega}}{dt} = -\mu \vec{\omega}$$

Analytical integration across frame delta $\Delta t$:
$$\text{dampingFactor} = e^{-\mu \Delta t}$$
where friction coefficient $\mu = 3.2 \text{ s}^{-1}$ (corresponds to ~0.948 decay per 60Hz frame).

At each animation frame:
$$\omega_y(t + \Delta t) = \omega_y(t) \cdot e^{-\mu \Delta t}$$
$$\omega_x(t + \Delta t) = \omega_x(t) \cdot e^{-\mu \Delta t}$$

#### Orientation Update during Coasting:
$$\phi_y(t + \Delta t) = \phi_y(t) + \omega_y(t) \cdot \Delta t$$
$$\phi_x(t + \Delta t) = \text{clamp}(\phi_x(t) + \omega_x(t) \cdot \Delta t, -\Phi_{x,\max}, +\Phi_{x,\max})$$

If pitch $\phi_x$ collides with boundary ($\pm \Phi_{x,\max}$), angular velocity $\omega_x$ is zeroed:
$$\text{If } |\phi_x| \ge \Phi_{x,\max}: \quad \omega_x = 0$$

#### Epsilon Stopping Criterion:
To guarantee 100% convergence to complete rest without indefinite micro-calculations:
$$\text{If } |\omega_y| < 0.0001 \text{ rad/s and } |\omega_x| < 0.0001 \text{ rad/s}:$$
$$\omega_y = 0, \quad \omega_x = 0$$

Once at rest:
- **No snap-back**: The model stays exactly at its coasted angles $(\phi_x, \phi_y)$.
- **No auto-rotation**: $\vec{\omega} = (0, 0)$. Angular velocity remains 0 until the user drags again.

---

## 4. Scene Graph Architecture: Orthogonal Composition

A major challenge in combining cursor tracking and manual drag is avoiding state conflict (e.g. cursor tracking constantly trying to reset yaw back to 0 while user wants to examine the back of the model).

### Solution: Two-Tier Hierarchical Group Decomposition

In Three.js, nested `THREE.Group` objects naturally compose transformations via matrix multiplication:

```
THREE.Scene
  │
  └── cursorTrackingGroup (Spatial Anchor at (0, y_base, 0))
        │   Rotation: rx = θ_x(t), ry = θ_y(t), rz = θ_z(t)
        │   Controlled by: Smooth Cursor Tracking
        │
        └── dragPivotGroup
              │   Rotation: rx = φ_x(t), ry = φ_y(t), rz = 0
              │   Controlled by: Manual Drag & Inertia Coasting
              │
              └── modelMesh (Polyhedron / Heart / Quill)
                    Subtle procedural respiration / float offset
```

### Mathematical Proof of Independence:

The net world rotation matrix $R_{\text{world}}$ of `modelMesh` is:
$$R_{\text{world}} = R_{\text{cursor}}(\vec{\theta}) \cdot R_{\text{drag}}(\vec{\phi})$$

1. **Orthogonal State Spaces**:
   - `dragPivotGroup` retains the user's manual viewing angle $\vec{\phi}$ permanently. If the user rotates the model $180^\circ$ to look at the back, $\phi_y = \pi$ is preserved.
   - `cursorTrackingGroup` tilts the entire oriented assembly $\pm 20^\circ$ towards the viewer's current pointer position.
2. **Zero Snapping / Zero Conflict**:
   - When drag ends, $\vec{\phi}$ stays fixed.
   - When cursor stops moving, $\vec{\theta}$ reaches $(\theta_{x,\text{target}}, \theta_{y,\text{target}})$ and stops.
   - The combined assembly is completely motionless when idle.
3. **Zero Matrix Overhead**:
   Three.js handles group hierarchy natively in WebGL uniforms without extra CPU computations.

---

## 5. Touch vs Mouse Event Handling & Mobile Support

### 5.1 Unified PointerEvent Handling

| Interaction Aspect | Mouse Behavior | Touch Screen Behavior |
|---|---|---|
| **Hover / Movement** | Moves cursor across screen $\to$ triggers `cursorTrackingGroup` orientation. | No hover $\to$ cursor orientation remains centered $(0, 0)$. |
| **Drag Rotation** | Primary button click + drag $\to$ rotates `dragPivotGroup`. | Single finger touch + drag $\to$ rotates `dragPivotGroup`. |
| **Page Scrolling** | Browser scroll unaffected when pointer is outside canvas. | Prevented on canvas via `touch-action: none`. Page scrolls normally when touching outside canvas. |
| **Boundary Release** | Pointer capture keeps drag alive even if mouse exits canvas or browser window. | Pointer capture prevents loss of touch tracking during fast swipes. |

### 5.2 Pointer Capture Implementation
```typescript
const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
  // Only accept primary button (button === 0) or touch
  if (e.button !== 0 && e.pointerType === 'mouse') return;

  isDraggingRef.current = true;
  lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
  lastPointerTimeRef.current = performance.now();
  dragVelocityRef.current = { x: 0, y: 0 };

  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {
    // Graceful fallback for synthetic or test environments
  }
};
```

### 5.3 Mobile Viewport Strategy
In `src/components/hero.tsx`:
- Desktop ($\ge 1024$px): Full interactive WebGL 3D scene with cursor tracking and manual drag.
- Mobile (< 1024px): Currently hidden via `hidden lg:flex` to conserve mobile battery, CPU, and eliminate mobile scroll jank.
- If rendered on tablets/touch laptops (e.g. iPad Pro in landscape $\ge 1024$px):
  - `e.pointerType === 'touch'` enables touch dragging with inertia.
  - `touch-action: none` ensures no scroll-locking bugs.

---

## 6. Performance & React 19 Architectural Guarantees

### 6.1 Zero React Re-Renders
All dynamic physics variables must be stored strictly in `useRef` instances:
```typescript
// Dedicated physics refs (0 React re-renders during 60 FPS animation)
const cursorTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
const cursorCurrentRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
const isDraggingRef = useRef<boolean>(false);
const dragRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
const dragVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
const lastPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
const lastPointerTimeRef = useRef<number>(0);
```

### 6.2 Viewport Cursor Listener Setup & Teardown
To capture cursor movement across the entire hero section without re-rendering:
```typescript
useEffect(() => {
  const container = containerRef.current;
  const heroSection = container?.closest('#hero') || window;

  const handleGlobalPointerMove = (e: PointerEvent) => {
    // Only track hover if it's a mouse (not touch) and not currently dragging
    if (e.pointerType === 'touch' || isDraggingRef.current) return;

    const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const u = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth * 0.4)));
    const v = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight * 0.4)));

    cursorTargetRef.current = { x: u, y: v };
  };

  const handleGlobalPointerLeave = () => {
    cursorTargetRef.current = { x: 0, y: 0 };
  };

  heroSection.addEventListener('pointermove', handleGlobalPointerMove as EventListener, { passive: true });
  document.addEventListener('pointerleave', handleGlobalPointerLeave);

  return () => {
    heroSection.removeEventListener('pointermove', handleGlobalPointerMove as EventListener);
    document.removeEventListener('pointerleave', handleGlobalPointerLeave);
  };
}, []);
```

### 6.3 Reduced Motion Accessibility Compliance
```typescript
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Cursor tracking damped to 0, immediate velocity dissipation on release
  cursorTargetRef.current = { x: 0, y: 0 };
  dragVelocityRef.current = { x: 0, y: 0 };
}
```

---

## 7. Concrete Implementation Blueprint

### 7.1 Proposed Code Structure for `src/components/hero-3d-scene.tsx`

```typescript
// 1. Group Structure in Scene Setup:
const trackingGroup = new THREE.Group();
const dragGroup = new THREE.Group();
trackingGroup.add(dragGroup);
scene.add(trackingGroup);

// 2. Render Loop (animate function):
const animate = () => {
  animFrameId = requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05); // Frame-rate independent delta
  const elapsedTime = clock.getElapsedTime();

  // A. Coasting Inertia Phase (when not dragging)
  if (!isDraggingRef.current) {
    const decay = Math.exp(-3.2 * delta); // exponential friction decay
    dragVelocityRef.current.x *= decay;
    dragVelocityRef.current.y *= decay;

    // Zero cut-off threshold
    if (Math.abs(dragVelocityRef.current.x) < 0.0001) dragVelocityRef.current.x = 0;
    if (Math.abs(dragVelocityRef.current.y) < 0.0001) dragVelocityRef.current.y = 0;

    // Integrate velocity into drag rotation
    dragRotationRef.current.x = Math.max(
      -0.7,
      Math.min(0.7, dragRotationRef.current.x + dragVelocityRef.current.x * delta)
    );
    dragRotationRef.current.y += dragVelocityRef.current.y * delta;
  }

  // B. Smooth Cursor Tracking Integration
  const smoothingAlpha = 1.0 - Math.exp(-5.5 * delta);
  const targetPitch = cursorTargetRef.current.y * 0.28;
  const targetYaw = cursorTargetRef.current.x * 0.40;
  const targetRoll = -cursorTargetRef.current.x * 0.06;

  cursorCurrentRef.current.x += (targetPitch - cursorCurrentRef.current.x) * smoothingAlpha;
  cursorCurrentRef.current.y += (targetYaw - cursorCurrentRef.current.y) * smoothingAlpha;
  cursorCurrentRef.current.z += (targetRoll - cursorCurrentRef.current.z) * smoothingAlpha;

  // C. Apply Rotations to Group Hierarchy
  trackingGroup.rotation.set(
    cursorCurrentRef.current.x,
    cursorCurrentRef.current.y,
    cursorCurrentRef.current.z
  );

  dragGroup.rotation.set(
    dragRotationRef.current.x,
    dragRotationRef.current.y,
    0
  );

  // D. Subtle biological / thematic pulse or float (WITHOUT auto-rotation!)
  if (activePivotRef.current) {
    if (currentModeRef.current === 'tech') {
      // Subtle hovering breath on Y position only (NO rotation.y += constant)
      activePivotRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.04;
    } else if (currentModeRef.current === 'medical') {
      // Heartbeat pulse on scale
      const pulse = Math.sin(elapsedTime * 2.4) * 0.035;
      activePivotRef.current.scale.setScalar(activeBaseScaleRef.current * (1.0 + pulse));
    } else {
      // Quill floating levitation on Y position
      activePivotRef.current.position.y = Math.sin(elapsedTime * 1.6) * 0.05;
    }
  }

  rendererRef.current.render(sceneRef.current, cameraRef.current);
};
```

---

## 8. Verification & Test Plan

1. **Unit / Headless Math Test (`tests/e2e/tier5-challenger-m4-cross-feature.test.mjs`)**:
   - Verify that when `isDragging === false`, `dragVelocity` exponential damping strictly attenuates to exactly `(0, 0)`.
   - Verify pitch clamping within `[-0.7, 0.7]` radians.
   - Verify that cursor tracking angles strictly converge to target $(u, v)$ without accumulating unbounded rotation.
2. **Idle Rotation Test**:
   - Simulate 300 frames with static cursor and zero drag input.
   - Assert `dragGroup.rotation.y` delta is exactly 0 (no auto-spinning).
3. **Modal Click Suppression**:
   - Verify clicking canvas triggers 0 modal state transitions in `Hero`.
4. **Static Build & Lint**:
   - `npm run build` static export parity check.
   - `npm run lint` clean exit.

---
*End of Report.*
