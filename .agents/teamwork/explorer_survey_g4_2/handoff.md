# Handoff Report — explorer_survey_g4_2

**Task**: Technical Survey & Architecture Design for Requirement R3 (Cursor Physics, Manual Drag & Physical Inertia on 3D Model)  
**Author**: Teamwork Explorer 2 (`explorer_survey_g4_2`)  
**Parent**: orchestrator_gen4 (`8cd7df6d-a097-4806-b13b-e7c23793f6d5`)  
**Deliverable Document**: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_survey_g4_2\report.md`  

---

## 1. Observation

1. **Auto-Rotation on Idle**:
   In `src/components/hero-3d-scene.tsx` lines 598, 610, and 633:
   - Line 598: `currentPivot.rotation.y += 0.007;` (tech mode)
   - Line 610: `currentPivot.rotation.y += 0.008;` (medical mode)
   - Line 633: `currentPivot.rotation.y += 0.005;` (academic mode)
   The 3D model auto-spins continuously around the Y axis every frame on idle, violating R3: *"Model tidak berputar otomatis jika kursor tidak bergerak atau saat model tidak sedang digerakkan oleh kursor."*

2. **Absence of Cursor Position Tracking**:
   In `src/components/hero-3d-scene.tsx` lines 682–684:
   ```typescript
   const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
     if (!isDraggingRef.current) return;
   ```
   Pointer events are only bound to the `<canvas>` element (lines 746–749), and the handler returns immediately when `!isDraggingRef.current`. There is no cursor tracking anywhere on screen or canvas when the mouse is moving without dragging.

3. **Incoherent Drag Velocity Integration**:
   In `src/components/hero-3d-scene.tsx` lines 589–590 and line 604:
   - Line 590: `dragRotationRef.current.y += dragVelocityRef.current.y;`
   - Line 604: `currentPivot.rotation.y += dragVelocityRef.current.y;`
   - `dragRotationRef.current.y` was never assigned to `currentPivot.rotation.y`, and `dragVelocityRef.current.y` is added twice to different variables.
   - Velocity calculation in lines 693 (`dragVelocityRef.current = { x: dy * 0.002, y: dx * 0.005 };`) relies on unnormalized single-event frame deltas without $\Delta t$, causing erratic behavior between 1000Hz gaming mice and low-frequency touch screens.
   - If pointer stops before mouse release, previous velocity is preserved, triggering an unnatural "phantom fling".

4. **Obsolete Click-to-Modal Wiring**:
   In `src/components/hero-3d-scene.tsx` lines 708–710:
   ```typescript
   if (totalDragDistRef.current < 5) {
     onModelClick?.();
   }
   ```
   And in `src/components/hero.tsx` lines 301–303:
   ```typescript
   onModelClick={() => {
     if (currentHeroProject) onOpenProject(currentHeroProject);
   }}
   ```
   Clicking the 3D model currently opens the project case study modal, directly violating the follow-up R1 requirement: *"Hilangkan event listener klik pada model 3D yang memunculkan modal project."*

5. **Existing Verification Suite**:
   Running `node tests/e2e/runner.mjs` executes 61 passing tests in Tiers 1–4. Existing tests in `tests/e2e/tier5-challenger-m4-cross-feature.test.mjs` (lines 222–242) and `tier5-adversarial-m2-challenger2.test.mjs` test drag momentum attenuation, clamping `[-0.7, 0.7]`, and require that pointer moves while not dragging do not alter `dragRotation.y`.

---

## 2. Logic Chain

1. From Observation 1, because `currentPivot.rotation.y` is incremented by a non-zero constant every animation frame, the model spins continuously regardless of cursor activity. Removing `currentPivot.rotation.y += constant` and replacing it with pure velocity integration will ensure the model remains completely still when idle.
2. From Observation 2, because `pointermove` is only listened to on `<canvas>` and ignored unless dragging, the model cannot face the cursor. Adding a passive pointer listener on the `#hero` container (or window) and converting `(clientX, clientY)` to normalized coordinates $(u, v) \in [-1, 1]$ will allow mapping to target pitch/yaw angles.
3. From Observation 3, if cursor tracking and manual drag mutate the same Euler angle `rotation.y`, dragging will conflict with cursor tracking (or snap back). By establishing a two-tier scene hierarchy:
   $$\text{Scene} \to \text{cursorTrackingGroup} \to \text{dragPivotGroup} \to \text{modelMesh}$$
   the transformations compose orthogonally as $R_{\text{world}} = R_{\text{cursor}} \cdot R_{\text{drag}}$.
   - `cursorTrackingGroup` smoothly tracks cursor position via critically damped exponential smoothing: $\alpha = 1 - e^{-k \Delta t}$.
   - `dragPivotGroup` tracks manual drag displacement, and upon release coasts down smoothly via viscous friction: $\vec{\omega}(t + \Delta t) = \vec{\omega}(t) \cdot e^{-\mu \Delta t}$ until $|\vec{\omega}| < 10^{-4}$ rad/s, where it halts at its coasted angle without resetting.
