import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, '../../..');

export const MODES = ['tech', 'medical', 'academic'];
export const THEMES = ['dark', 'light'];

export const VIEWPORTS = {
  mobileSmall: { width: 320, height: 568, name: 'Mobile Small (SE/Older)' },
  mobileStandard: { width: 375, height: 667, name: 'Mobile Standard' },
  tablet: { width: 768, height: 1024, name: 'Tablet (iPad Portrait)' },
  desktop: { width: 1440, height: 900, name: 'Desktop (1440p)' },
  ultrawide: { width: 3840, height: 2160, name: '4K Ultrawide' }
};

// R1: Procedural 3D Model Specifications per Mode
export const PROCEDURAL_3D_MODELS = {
  tech: {
    id: 'tech',
    modelType: 'polyhedron',
    name: 'Procedural Crystalline Polyhedron',
    caption: 'Crystalline Polyhedron (Tech)',
    skeletonText: 'Memuat Model 3D Polyhedron...',
    geometry: 'IcosahedronGeometry',
    hasWireframeCage: true,
    hasOrbitalNodes: true,
    orbitalNodeCount: 4,
    estimatedTriangles: 72,
    networkCostBytes: 0,
    procedural: true
  },
  medical: {
    id: 'medical',
    modelType: 'helix-dna',
    name: 'Procedural B-DNA Double Helix',
    caption: 'B-DNA Double Helix — Helix DNA (Medical)',
    skeletonText: 'Memuat Model 3D Helix DNA...',
    geometry: 'CatmullRomCurve3',
    hasDualStrands: true,
    hasBasePairs: true,
    hasPhosphateBeads: true,
    basePairCount: 16,
    estimatedTriangles: 3500,
    networkCostBytes: 0,
    procedural: true
  },
  academic: {
    id: 'academic',
    modelType: 'pena-bulu',
    name: 'Procedural Calligraphy Feather Quill (Pena Bulu)',
    caption: 'Calligraphy Feather Quill — Pena Bulu (Academic)',
    skeletonText: 'Memuat Model 3D Pena Bulu...',
    geometry: 'BufferGeometry',
    hasArchedSpine: true,
    hasRibbonVanes: true,
    hasCalligraphyNib: true,
    estimatedTriangles: 730,
    networkCostBytes: 0,
    procedural: true
  }
};

// R2: Category Pill Configurations
export const PROJECT_CATEGORIES = {
  tech: [
    'All',
    'Web Development',
    'Software Engineering',
    'Mobile Applications',
    'UI/UX Design',
    'Branding & Media'
  ],
  medical: [
    'All',
    'Kesehatan Komunitas',
    'Edukasi Medis',
    'Inovasi Kesehatan (mHealth)',
    'Organisasi Kedokteran'
  ],
  academic: [
    'All',
    'Proposal PKM',
    'Artikel & Esai Ilmiah',
    'Otomasi Sitasi & CSL',
    'Publikasi Populer'
  ]
};

export const ACHIEVEMENT_CATEGORIES = [
  'All',
  'Kompetisi & Penghargaan',
  'Program Teknis & Akademik',
  'Kontribusi Komunitas & Riset',
  'Milestone Projek Perangkat Lunak',
  'Kepenulisan & Publikasi Ilmiah'
];

export const CATEGORY_PILL_LAYOUT_SPECS = {
  mobile: {
    maxWidth: 640,
    classes: ['overflow-x-auto', 'no-scrollbar'],
    wrap: false,
    verticalSpaceSavingPercent: 80
  },
  desktop: {
    minWidth: 641,
    classes: ['flex-wrap'],
    wrap: true
  }
};

// R3: Smart Bento Grid 5-Tile Layout Specifications
export const BENTO_GRID_SPECS = {
  containerGrid: 'grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8',
  tiles: {
    tile1_bio: {
      name: 'Bio & Identity',
      desktopSpan: 'lg:col-span-8',
      spanColumns: 8
    },
    tile2_contact: {
      name: 'Coordinates & Contact',
      desktopSpan: 'lg:col-span-4',
      spanColumns: 4
    },
    tile3_principles: {
      name: 'Methodology Principles',
      desktopSpan: 'lg:col-span-4',
      spanColumns: 4
    },
    tile4_education: {
      name: 'Formal Education',
      desktopSpan: 'lg:col-span-8',
      spanColumns: 8
    },
    tile5_history: {
      name: 'Smart Adaptive History Bento',
      desktopSpan: 'lg:col-span-12',
      spanColumns: 12,
      isFullWidth: true
    }
  },
  segmentedOptions: [
    { id: 'all', label: 'Semua' },
    { id: 'experience', label: 'Organisasi' },
    { id: 'committees', label: 'Kepanitiaan' }
  ],
  subgridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  initialVisibleItemsCount: 6
};

// R4: Dynamic Project Mode Icon Specifications
export const ICON_ASSETS = {
  tech: 'src/assets/icons/project-tech.svg',
  medical: 'src/assets/icons/project-medical.svg',
  academic: 'src/assets/icons/project-academic.svg'
};

export const PUBLIC_ICON_ASSETS = {
  tech: 'public/icons/project-tech.svg',
  medical: 'public/icons/project-medical.svg',
  academic: 'public/icons/project-academic.svg'
};

export const MODE_LABELS = {
  tech: 'Teknologi & Software Engineering',
  medical: 'Kedokteran & Kesehatan Komunitas',
  academic: 'Akademik & Karya Tulis Ilmiah'
};

// Environmental Background Assets per Mode & Theme
export const BACKGROUND_ASSETS = {
  tech: {
    dark: 'src/assets/image/bg-tech-dark.avif',
    light: 'src/assets/image/bg-tech-light.avif'
  },
  medical: {
    dark: 'src/assets/image/bg-medical-dark.avif',
    light: 'src/assets/image/bg-medical-light.avif'
  },
  academic: {
    dark: 'src/assets/image/bg-academic-dark.avif',
    light: 'src/assets/image/bg-academic-light.avif'
  }
};


// Dataset Loaders
export function loadProjects() {
  const fullPath = path.resolve(PROJECT_ROOT, 'src/data/projects.json');
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

export function loadAchievements() {
  const fullPath = path.resolve(PROJECT_ROOT, 'src/data/achievements.json');
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

export function loadExperience() {
  const fullPath = path.resolve(PROJECT_ROOT, 'src/data/experience.json');
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

export function loadCommittees() {
  const fullPath = path.resolve(PROJECT_ROOT, 'src/data/committees.json');
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

export function loadEducation() {
  const fullPath = path.resolve(PROJECT_ROOT, 'src/data/education.json');
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

export function loadProfile() {
  const fullPath = path.resolve(PROJECT_ROOT, 'src/data/profile.json');
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}
