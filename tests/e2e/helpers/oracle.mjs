import * as THREE from 'three';
import { PROCEDURAL_3D_MODELS, ICON_ASSETS, MODE_LABELS } from './fixtures.mjs';

/**
 * Authoritative 3D Model Specification Oracle (R1)
 */
export function resolveExpected3DModelSpec(mode) {
  return PROCEDURAL_3D_MODELS[mode] || PROCEDURAL_3D_MODELS.tech;
}

/**
 * Procedural 3D Model Factory & Geometry Validator (R1)
 * Builds in-memory Three.js procedural models without network loading
 */
export function buildProcedural3DModel(mode) {
  const group = new THREE.Group();
  let triangleCount = 0;

  if (mode === 'tech') {
    // 1. Core Icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(1.35, 0);
    const coreMesh = new THREE.Mesh(coreGeo, new THREE.MeshStandardMaterial());
    group.add(coreMesh);
    triangleCount += coreGeo.index ? coreGeo.index.count / 3 : coreGeo.attributes.position.count / 3;

    // 2. Outer Wireframe Cage
    const cageGeo = new THREE.IcosahedronGeometry(1.58, 0);
    const cageMesh = new THREE.Mesh(cageGeo, new THREE.MeshBasicMaterial({ wireframe: true }));
    group.add(cageMesh);
    triangleCount += cageGeo.index ? cageGeo.index.count / 3 : cageGeo.attributes.position.count / 3;

    // 3. Four Orbital Nodes
    const nodeGeo = new THREE.OctahedronGeometry(0.1, 0);
    for (let i = 0; i < 4; i++) {
      const nodeMesh = new THREE.Mesh(nodeGeo, new THREE.MeshStandardMaterial());
      const angle = (i / 4) * Math.PI * 2;
      nodeMesh.position.set(Math.cos(angle) * 1.82, Math.sin(angle * 2) * 0.4, Math.sin(angle) * 1.82);
      group.add(nodeMesh);
      triangleCount += nodeGeo.index ? nodeGeo.index.count / 3 : nodeGeo.attributes.position.count / 3;
    }
  } else if (mode === 'medical') {
    // B-DNA Double Helix: dual helical curve tubes + base pair rungs
    const strand1Points = [];
    const strand2Points = [];
    const turns = 2.5;
    const height = 4.0;
    const radius = 1.0;
    const steps = 60;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      strand1Points.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      strand2Points.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius));
    }

    const curve1 = new THREE.CatmullRomCurve3(strand1Points);
    const curve2 = new THREE.CatmullRomCurve3(strand2Points);
    const tubeGeo1 = new THREE.TubeGeometry(curve1, 40, 0.08, 8, false);
    const tubeGeo2 = new THREE.TubeGeometry(curve2, 40, 0.08, 8, false);

    group.add(new THREE.Mesh(tubeGeo1, new THREE.MeshStandardMaterial()));
    group.add(new THREE.Mesh(tubeGeo2, new THREE.MeshStandardMaterial()));
    triangleCount += (tubeGeo1.index ? tubeGeo1.index.count / 3 : tubeGeo1.attributes.position.count / 3) * 2;

    // 16 Base-pair cylinders (rungs)
    const rungGeo = new THREE.CylinderGeometry(0.04, 0.04, radius * 2, 8);
    for (let r = 0; r < 16; r++) {
      const rungMesh = new THREE.Mesh(rungGeo, new THREE.MeshStandardMaterial());
      group.add(rungMesh);
      triangleCount += rungGeo.index ? rungGeo.index.count / 3 : rungGeo.attributes.position.count / 3;
    }

    // Terminal phosphate beads
    const beadGeo = new THREE.SphereGeometry(0.09, 8, 8);
    for (let b = 0; b < 4; b++) {
      const bead = new THREE.Mesh(beadGeo, new THREE.MeshStandardMaterial());
      group.add(bead);
      triangleCount += beadGeo.index ? beadGeo.index.count / 3 : beadGeo.attributes.position.count / 3;
    }
  } else {
    // Academic: Calligraphy Feather Quill (Pena Bulu)
    const spinePoints = [
      new THREE.Vector3(0, -2.0, 0),
      new THREE.Vector3(0.2, -0.5, 0),
      new THREE.Vector3(0.5, 1.0, 0),
      new THREE.Vector3(0.8, 2.2, 0)
    ];
    const spineCurve = new THREE.CatmullRomCurve3(spinePoints);
    const spineGeo = new THREE.TubeGeometry(spineCurve, 24, 0.06, 8, false);
    group.add(new THREE.Mesh(spineGeo, new THREE.MeshStandardMaterial()));
    triangleCount += spineGeo.index ? spineGeo.index.count / 3 : spineGeo.attributes.position.count / 3;

    // Brass Calligraphy Nib
    const nibGeo = new THREE.ConeGeometry(0.12, 0.6, 8);
    nibGeo.rotateX(Math.PI);
    nibGeo.translate(0, -2.3, 0);
    group.add(new THREE.Mesh(nibGeo, new THREE.MeshStandardMaterial({ metalness: 0.9, roughness: 0.2 })));
    triangleCount += nibGeo.index ? nibGeo.index.count / 3 : nibGeo.attributes.position.count / 3;

    // Vane Ribbon (BufferGeometry)
    const vaneGeo = new THREE.PlaneGeometry(1.2, 3.2, 6, 12);
    group.add(new THREE.Mesh(vaneGeo, new THREE.MeshStandardMaterial({ side: THREE.DoubleSide })));
    triangleCount += vaneGeo.index ? vaneGeo.index.count / 3 : vaneGeo.attributes.position.count / 3;
  }

  return {
    group,
    triangleCount: Math.round(triangleCount),
    objectCount: group.children.length,
    networkBytes: 0 // Procedural Three.js models require 0 kB network download
  };
}

