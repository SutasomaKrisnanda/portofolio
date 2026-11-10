import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT_ROOT, BENTO_GRID_SPECS, CATEGORY_PILL_LAYOUT_SPECS } from './fixtures.mjs';
import { validateSvgMarkup } from './oracle.mjs';

export { assert };

export function assertFileExists(relativePath, minBytes = 1) {
  const fullPath = path.resolve(PROJECT_ROOT, relativePath);
  const exists = fs.existsSync(fullPath);
  assert.ok(exists, `File does not exist: ${relativePath} (at ${fullPath})`);
  const stat = fs.statSync(fullPath);
  assert.ok(
    stat.size >= minBytes,
    `File size too small: ${relativePath} is ${stat.size} bytes, expected >= ${minBytes}`
  );
  return { fullPath, size: stat.size };
}

export function assertValidSvg(relativePath) {
  const { fullPath } = assertFileExists(relativePath, 10);
  const content = fs.readFileSync(fullPath, 'utf8');
  const result = validateSvgMarkup(content);
  assert.ok(
    result.valid,
    `File is not valid SVG: ${relativePath} (hasOpening: ${result.hasOpening}, hasClosing: ${result.hasClosing}, viewBox: ${result.viewBox})`
  );
  return { ...result, content };
}

export function assertEqual(actual, expected, message) {
  if (message !== undefined) {
    assert.strictEqual(actual, expected, String(message));
  } else {
    assert.strictEqual(actual, expected);
  }
}

export function assertDeepEqual(actual, expected, message) {
  if (message !== undefined) {
    assert.deepStrictEqual(actual, expected, String(message));
  } else {
    assert.deepStrictEqual(actual, expected);
  }
}

export function assertIncludes(actual, element, message) {
  if (Array.isArray(actual)) {
    assert.ok(actual.includes(element), message || `Expected array to include ${element}`);
  } else if (typeof actual === 'string') {
    assert.ok(actual.includes(element), message || `Expected string to include "${element}"`);
  } else {
    assert.fail(`assertIncludes called on unsupported type: ${typeof actual}`);
  }
}

export function assertValidProceduralModel(spec, mode) {
  assert.ok(spec, `Procedural model spec must exist for mode ${mode}`);
  assertEqual(spec.procedural, true, `Model for mode ${mode} must be procedural`);
  assertEqual(spec.networkCostBytes, 0, `Model for mode ${mode} must have 0 network cost`);
  assert.ok(spec.estimatedTriangles > 0 && spec.estimatedTriangles < 10000, `Triangles must be in lightweight budget`);
}

export function assertValidBentoLayout(tiles) {
  const t = tiles || BENTO_GRID_SPECS.tiles;
  assertEqual(t.tile1_bio.desktopSpan, 'lg:col-span-8', 'Tile 1 must span 8 columns on desktop');
  assertEqual(t.tile2_contact.desktopSpan, 'lg:col-span-4', 'Tile 2 must span 4 columns on desktop');
  assertEqual(t.tile3_principles.desktopSpan, 'lg:col-span-4', 'Tile 3 must span 4 columns on desktop');
  assertEqual(t.tile4_education.desktopSpan, 'lg:col-span-8', 'Tile 4 must span 8 columns on desktop');
  assertEqual(t.tile5_history.desktopSpan, 'lg:col-span-12', 'Tile 5 must span full width (12 columns) on desktop');
}
