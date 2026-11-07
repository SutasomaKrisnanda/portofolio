import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, '../../..');

export const MODES = ['tech', 'medical', 'academic'];
export const THEMES = ['dark', 'light'];

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

export const MODEL_ASSETS = {
  medical: {
    source: 'src/assets/models/model-jantung.glb',
    public: 'public/models/model-jantung.glb',
    requiredExtensions: ['EXT_meshopt_compression', 'KHR_mesh_quantization']
  },
  academic: {
    source: 'src/assets/models/model-quill.glb',
    public: 'public/models/model-quill.glb',
    requiredExtensions: []
  },
  tech: {
    type: 'procedural-polyhedron'
  }
};

export const ICON_ASSETS = {
  tech: 'src/assets/icons/project-tech.svg',
  medical: 'src/assets/icons/project-medical.svg',
  academic: 'src/assets/icons/project-academic.svg'
};

export const PROJECTS_DATA_PATH = 'src/data/projects.json';

export function loadProjects() {
  const fullPath = path.resolve(PROJECT_ROOT, PROJECTS_DATA_PATH);
  const raw = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(raw);
}

export const VIEWPORTS = {
  mobileSmall: { width: 320, height: 568 },
  mobileStandard: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
  ultrawide: { width: 3840, height: 2160 }
};