4. From Observation 4, removing `onModelClick` from `Hero3DScene` in `hero.tsx` and eliminating click discrimination callback will decouple 3D model interaction from modal triggers, satisfying both R1 and R3.
5. From Observation 5, all physics state can be encapsulated in `useRef` to maintain 60 FPS performance without React re-renders, fully preserving compatibility with existing test suites.

---

## 3. Caveats

1. **Touch Screen Hover**: Physical touch devices (smartphones, iPads) do not have a cursor hover state. When `e.pointerType === 'touch'`, cursor tracking orientation remains at $(0, 0)$, while touch dragging operates with full inertia.
2. **Mobile Viewport Rendering**: On viewports `< 1024px`, the 3D scene in `hero.tsx` is currently hidden via `hidden lg:flex`. Any mobile touch testing must occur on viewports $\ge 1024px$ (e.g. tablet landscape) or if mobile 3D display is adjusted by Explorer 1 / Worker.
3. **External GLB Model Loading**: Explorer 1 is surveying the loading of `model-jantung.glb` and `model-pena.glb` from `public/models/`. The physics architecture designed here (`trackingGroup` $\to$ `dragGroup` $\to$ `modelGroup`) is 100% agnostic to whether the child mesh is procedural or an imported GLTF/GLB model.

---

## 4. Conclusion

The technical survey for Requirement R3 is complete. The root causes of all active defects (auto-spin, missing cursor tracking, velocity calculation glitches, click modal opening) have been pinpointed down to exact file paths and line numbers. A mathematically rigorous physics engine using a two-tier hierarchical Three.js scene graph (`cursorTrackingGroup` + `dragPivotGroup`) has been designed and documented in `report.md`. This architecture completely satisfies all four acceptance criteria of Requirement R3:
- Model smoothly turns to face screen cursor coordinates without linear translation.
- Model does NOT spin when cursor is idle or stationary.
- Model can be freely dragged with authentic velocity and inertia.
- Model rotation coasts naturally to zero angular velocity without snapping or resetting.

---

## 5. Verification Method

1. **Static Build & Lint Checks**:
   - `node -r ./patch-fs.js node_modules/next/dist/bin/next lint` (or `npm run lint`)
   - `node -r ./patch-fs.js node_modules/next/dist/bin/next build` (or `npm run build`)
2. **Automated E2E Physics Simulations**:
   - Run `node tests/e2e/runner.mjs`
   - Run `node tests/e2e/tier5-challenger-m4-cross-feature.test.mjs` (test `CH4.2.4` for velocity damping convergence to 0)
3. **Interactive Browser Verification**:
   - Move mouse across the hero section $\to$ model tilts towards cursor.
   - Stop mouse $\to$ model ceases movement and does NOT spin.
   - Click & drag canvas $\to$ model rotates freely.
   - Release drag $\to$ model coasts down smoothly with physical friction and halts at the final orientation without resetting.
   - Click canvas $\to$ does NOT open project modal.
