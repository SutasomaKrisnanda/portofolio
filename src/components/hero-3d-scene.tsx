'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { ModeId } from '@/data/portfolio-data';
import { IridescentCrystalCanvas } from './crystal-canvas';

export interface Hero3DSceneProps {
  mode: ModeId;
  theme: 'dark' | 'light';
  activeSlideIndex?: number;
  baseHue?: number;
  secondaryHue?: number;
  onModelClick?: () => void;
  className?: string;
}

export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGL2RenderingContext && canvas.getContext('webgl2')
    ) || Boolean(
      window.WebGLRenderingContext && canvas.getContext('webgl')
    );
  } catch {
    return false;
  }
}

interface CachedModel {
  pivotGroup: THREE.Group;
  baseScale: number;
}

// Global in-memory cache for loaded scenes across mode switches
const modelSceneCache = new Map<ModeId, CachedModel>();
let isMeshoptInitialized = false;

async function getInitializedLoader(): Promise<GLTFLoader> {
  const loader = new GLTFLoader();
  if (!isMeshoptInitialized) {
    if (MeshoptDecoder.ready) {
      await MeshoptDecoder.ready;
    }
    isMeshoptInitialized = true;
  }
  loader.setMeshoptDecoder(MeshoptDecoder);
  return loader;
}

function normalizeAndPivotModel(
  modelScene: THREE.Object3D,
  targetSize: number = 2.85
): { pivotGroup: THREE.Group; baseScale: number } {
  // Compute bounding box
  const box = new THREE.Box3().setFromObject(modelScene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  // Center model origin at geometric center (0, 0, 0)
  modelScene.position.set(-center.x, -center.y, -center.z);

  // Compute uniform scale factor to match targetSize across all models
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? targetSize / maxDim : 1.0;

  const pivotGroup = new THREE.Group();
  pivotGroup.add(modelScene);
  pivotGroup.scale.setScalar(scale);

  return { pivotGroup, baseScale: scale };
}

function createTechPolyhedron(): { pivotGroup: THREE.Group; baseScale: number } {
  const pivotGroup = new THREE.Group();

  // Core crystal: Icosahedron with physical glass material (enlarged for prominent desktop presence)
  const innerGeo = new THREE.IcosahedronGeometry(1.35, 0);
  const innerMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.2,
    roughness: 0.12,
    metalness: 0.15,
    transmission: 0.6,
    ior: 1.5,
    thickness: 1.2,
    transparent: true,
    opacity: 0.9,
    reflectivity: 0.8
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  pivotGroup.add(innerMesh);

  // Outer wireframe cage
  const outerGeo = new THREE.IcosahedronGeometry(1.58, 0);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    wireframe: true,
    transparent: true,
    opacity: 0.45
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  pivotGroup.add(outerMesh);

  // Small floating orbital nodes
  const nodesGroup = new THREE.Group();
  const nodeGeo = new THREE.OctahedronGeometry(0.1, 0);
  const nodeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.8
  });
  for (let i = 0; i < 4; i++) {
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    const angle = (i / 4) * Math.PI * 2;
    node.position.set(Math.cos(angle) * 1.82, Math.sin(angle * 2) * 0.4, Math.sin(angle) * 1.82);
    nodesGroup.add(node);
  }
  pivotGroup.add(nodesGroup);

  return { pivotGroup, baseScale: 1.0 };
}

interface SceneLights {
  ambient: THREE.AmbientLight;
  key: THREE.DirectionalLight;
  fill: THREE.DirectionalLight;
  point: THREE.PointLight;
}

