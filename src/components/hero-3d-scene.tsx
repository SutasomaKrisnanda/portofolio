'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { ModeId } from '@/data/portfolio-data';
import { IridescentCrystalCanvas } from './crystal-canvas';

export interface Hero3DSceneProps {
  mode: ModeId;
  theme: 'dark' | 'light';
  activeSlideIndex?: number;
  baseHue?: number;
  secondaryHue?: number;
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

let gltfLoaderInstance: GLTFLoader | null = null;
let loaderPromise: Promise<GLTFLoader> | null = null;

async function getGLTFLoader(): Promise<GLTFLoader> {
  if (gltfLoaderInstance) return gltfLoaderInstance;
  if (!loaderPromise) {
    loaderPromise = (async () => {
      await MeshoptDecoder.ready;
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      gltfLoaderInstance = loader;
      return loader;
    })();
  }
  return loaderPromise;
}

export function normalizeLoadedModel(
  modelScene: THREE.Object3D,
  targetSize = 2.10
): { pivotGroup: THREE.Group; baseScale: number } {
  const pivotGroup = new THREE.Group();

  const box = new THREE.Box3().setFromObject(modelScene);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? targetSize / maxDim : 1.0;

  const center = box.getCenter(new THREE.Vector3());
  modelScene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  modelScene.scale.setScalar(scale);

  modelScene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => {
            m.needsUpdate = true;
          });
        } else {
          mesh.material.needsUpdate = true;
        }
      }
    }
  });

  pivotGroup.add(modelScene);
  return { pivotGroup, baseScale: 1.0 };
}

function createTechPolyhedron(): { pivotGroup: THREE.Group; baseScale: number } {
  const pivotGroup = new THREE.Group();

  // Core crystal: Icosahedron with physical glass material
  const innerGeo = new THREE.IcosahedronGeometry(1.35, 0);
  const innerMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.25,
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

function createMedicalDNA(): { pivotGroup: THREE.Group; baseScale: number } {
  const pivotGroup = new THREE.Group();

  const numBasePairs = 24;
  const height = 3.2;
  const radius = 0.95;
  const totalTurns = 2.4 * Math.PI; // ~1.2 full revolutions

  const nodeGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const strand1Mat = new THREE.MeshStandardMaterial({
    color: 0xff4d6d,
    emissive: 0x9f1239,
    emissiveIntensity: 0.6,
    roughness: 0.25,
    metalness: 0.3,
  });
  const strand2Mat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0x881337,
    emissiveIntensity: 0.6,
    roughness: 0.25,
    metalness: 0.3,
  });

  const rungMatA = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.2,
  });
  const rungMatB = new THREE.MeshStandardMaterial({
    color: 0xfb7185,
    emissive: 0xe11d48,
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.2,
  });

  const rungsGroup = new THREE.Group();

  for (let i = 0; i <= numBasePairs; i++) {
    const t = i / numBasePairs;
    const y = (t - 0.5) * height;
    const angle = t * totalTurns * 2;

    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    const x2 = Math.cos(angle + Math.PI) * radius;
    const z2 = Math.sin(angle + Math.PI) * radius;

    // Node on Strand 1
    const node1 = new THREE.Mesh(nodeGeo, strand1Mat);
    node1.position.set(x1, y, z1);
    pivotGroup.add(node1);

    // Node on Strand 2
    const node2 = new THREE.Mesh(nodeGeo, strand2Mat);
    node2.position.set(x2, y, z2);
    pivotGroup.add(node2);

    // Base pair connecting rod (half A, half B)
    if (i < numBasePairs) {
      const midX = (x1 + x2) / 2;
      const midZ = (z1 + z2) / 2;

      // Segment 1 (Strand 1 to Midpoint)
      const rungGeo1 = new THREE.CylinderGeometry(0.024, 0.024, radius, 8);
      const rungMesh1 = new THREE.Mesh(rungGeo1, i % 2 === 0 ? rungMatA : rungMatB);
      rungMesh1.position.set((x1 + midX) / 2, y, (z1 + midZ) / 2);
      rungMesh1.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(midX - x1, 0, midZ - z1).normalize()
      );
      rungsGroup.add(rungMesh1);

      // Segment 2 (Midpoint to Strand 2)
      const rungGeo2 = new THREE.CylinderGeometry(0.024, 0.024, radius, 8);
      const rungMesh2 = new THREE.Mesh(rungGeo2, i % 2 === 0 ? rungMatB : rungMatA);
      rungMesh2.position.set((midX + x2) / 2, y, (midZ + z2) / 2);
      rungMesh2.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(x2 - midX, 0, z2 - midZ).normalize()
      );
      rungsGroup.add(rungMesh2);
    }
  }

  pivotGroup.add(rungsGroup);

  // Subtle floating bio-luminescent particles
  const particlesGroup = new THREE.Group();
  const particleGeo = new THREE.OctahedronGeometry(0.045, 0);
  const particleMat = new THREE.MeshBasicMaterial({
    color: 0xffa5ba,
    transparent: true,
    opacity: 0.65,
  });
  for (let j = 0; j < 8; j++) {
    const p = new THREE.Mesh(particleGeo, particleMat);
    const pAngle = (j / 8) * Math.PI * 2;
    const pRadius = radius + 0.35 + (j % 3) * 0.12;
    const pY = ((j % 4) / 4 - 0.5) * height * 0.9;
    p.position.set(Math.cos(pAngle) * pRadius, pY, Math.sin(pAngle) * pRadius);
    particlesGroup.add(p);
  }
  pivotGroup.add(particlesGroup);
  pivotGroup.rotation.y = 0.15 + Math.PI / 2;

  return { pivotGroup, baseScale: 1.0 };
}