/**
 * Recursive GPU Resource Disposer for Three.js Hierarchy
 */
export function disposeHierarchy(object) {
  let disposedGeometries = 0;
  let disposedMaterials = 0;

  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
      disposedGeometries++;
    }
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => {
          mat.dispose();
          disposedMaterials++;
        });
      } else {
        child.material.dispose();
        disposedMaterials++;
      }
    }
  });

  return { disposedGeometries, disposedMaterials };
}

/**
 * Authoritative Projects Filter Oracle (R2)
 */
export function filterProjects(projects, activeMode, selectedCategory = 'All', searchQuery = '', sortBy = 'featured') {
  if (!Array.isArray(projects)) return [];

  return projects
    .filter((p) => p && (p.mode === activeMode || p.secondaryModes?.includes(activeMode)))
    .filter((p) => {
      if (selectedCategory === 'All') return true;
      return p.category === selectedCategory || p.secondaryCategory === selectedCategory;
    })
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.summary && p.summary.toLowerCase().includes(q)) ||
        (p.role && p.role.toLowerCase().includes(q)) ||
        (Array.isArray(p.technologies) && p.technologies.some((t) => t.toLowerCase().includes(q)))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      }
      if (sortBy === 'newest') {
        return (b.year || '').localeCompare(a.year || '');
      }
      return (a.title || '').localeCompare(b.title || '');
    });
}

/**
 * Authoritative Achievements Filter Oracle (R2)
 */
export function filterAchievements(achievements, activeMode, selectedCategory = 'All') {
  if (!Array.isArray(achievements)) return [];

  return achievements
    .filter((item) => item && Array.isArray(item.modes) && item.modes.includes(activeMode))
    .filter((item) => {
      if (selectedCategory === 'All') return true;
      return item.category === selectedCategory;
    });
}

/**
 * Authoritative Bento Grid History Filter Oracle (R3)
 */
export function filterBentoHistory(experience, committees, activeMode, activeTab = 'all') {
  const expList = Array.isArray(experience)
    ? experience.filter((e) => e && Array.isArray(e.modes) && e.modes.includes(activeMode)).map((e) => ({
        ...e,
        trackType: 'experience'
      }))
    : [];

  const comList = Array.isArray(committees)
    ? committees.filter((c) => c && Array.isArray(c.modes) && c.modes.includes(activeMode)).map((c) => ({
        ...c,
        trackType: 'committees'
      }))
    : [];

  if (activeTab === 'experience') return expList;
  if (activeTab === 'committees') return comList;
  return [...expList, ...comList];
}

/**
 * Progressive Disclosure Slice Oracle (R3)
 */
export function sliceProgressiveDisclosure(items, isExpanded, threshold = 6) {
  if (!Array.isArray(items)) return [];
  if (isExpanded || items.length <= threshold) {
    return items;
  }
  return items.slice(0, threshold);
}

/**
 * Authoritative Dynamic Project Mode Icon Resolver (R4)
 */
export function resolveExpectedProjectMode(activeMode, project) {
  if (!project || !project.mode) return activeMode || 'tech';
  if (project.mode !== activeMode && !project.secondaryModes?.includes(activeMode)) {
    return project.mode || 'tech';
  }
  return activeMode;
}

export function resolveExpectedProjectIconAsset(activeMode, project) {
  const resolvedMode = resolveExpectedProjectMode(activeMode, project);
  return ICON_ASSETS[resolvedMode] || ICON_ASSETS.tech;
}

export function resolveExpectedProjectAltText(activeMode, project) {
  const resolvedMode = resolveExpectedProjectMode(activeMode, project);
  const label = MODE_LABELS[resolvedMode] || MODE_LABELS.tech;
  if (project && project.title) {
    return `${project.title} — Logo Mode ${label}`;
  }
  return `Logo Mode ${label}`;
}

/**
 * SVG Markup Validator (R4)
 */
export function validateSvgMarkup(content) {
  if (typeof content !== 'string') return { valid: false, error: 'Content not a string' };
  const trimmed = content.trim();
  const hasOpening = trimmed.includes('<svg');
  const hasClosing = trimmed.includes('</svg>');
  const viewBoxMatch = content.match(/viewBox=["']([^"']+)["']/);
  const hasXmlns = content.includes('xmlns="http://www.w3.org/2000/svg"') || content.includes("xmlns='http://www.w3.org/2000/svg'");

  return {
    valid: hasOpening && hasClosing && Boolean(viewBoxMatch),
    hasOpening,
    hasClosing,
    hasXmlns,
    viewBox: viewBoxMatch ? viewBoxMatch[1] : null
  };
}