export const Hero3DScene: React.FC<Hero3DSceneProps> = ({
  mode,
  theme,
  activeSlideIndex = 0,
  baseHue = 200,
  secondaryHue = 220,
  onModelClick,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);
  const [isContextLost, setIsContextLost] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);

  // Three.js instances refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const lightsRef = useRef<SceneLights | null>(null);
  const activePivotRef = useRef<THREE.Group | null>(null);
  const activeBaseScaleRef = useRef<number>(1.0);

  // Mode and theme tracking refs
  const currentModeRef = useRef<ModeId>(mode);
  const currentThemeRef = useRef<'dark' | 'light'>(theme);

  // Interaction refs
  const isDraggingRef = useRef<boolean>(false);
  const pointerStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const totalDragDistRef = useRef<number>(0);
  const dragRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update refs when props change
  useEffect(() => {
    currentModeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    currentThemeRef.current = theme;
  }, [theme]);

  // Update lights on mode or theme change
  const updateLighting = useCallback((targetMode: ModeId, targetTheme: 'dark' | 'light') => {
    const lights = lightsRef.current;
    if (!lights) return;
    const isLight = targetTheme === 'light';

    if (targetMode === 'tech') {
      lights.ambient.color.set(isLight ? 0x93c5fd : 0x0c3e66);
      lights.ambient.intensity = isLight ? 1.2 : 0.9;
      lights.key.color.set(0x38bdf8);
      lights.key.intensity = 2.2;
      lights.key.position.set(3.0, 4.0, 3.0);
      lights.fill.color.set(0x1d4ed8);
      lights.fill.intensity = 1.0;
      lights.fill.position.set(-3.0, -2.0, -2.0);
      lights.point.color.set(0x38bdf8);
      lights.point.intensity = 1.2;
      lights.point.position.set(0, -1.2, 0);
    } else if (targetMode === 'medical') {
      lights.ambient.color.set(isLight ? 0xfed7aa : 0x4a0e17);
      lights.ambient.intensity = isLight ? 1.3 : 1.1;
      lights.key.color.set(0xff4d6d);
      lights.key.intensity = 2.4;
      lights.key.position.set(3.0, 3.5, 4.0);
      lights.fill.color.set(0xc084fc);
      lights.fill.intensity = 1.6;
      lights.fill.position.set(-3.5, 2.0, -3.0);
      lights.point.color.set(0xef4444);
      lights.point.intensity = 0.8;
      lights.point.position.set(0, 0, 0.8);
    } else {
      // academic
      lights.ambient.color.set(isLight ? 0xfef08a : 0x2e1065);
      lights.ambient.intensity = isLight ? 1.4 : 1.2;
      lights.key.color.set(0xfbbf24);
      lights.key.intensity = 2.6;
      lights.key.position.set(3.0, 4.0, 3.0);
      lights.fill.color.set(0xa855f7);
      lights.fill.intensity = 1.8;
      lights.fill.position.set(-3.0, 1.5, -2.5);
      lights.point.color.set(0xfef08a);
      lights.point.intensity = 0.9;
      lights.point.position.set(0, -1.0, 1.0);
    }
  }, []);

  // Switch model in Three.js scene
  const switchModel = useCallback(
    async (targetMode: ModeId) => {
      // Mobile optimization: Skip Three.js scene and model loading on mobile (< 1024px)
      if (typeof window !== 'undefined' && window.innerWidth < 1024) return;

      const scene = sceneRef.current;
      if (!scene) return;

      // Remove current active model from scene
      if (activePivotRef.current) {
        scene.remove(activePivotRef.current);
        activePivotRef.current = null;
      }

      // 1. Check in-memory cache first
      if (modelSceneCache.has(targetMode)) {
        const cached = modelSceneCache.get(targetMode)!;
        activePivotRef.current = cached.pivotGroup;
        activeBaseScaleRef.current = cached.baseScale;
        scene.add(cached.pivotGroup);
        setLoadingProgress(null);
        return;
      }

      // 2. Tech mode: procedural crystal (0 network bytes, instant render)
      if (targetMode === 'tech') {
        const { pivotGroup, baseScale } = createTechPolyhedron();
        modelSceneCache.set('tech', { pivotGroup, baseScale });
        activePivotRef.current = pivotGroup;
        activeBaseScaleRef.current = baseScale;
        scene.add(pivotGroup);
        setLoadingProgress(null);
        return;
      }

      // 3. Medical or Academic: Load GLB model from static public mirror
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      const modelFileName = targetMode === 'medical' ? 'model-jantung.glb' : 'model-quill.glb';
      const modelPath = `${basePath}/models/${modelFileName}`;

      const KNOWN_SIZES: Record<string, number> = {
        medical: 18_141_244,
        academic: 90_192_408
      };

      setLoadingProgress(0);

      try {
        const loader = await getInitializedLoader();

        loader.load(
          modelPath,
          (gltf) => {
            // Guard: ensure mode hasn't changed while loading
            if (currentModeRef.current !== targetMode) {
              const { pivotGroup, baseScale } = normalizeAndPivotModel(gltf.scene, 2.85);
              modelSceneCache.set(targetMode, { pivotGroup, baseScale });
              return;
            }

            const { pivotGroup, baseScale } = normalizeAndPivotModel(gltf.scene, 2.85);
            modelSceneCache.set(targetMode, { pivotGroup, baseScale });

            activePivotRef.current = pivotGroup;
            activeBaseScaleRef.current = baseScale;
            scene.add(pivotGroup);
            setLoadingProgress(null);
          },
          (xhr) => {
            const total = xhr.total || KNOWN_SIZES[targetMode] || 1;
            const percent = Math.min(99, Math.round((xhr.loaded / total) * 100));
            setLoadingProgress(percent);
          },
          (error) => {
            console.warn(`Failed to load GLB model for ${targetMode}, using fallback:`, error);
            // Fallback to procedural polyhedron if asset loading fails
            const { pivotGroup, baseScale } = createTechPolyhedron();
            activePivotRef.current = pivotGroup;
            activeBaseScaleRef.current = baseScale;
            scene.add(pivotGroup);
            setLoadingProgress(null);
          }
        );
      } catch (err) {
        console.warn('Error initializing GLTFLoader:', err);
        const { pivotGroup, baseScale } = createTechPolyhedron();
        activePivotRef.current = pivotGroup;
        activeBaseScaleRef.current = baseScale;
        scene.add(pivotGroup);
        setLoadingProgress(null);
      }
    },
    []
  );

  // Initialize Three.js scene & render loop
  useEffect(() => {
    if (!isWebGLAvailable()) {
      setWebGLSupported(false);
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Mobile optimization: Skip Three.js WebGL initialization entirely when on mobile screens (< 1024px)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return;
    }

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup: PerspectiveCamera with FOV 45
    const initialWidth = container.clientWidth || 480;
    const initialHeight = container.clientHeight || 500;
    const aspect = initialHeight > 0 ? initialWidth / initialHeight : 1;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.set(0, 0.15, 4.3);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. WebGLRenderer setup
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(initialWidth, initialHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      rendererRef.current = renderer;
    } catch (e) {
      console.warn('WebGLRenderer initialization failed:', e);
      setWebGLSupported(false);
      return;
    }

    // 4. Lights setup
    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    const fill = new THREE.DirectionalLight(0xffffff, 1.0);
    const point = new THREE.PointLight(0xffffff, 1.0, 10);
    scene.add(ambient);
    scene.add(key);
    scene.add(fill);
    scene.add(point);

    lightsRef.current = { ambient, key, fill, point };
    updateLighting(mode, theme);

    // 5. Initial model load
    switchModel(mode);

    // 6. Context loss event listeners
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setIsContextLost(true);
    };

    const handleContextRestored = () => {
      setIsContextLost(false);
      updateLighting(currentModeRef.current, currentThemeRef.current);
      switchModel(currentModeRef.current);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    // 7. ResizeObserver for responsive canvas & camera aspect recalculation
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width <= 0 || height <= 0) return;
        if (cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height, false);
        }
      }
    });
    resizeObserver.observe(container);

    // 8. Animation & Render Loop
    let animFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Check reduced motion preference
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Damping on drag velocities
      dragVelocityRef.current.x *= 0.92;
      dragVelocityRef.current.y *= 0.92;
      if (Math.abs(dragVelocityRef.current.x) < 0.00001) dragVelocityRef.current.x = 0;
      if (Math.abs(dragVelocityRef.current.y) < 0.00001) dragVelocityRef.current.y = 0;

      dragRotationRef.current.x = Math.max(
        -0.7,
        Math.min(0.7, dragRotationRef.current.x + dragVelocityRef.current.x)
      );
      dragRotationRef.current.y += dragVelocityRef.current.y;

      const currentPivot = activePivotRef.current;
      const currentBaseScale = activeBaseScaleRef.current;
      const activeMode = currentModeRef.current;

      if (currentPivot) {
        if (activeMode === 'tech') {
          if (!prefersReducedMotion) {
            currentPivot.rotation.y += 0.007;
            currentPivot.rotation.x = Math.sin(elapsedTime * 0.8) * 0.04 + dragRotationRef.current.x;
            currentPivot.position.y = Math.sin(elapsedTime * 1.5) * 0.05;
          } else {
            currentPivot.rotation.x = dragRotationRef.current.x;
          }
          currentPivot.rotation.y += dragVelocityRef.current.y;
        } else if (activeMode === 'medical') {
          let pulse = 0;
          if (!prefersReducedMotion) {
            // Physiological Lub-Dub cardiac pulse rhythm (72 BPM = 1.2 Hz)
            const cycleDuration = 1.0 / 1.2;
            const cycle = (elapsedTime % cycleDuration) / cycleDuration;
            if (cycle < 0.16) {
              // Ventricular Systole (Lub)
              pulse = Math.sin((cycle / 0.16) * Math.PI) * 0.075;
            } else if (cycle >= 0.22 && cycle < 0.36) {
              // Atrial Kick (Dub)
              pulse = Math.sin(((cycle - 0.22) / 0.14) * Math.PI) * 0.045;
            } else {
              pulse = 0;
            }
          }

          currentPivot.scale.setScalar(currentBaseScale * (1.0 + pulse));
          if (lightsRef.current?.point) {
            lightsRef.current.point.intensity = 0.8 + pulse * 18.0;
          }

          if (!prefersReducedMotion) {
            currentPivot.rotation.y += 0.004;
            currentPivot.rotation.z = -0.18; // anatomical apex tilt
            currentPivot.rotation.x = 0.15 + dragRotationRef.current.x;
          } else {
            currentPivot.rotation.z = -0.18;
            currentPivot.rotation.x = 0.15 + dragRotationRef.current.x;
          }
          currentPivot.rotation.y += dragVelocityRef.current.y;
        } else if (activeMode === 'academic') {
          if (!prefersReducedMotion) {
            // Harmonic vertical levitation
            currentPivot.position.y = Math.sin(elapsedTime * 1.6) * 0.09;
            const baseTiltZ = -0.38;
            const baseTiltX = 0.22;
            const scribeWobbleZ = Math.sin(elapsedTime * 2.5) * 0.05;
            const scribeWobbleX = Math.cos(elapsedTime * 2.0) * 0.03;

            currentPivot.rotation.z = baseTiltZ + scribeWobbleZ;
            currentPivot.rotation.x = baseTiltX + scribeWobbleX + dragRotationRef.current.x;
            currentPivot.rotation.y += 0.004;
          } else {
            currentPivot.rotation.z = -0.38;
            currentPivot.rotation.x = 0.22 + dragRotationRef.current.x;
          }
          currentPivot.rotation.y += dragVelocityRef.current.y;
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // 9. Cleanup & GPU Disposal
    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [updateLighting, switchModel, mode, theme]);

  // Handle mode changes after mount
  useEffect(() => {
    updateLighting(mode, theme);
    switchModel(mode);
  }, [mode, theme, updateLighting, switchModel]);

  // Pointer drag & click discrimination handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
    totalDragDistRef.current = 0;
    dragVelocityRef.current = { x: 0, y: 0 };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastPointerPosRef.current.x;
    const dy = e.clientY - lastPointerPosRef.current.y;
    totalDragDistRef.current += Math.hypot(dx, dy);

    dragRotationRef.current.x = Math.max(
      -0.7,
      Math.min(0.7, dragRotationRef.current.x + dy * 0.008)
    );
    dragRotationRef.current.y += dx * 0.008;
    dragVelocityRef.current = { x: dy * 0.002, y: dx * 0.005 };

    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // Click discrimination: if pointer travelled less than 5px, it's a click
    if (totalDragDistRef.current < 5) {
      onModelClick?.();
    }
  };

  // Graceful degradation fallback to 2D canvas if WebGL unavailable or lost
  if (!webGLSupported || isContextLost) {
    return (
      <IridescentCrystalCanvas
        mode={mode}
        activeSlideIndex={activeSlideIndex}
        baseHue={baseHue}
        secondaryHue={secondaryHue}
        onCrystalClick={onModelClick}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none ${className}`}
    >
      {/* Concentric ambient pedestal rings */}
      <div className="pointer-events-none absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[480px] lg:h-[480px] xl:w-[560px] xl:h-[560px] rounded-full border border-slate-900/10 dark:border-white/20" />
      <div className="pointer-events-none absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] lg:w-[580px] lg:h-[580px] xl:w-[680px] xl:h-[680px] rounded-full border border-slate-900/5 dark:border-white/10" />

      {/* Progressive loading badge during large model streaming */}
      {loadingProgress !== null && (
        <div className="absolute z-20 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-medium tracking-wide flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full border border-white border-t-transparent animate-spin" />
          <span>Memuat Model 3D ({loadingProgress}%)</span>
        </div>
      )}

      {/* WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-[320px] h-[340px] md:w-[420px] md:h-[440px] lg:w-[480px] lg:h-[500px] xl:w-[560px] xl:h-[580px] cursor-grab active:cursor-grabbing relative z-10 touch-none"
        title="Geser mouse untuk memutar model 3D, atau klik untuk melihat studi kasus projek aktif"
      />
    </div>
  );
};