function createAcademicQuill(): { pivotGroup: THREE.Group; baseScale: number } {
  const pivotGroup = new THREE.Group();

  // 1. Slender curved shaft / rachis
  const curvePoints: THREE.Vector3[] = [];
  const segments = 24;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = -1.5 + t * 3.2; // total length ~3.2
    const x = Math.sin(t * Math.PI * 0.65) * 0.38;
    const z = -Math.pow(t, 1.8) * 0.25;
    curvePoints.push(new THREE.Vector3(x, y, z));
  }
  const shaftCurve = new THREE.CatmullRomCurve3(curvePoints);
  const shaftGeo = new THREE.TubeGeometry(shaftCurve, 32, 0.038, 10, false);
  const shaftMat = new THREE.MeshStandardMaterial({
    color: 0xfef9c3,
    emissive: 0x78350f,
    emissiveIntensity: 0.2,
    roughness: 0.35,
    metalness: 0.15,
  });
  const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
  pivotGroup.add(shaftMesh);

  // 2. Calligraphic golden metallic nib (nib tip at y = -1.62)
  const nibGroup = new THREE.Group();
  const nibTipGeo = new THREE.ConeGeometry(0.065, 0.35, 4);
  const nibMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xb45309,
    emissiveIntensity: 0.4,
    roughness: 0.15,
    metalness: 0.9,
  });
  const nibMesh = new THREE.Mesh(nibTipGeo, nibMat);
  nibMesh.rotation.x = Math.PI; // point downwards
  nibMesh.position.set(0, -1.62, 0);
  nibGroup.add(nibMesh);

  // Nib collar / ferrule ring
  const ringGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.08, 12);
  const ringMesh = new THREE.Mesh(ringGeo, nibMat);
  ringMesh.position.set(0, -1.45, 0);
  nibGroup.add(ringMesh);
  pivotGroup.add(nibGroup);

  // 3. Feather barbs / vanes (left and right wings radiating gracefully from shaft)
  const featherGroup = new THREE.Group();
  const vaneMatLeft = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xd97706,
    emissiveIntensity: 0.25,
    roughness: 0.4,
    metalness: 0.1,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92,
  });
  const vaneMatRight = new THREE.MeshStandardMaterial({
    color: 0xfde047,
    emissive: 0x9333ea,
    emissiveIntensity: 0.2,
    roughness: 0.45,
    metalness: 0.1,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });

  // Generate stylized feather barbs along the shaft
  for (let i = 4; i < segments - 1; i += 1) {
    const t = i / segments;
    const origin = curvePoints[i];
    const widthFactor = Math.sin(t * Math.PI) * 0.75;

    // Right vane barb
    const rightLen = widthFactor * 0.65;
    const barbGeoR = new THREE.CylinderGeometry(0.012, 0.004, rightLen, 6);
    const barbMeshR = new THREE.Mesh(barbGeoR, vaneMatRight);
    barbMeshR.position.set(origin.x + rightLen * 0.45, origin.y - 0.04, origin.z + 0.02);
    barbMeshR.rotation.z = -Math.PI / 3.2;
    barbMeshR.rotation.x = 0.15;
    featherGroup.add(barbMeshR);

    // Left vane barb (asymmetric silhouette)
    const leftLen = widthFactor * 0.45;
    const barbGeoL = new THREE.CylinderGeometry(0.01, 0.004, leftLen, 6);
    const barbMeshL = new THREE.Mesh(barbGeoL, vaneMatLeft);
    barbMeshL.position.set(origin.x - leftLen * 0.45, origin.y - 0.03, origin.z - 0.02);
    barbMeshL.rotation.z = Math.PI / 3.4;
    barbMeshL.rotation.x = -0.15;
    featherGroup.add(barbMeshL);
  }
  pivotGroup.add(featherGroup);

  // 4. Floating scholarly ink droplets
  const inkGroup = new THREE.Group();
  const dropGeo = new THREE.DodecahedronGeometry(0.035, 0);
  const dropMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.7,
    roughness: 0.2,
    metalness: 0.8,
  });
  for (let k = 0; k < 5; k++) {
    const drop = new THREE.Mesh(dropGeo, dropMat);
    const angle = (k / 5) * Math.PI * 2;
    drop.position.set(Math.cos(angle) * 0.6, -1.35 + (k % 3) * 0.35, Math.sin(angle) * 0.6);
    inkGroup.add(drop);
  }
  pivotGroup.add(inkGroup);

  // Initial calligraphic tilt
  pivotGroup.rotation.z = -0.22;
  pivotGroup.rotation.x = 0.18;
  pivotGroup.rotation.y = Math.PI + Math.PI / 2; // 270 degrees horizontal rotation at initial load

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
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);
  const [isContextLost, setIsContextLost] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);

  // Active request ID to prevent race conditions during rapid mode toggles
  const activeRequestIdRef = useRef<number>(0);

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

  // Physics-based cursor tracking refs (window-wide smooth spring tracking)
  const cursorTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cursorCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cursorVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // Switch model in Three.js scene (authentic GLB assets for Medical/Academic, procedural Polyhedron for Tech)
  const switchModel = useCallback(
    (targetMode: ModeId) => {
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

      // 2. Tech mode: procedural Polyhedron
      if (targetMode === 'tech') {
        const modelData = createTechPolyhedron();
        modelSceneCache.set('tech', modelData);
        activePivotRef.current = modelData.pivotGroup;
        activeBaseScaleRef.current = modelData.baseScale;
        scene.add(modelData.pivotGroup);
        setLoadingProgress(null);
        return;
      }

      // 3. Medical & Academic modes: load authentic GLB models via GLTFLoader with MeshoptDecoder
      const requestId = ++activeRequestIdRef.current;
      const assetPath =
        targetMode === 'medical'
          ? '/models/model-jantung.glb'
          : '/models/model-pena.glb';

      setLoadingProgress(0);

      getGLTFLoader()
        .then((loader) => {
          if (activeRequestIdRef.current !== requestId) return;
          loader.load(
            assetPath,
            (gltf) => {
              if (activeRequestIdRef.current !== requestId) return;
              const modelData = normalizeLoadedModel(gltf.scene, 2.40);
              if (targetMode === 'academic') {
                modelData.pivotGroup.rotation.y = Math.PI + Math.PI / 2;
              } else if (targetMode === 'medical') {
                modelData.pivotGroup.rotation.y = 0.15 + Math.PI / 2;
              }
              modelSceneCache.set(targetMode, modelData);
              if (currentModeRef.current === targetMode && sceneRef.current) {
                if (activePivotRef.current) {
                  sceneRef.current.remove(activePivotRef.current);
                }
                activePivotRef.current = modelData.pivotGroup;
                activeBaseScaleRef.current = modelData.baseScale;
                sceneRef.current.add(modelData.pivotGroup);
              }
              setLoadingProgress(null);
            },
            (progressEvent) => {
              if (activeRequestIdRef.current !== requestId) return;
              if (progressEvent.total && progressEvent.total > 0) {
                const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                setLoadingProgress(pct);
              }
            },
            (error) => {
              console.warn(`Failed to load ${assetPath}, falling back to procedural model:`, error);
              if (activeRequestIdRef.current !== requestId) return;
              const fallbackData =
                targetMode === 'medical' ? createMedicalDNA() : createAcademicQuill();
              modelSceneCache.set(targetMode, fallbackData);
              if (currentModeRef.current === targetMode && sceneRef.current) {
                activePivotRef.current = fallbackData.pivotGroup;
                activeBaseScaleRef.current = fallbackData.baseScale;
                sceneRef.current.add(fallbackData.pivotGroup);
              }
              setLoadingProgress(null);
            }
          );
        })
        .catch((err) => {
          console.warn('Failed to get GLTFLoader:', err);
          const fallbackData =
            targetMode === 'medical' ? createMedicalDNA() : createAcademicQuill();
          modelSceneCache.set(targetMode, fallbackData);
          if (currentModeRef.current === targetMode && sceneRef.current) {
            activePivotRef.current = fallbackData.pivotGroup;
            activeBaseScaleRef.current = fallbackData.baseScale;
            sceneRef.current.add(fallbackData.pivotGroup);
          }
          setLoadingProgress(null);
        });
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
    const initialWidth = container.clientWidth || 360;
    const initialHeight = container.clientHeight || 380;
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

    // 8. Global pointer tracking for physics cursor following
    const handleGlobalPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      cursorTargetRef.current = { x: nx, y: ny };
    };
    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });

    // 9. Animation & Render Loop
    let animFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Check reduced motion preference
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // 1. Spring-damper physics for cursor-following orientation and subtle parallax
      const springK = 0.06;
      const cursorDamping = 0.82;
      const ax = (cursorTargetRef.current.x - cursorCurrentRef.current.x) * springK;
      const ay = (cursorTargetRef.current.y - cursorCurrentRef.current.y) * springK;
      cursorVelocityRef.current.x = (cursorVelocityRef.current.x + ax) * cursorDamping;
      cursorVelocityRef.current.y = (cursorVelocityRef.current.y + ay) * cursorDamping;
      cursorCurrentRef.current.x += cursorVelocityRef.current.x;
      cursorCurrentRef.current.y += cursorVelocityRef.current.y;

      // 2. Viscous friction & acceleration damping on drag velocity
      if (!isDraggingRef.current) {
        dragVelocityRef.current.x *= 0.94;
        dragVelocityRef.current.y *= 0.94;
      }
      if (Math.abs(dragVelocityRef.current.x) < 0.00001) dragVelocityRef.current.x = 0;
      if (Math.abs(dragVelocityRef.current.y) < 0.00001) dragVelocityRef.current.y = 0;

      dragRotationRef.current.x = Math.max(
        -0.7,
        Math.min(0.7, dragRotationRef.current.x + dragVelocityRef.current.x)
      );
      dragRotationRef.current.y += dragVelocityRef.current.y;

      const cursorTiltX = cursorCurrentRef.current.y * 0.22; // pitch facing cursor
      const cursorTiltY = cursorCurrentRef.current.x * 0.38; // yaw facing cursor
      const cursorShiftX = cursorCurrentRef.current.x * 0.08; // subtle floating shift
      const cursorShiftY = -cursorCurrentRef.current.y * 0.05;

      const currentPivot = activePivotRef.current;
      const currentBaseScale = activeBaseScaleRef.current;
      const activeMode = currentModeRef.current;

      if (currentPivot) {
        if (activeMode === 'tech') {
          // Zero constant auto-spin! Only responds to cursor orientation, inertia, and subtle micro-breathing
          if (!prefersReducedMotion) {
            currentPivot.rotation.x = dragRotationRef.current.x + cursorTiltX + Math.sin(elapsedTime * 0.8) * 0.02;
            currentPivot.rotation.y = dragRotationRef.current.y + cursorTiltY;
            currentPivot.position.x = cursorShiftX;
            currentPivot.position.y = cursorShiftY + Math.sin(elapsedTime * 1.5) * 0.03;
          } else {
            currentPivot.rotation.x = dragRotationRef.current.x + cursorTiltX;
            currentPivot.rotation.y = dragRotationRef.current.y + cursorTiltY;
            currentPivot.position.x = cursorShiftX;
            currentPivot.position.y = cursorShiftY;
          }
        } else if (activeMode === 'medical') {
          // Physiological 72 BPM cardiac pulse (Lub-Dub cycle: systole, early diastole rebound, atrial kick)
          const T = 60 / 72; // ~0.8333s per cardiac cycle at 72 BPM
          const phase = (elapsedTime % T) / T; // normalized cardiac phase [0, 1)

          // 3-Gaussian hemodynamic pulse wave
          const s1Systole = Math.exp(-Math.pow((phase - 0.12) / (Math.SQRT2 * 0.05), 2));
          const s2Dub = 0.42 * Math.exp(-Math.pow((phase - 0.32) / (Math.SQRT2 * 0.045), 2));
          const atrialKick = 0.22 * Math.exp(-Math.pow((phase - 0.92) / (Math.SQRT2 * 0.04), 2));
          const cardiacPulse = s1Systole + s2Dub + atrialKick;

          // Anatomical heart resting posture (apical slant to the left, anterior inclination)
          const restTiltZ = -0.32;
          const restTiltX = 0.20;
          const restTiltY = 0.15 + Math.PI / 2; // +90 degrees horizontal rotation (counter-clockwise)

          if (!prefersReducedMotion) {
            // Systolic apical wringing twist
            const twistY = 0.045 * cardiacPulse;
            const twistZ = 0.025 * cardiacPulse;

            currentPivot.rotation.z = restTiltZ + twistZ;
            currentPivot.rotation.x = restTiltX + dragRotationRef.current.x + cursorTiltX;
            currentPivot.rotation.y = restTiltY + twistY + dragRotationRef.current.y + cursorTiltY;
            currentPivot.position.x = cursorShiftX;
            currentPivot.position.y = cursorShiftY + Math.sin(elapsedTime * 1.2) * 0.02;
            currentPivot.scale.setScalar(currentBaseScale * (1.0 + 0.075 * cardiacPulse));

            if (lightsRef.current?.point) {
              lightsRef.current.point.intensity = 0.8 + 1.2 * cardiacPulse;
            }
          } else {
            currentPivot.rotation.z = restTiltZ;
            currentPivot.rotation.x = restTiltX + dragRotationRef.current.x + cursorTiltX;
            currentPivot.rotation.y = restTiltY + dragRotationRef.current.y + cursorTiltY;
            currentPivot.position.x = cursorShiftX;
            currentPivot.position.y = cursorShiftY;
            currentPivot.scale.setScalar(currentBaseScale);
          }
        } else if (activeMode === 'academic') {
          // Academic Pena: Harmonic levitation and organic calligraphic scribe wobble
          const baseTiltZ = -0.28; // Calligraphic writing slant
          const baseTiltX = 0.18;  // Forward pitch toward parchment
          const baseTiltY = Math.PI + Math.PI / 2; // 180 + 90 = 270 degrees horizontal rotation (counter-clockwise)

          if (!prefersReducedMotion) {
            // Harmonic vertical levitation: Y = sin(1.6t) * 0.06
            const levitationY = Math.sin(elapsedTime * 1.6) * 0.06;

            // Lissajous calligraphic micro-wobble
            const scribeWobbleX = Math.cos(elapsedTime * 1.8) * 0.025;
            const scribeWobbleZ = Math.sin(elapsedTime * 2.2 + 0.4) * 0.03;
            const scribeWobbleY = Math.sin(elapsedTime * 0.9) * 0.015;

            currentPivot.position.x = cursorShiftX;
            currentPivot.position.y = cursorShiftY + levitationY;
            currentPivot.rotation.z = baseTiltZ + scribeWobbleZ;
            currentPivot.rotation.x = baseTiltX + scribeWobbleX + dragRotationRef.current.x + cursorTiltX;
            currentPivot.rotation.y = baseTiltY + dragRotationRef.current.y + cursorTiltY + scribeWobbleY;
          } else {
            currentPivot.position.x = cursorShiftX;
            currentPivot.position.y = cursorShiftY;
            currentPivot.rotation.z = baseTiltZ;
            currentPivot.rotation.x = baseTiltX + dragRotationRef.current.x + cursorTiltX;
            currentPivot.rotation.y = baseTiltY + dragRotationRef.current.y + cursorTiltY;
          }
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // 10. Cleanup & GPU Disposal
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('pointermove', handleGlobalPointerMove);
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

    // Pointer release: Model click decoupled from modal per R1 follow-up.
    // Even if totalDragDistRef.current < 5, zero modal or navigation actions are dispatched.
    if (totalDragDistRef.current < 5) {
      // Decoupled: clicking 3D model never opens project modal
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
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none ${className}`}
    >
      {/* Concentric ambient pedestal rings */}
      <div className="pointer-events-none absolute w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] lg:w-[360px] lg:h-[360px] xl:w-[400px] xl:h-[400px] rounded-full border border-slate-900/10 dark:border-white/20" />
      <div className="pointer-events-none absolute w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] lg:w-[420px] lg:h-[420px] xl:w-[460px] xl:h-[460px] rounded-full border border-slate-900/5 dark:border-white/10" />

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
        role="img"
        aria-label="Model 3D Interaktif - Geser kursor atau drag untuk memutar"
        className="w-[300px] h-[320px] sm:w-[340px] sm:h-[360px] lg:w-[360px] lg:h-[380px] xl:w-[400px] xl:h-[420px] cursor-grab active:cursor-grabbing relative z-10 touch-none"
        title="Geser kursor atau drag untuk memutar model 3D"
      />
    </div>
  );
};
