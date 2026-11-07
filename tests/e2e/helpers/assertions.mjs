import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT_ROOT } from './fixtures.mjs';
import { parseGlbHeader, parseAvifHeader, validateSvgMarkup } from './oracle.mjs';

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

export function assertValidAvif(relativePath) {
  const { fullPath } = assertFileExists(relativePath, 16);
  const buffer = fs.readFileSync(fullPath);
  const result = parseAvifHeader(buffer);
  assert.ok(
    result.valid,
    `File is not a valid AVIF image: ${relativePath} (boxType: ${result.boxType}, brand: ${result.majorBrand})`
  );
  return result;
}

export function assertValidGlb(relativePath, expectedExtensions = []) {
  const { fullPath } = assertFileExists(relativePath, 20);
  const buffer = fs.readFileSync(fullPath);
  const result = parseGlbHeader(buffer);
  assert.ok(
    result.valid,
    `File is not a valid glTF 2.0 binary (GLB): ${relativePath} (valid: ${result.valid}, magic: 0x${result.magic?.toString(16)}, version: ${result.version})`
  );

  for (const ext of expectedExtensions) {
    const isUsed = result.extensionsUsed.includes(ext) || result.extensionsRequired.includes(ext);
    assert.ok(
      isUsed,
      `GLB model ${relativePath} missing required extension: ${ext} (found: ${result.extensionsUsed.join(', ')})`
    );
  }

  return result;
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
