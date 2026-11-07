import { BACKGROUND_ASSETS, MODEL_ASSETS, ICON_ASSETS } from './fixtures.mjs';

/**
 * Authoritative filter contract:
 * featured projects matching activeMode directly or via secondaryModes
 */
export function filterFeaturedProjects(projects, activeMode) {
  if (!Array.isArray(projects)) return [];
  return projects.filter((p) => {
    const isFeatured = Boolean(p.featured);
    const matchesPrimary = p.mode === activeMode;
    const matchesSecondary = Array.isArray(p.secondaryModes) && p.secondaryModes.includes(activeMode);
    return isFeatured && (matchesPrimary || matchesSecondary);
  });
}

/**
 * Authoritative icon resolution contract:
 * The icon displayed for a project must match the currently active mode.
 */
export function resolveExpectedIcon(activeMode) {
  return ICON_ASSETS[activeMode] || null;
}

/**
 * Authoritative background resolution contract:
 * Returns the exact AVIF path for the given mode and resolved theme.
 */
export function resolveExpectedBackground(mode, theme) {
  const modeAssets = BACKGROUND_ASSETS[mode];
  if (!modeAssets) return null;
  return modeAssets[theme] || null;
}

/**
 * Authoritative 3D model resolution contract:
 */
export function resolveExpected3DModel(mode) {
  return MODEL_ASSETS[mode] || null;
}

/**
 * Cyclic slide index calculation contract:
 */
export function calculateSlideIndex(currentIndex, delta, totalCount) {
  if (totalCount <= 0) return 0;
  return ((currentIndex + delta) % totalCount + totalCount) % totalCount;
}

/**
 * glTF 2.0 Binary (GLB) Header Parser & Validator
 */
export function parseGlbHeader(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
    return { valid: false, error: 'Buffer too small for GLB header' };
  }
  const magic = buffer.readUInt32LE(0);
  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);

  const isMagicGlTF = magic === 0x46546c67; // 'glTF' in ASCII
  const isVersion2 = version === 2;
  const isLengthMatching = length === buffer.length;

  let jsonChunk = null;
  let extensionsUsed = [];
  let extensionsRequired = [];

  if (isMagicGlTF && buffer.length >= 20) {
    const chunkLength = buffer.readUInt32LE(12);
    const chunkType = buffer.readUInt32LE(16);
    if (chunkType === 0x4e4f534a) { // 'JSON' in ASCII
      try {
        const jsonText = buffer.subarray(20, 20 + chunkLength).toString('utf8');
        jsonChunk = JSON.parse(jsonText);
        extensionsUsed = jsonChunk.extensionsUsed || [];
        extensionsRequired = jsonChunk.extensionsRequired || [];
      } catch (err) {
        // Corrupted JSON chunk
      }
    }
  }

  return {
    valid: isMagicGlTF && isVersion2 && isLengthMatching,
    magic,
    version,
    length,
    bufferLength: buffer.length,
    jsonChunk,
    extensionsUsed,
    extensionsRequired
  };
}

/**
 * AVIF (ISOBMFF) Header Parser & Validator
 */
export function parseAvifHeader(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 16) {
    return { valid: false, error: 'Buffer too small for ISOBMFF header' };
  }
  const boxLength = buffer.readUInt32BE(0);
  const boxType = buffer.subarray(4, 8).toString('ascii');
  const majorBrand = buffer.subarray(8, 12).toString('ascii');

  const isFtyp = boxType === 'ftyp';
  const isAvif = majorBrand === 'avif' || majorBrand === 'avis';

  return {
    valid: isFtyp && isAvif,
    boxLength,
    boxType,
    majorBrand
  };
}

/**
 * SVG Markup Validator
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
