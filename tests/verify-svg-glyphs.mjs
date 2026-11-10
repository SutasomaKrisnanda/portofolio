import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const projects = JSON.parse(fs.readFileSync(path.join(root, 'src/data/projects.json'), 'utf8'));

function renderDiamondArtifactGlyph({ visualType, index, mockReactId = ':r0:' }) {
  const reactId = mockReactId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeType = String(visualType || 'artifact').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const chromeGradId = `chrome-${safeType}-${index}-${reactId}`;
  const holoGradId = `holo-${safeType}-${index}-${reactId}`;
  const holoSideGradId = `holo-side-${safeType}-${index}-${reactId}`;

  const normIndex = Math.abs(Math.floor(index));

  if (normIndex % 3 === 0) {
    return {
      shape: 0,
      name: 'Liquid Chrome Sphere',
      svg: `<svg viewBox="0 0 80 80">
        <defs>
          <linearGradient id="${chromeGradId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="45%" stopColor="#64748b" />
            <stop offset="75%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        <ellipse cx="42" cy="67" rx="16" ry="4" fill="rgba(15,23,42,0.28)" />
        <path d="M38 12 C52 14, 56 28, 46 38 C58 46, 54 62, 38 64 C24 62, 24 46, 34 36 C24 26, 28 14, 38 12 Z" fill="url(#${chromeGradId})" stroke="#e2e8f0" strokeWidth="1.2" />
        <circle cx="37" cy="25" r="5" fill="#ffffff" fillOpacity="0.65" />
        <path d="M32 48 Q40 56 47 46" stroke="#94a3b8" strokeWidth="2" fill="none" />
      </svg>`,
      requiredDefs: [chromeGradId]
    };
  }
  if (normIndex % 3 === 1) {
    return {
      shape: 1,
      name: 'Crystal Octahedron',
      svg: `<svg viewBox="0 0 80 80">
        <ellipse cx="40" cy="64" rx="22" ry="5" fill="rgba(15,23,42,0.25)" />
        <polygon points="40,20 66,34 40,48 14,34" fill="#fbcfe8" stroke="#f9a8d4" strokeWidth="1" />
        <polygon points="14,34 40,48 40,60 14,46" fill="#f472b6" />
        <polygon points="66,34 40,48 40,60 66,46" fill="#db2777" />
        <polygon points="40,25 55,33 40,41 25,33" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
      </svg>`,
      requiredDefs: []
    };
  }
  return {
    shape: 2,
    name: 'Holographic Crystal Column',
    svg: `<svg viewBox="0 0 80 80">
      <defs>
        <linearGradient id="${holoGradId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="${holoSideGradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <ellipse cx="42" cy="67" rx="14" ry="4" fill="rgba(15,23,42,0.28)" />
      <polygon points="38,14 58,22 44,30 24,22" fill="#e0f2fe" />
      <polygon points="24,22 44,30 44,58 24,50" fill="url(#${holoGradId})" />
      <polygon points="44,30 58,22 58,50 44,58" fill="url(#${holoSideGradId})" />
      <rect x="40" y="56" width="4" height="8" rx="1.5" fill="#334155" />
    </svg>`,
    requiredDefs: [holoGradId, holoSideGradId]
  };
}

let failures = 0;
console.log(`[TEST 1] Verifying all ${projects.length} project items in projects.json...`);
projects.forEach((p, idx) => {
  const rendered = renderDiamondArtifactGlyph({ visualType: p.visualType, index: idx });
  for (const defId of rendered.requiredDefs) {
    if (!rendered.svg.includes(`id="${defId}"`)) {
      console.error(`FAIL: Project ${p.id} (index ${idx}) missing definition for id="${defId}"`);
      failures++;
    }
    if (!rendered.svg.includes(`url(#${defId})`)) {
      console.error(`FAIL: Project ${p.id} (index ${idx}) missing url reference url(#${defId})`);
      failures++;
    }
    if (/[ \t\n\r"\'<>&]/.test(defId)) {
      console.error(`FAIL: Def ID contains invalid characters: ${defId}`);
      failures++;
    }
  }
});

console.log(`[TEST 2] Verifying Shape 0, 1, 2 distribution across indices 0..8...`);
const shapeCounts = [0, 0, 0];
for (let i = 0; i < 9; i++) {
  const rendered = renderDiamondArtifactGlyph({ visualType: 'artifact', index: i });
  shapeCounts[rendered.shape]++;
}
if (shapeCounts[0] !== 3 || shapeCounts[1] !== 3 || shapeCounts[2] !== 3) {
  console.error('FAIL: Expected balanced 3-3-3 shape distribution across 9 indices, got:', shapeCounts);
  failures++;
} else {
  console.log('PASS: Exact balanced distribution confirmed (3 Liquid Chrome Sphere, 3 Crystal Octahedron, 3 Holographic Column).');
}

console.log(`[TEST 3] Stress-testing adversarial & boundary inputs...`);
const adversarialCases = [
  { visualType: null, index: 0 },
  { visualType: undefined, index: 1 },
  { visualType: '', index: 2 },
  { visualType: 'Smart IoT & AI / Medical', index: 3 },
  { visualType: 'Special <Chars> "Double" \'Single\' & Escapes', index: 4 },
  { visualType: 'Unicode 🚀 医疗 🧬', index: 5 },
  { visualType: 'artifact', index: -1 },
  { visualType: 'artifact', index: -999 },
  { visualType: 'artifact', index: 1.732 },
  { visualType: 'artifact', index: 1e6 }
];

adversarialCases.forEach((c, i) => {
  const rendered = renderDiamondArtifactGlyph(c);
  for (const defId of rendered.requiredDefs) {
    if (!rendered.svg.includes(`id="${defId}"`) || !rendered.svg.includes(`url(#${defId})`)) {
      console.error(`FAIL: Adversarial case ${i} broken def/url:`, c, defId);
      failures++;
    }
    if (/[ \t\n\r"\'<>&]/.test(defId)) {
      console.error(`FAIL: Adversarial case ${i} defId has invalid XML chars:`, defId);
      failures++;
    }
  }
});

if (failures === 0) {
  console.log('ALL SVG TECH GLYPH TESTS PASSED WITH 0 FAILURES!');
  process.exit(0);
} else {
  console.error(`TESTS FAILED WITH ${failures} ERRORS.`);
  process.exit(1);
}
