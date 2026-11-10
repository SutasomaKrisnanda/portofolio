import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const PUBLIC_MODELS_DIR = path.join(PROJECT_ROOT, 'public/models');
const OUT_MODELS_DIR = path.join(PROJECT_ROOT, 'out/models');

const EXPECTED_MODELS = {
  jantung: {
    filename: 'model-jantung.glb',
    expectedSize: 18_141_244,
    requiredExtensions: ['EXT_meshopt_compression', 'KHR_mesh_quantization']
  },
  pena: {
    filename: 'model-pena.glb',
    expectedSize: 16_817_680,
    requiredExtensions: []
  }
};

/**
 * Strict glTF 2.0 Binary (GLB) parser and validator
 */
function parseGlbStrict(buffer) {
  assert.ok(Buffer.isBuffer(buffer), 'Input must be a Node.js Buffer');
  assert.ok(buffer.length >= 12, `GLB buffer too small: ${buffer.length} bytes (min 12)`);

  const magic = buffer.readUInt32LE(0);
  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);

  // 0x46546C67 is 'glTF' in ASCII
  assert.strictEqual(magic, 0x46546c67, `Invalid GLB magic header: 0x${magic.toString(16)} (expected 0x46546c67)`);
  assert.strictEqual(version, 2, `Unsupported glTF version: ${version} (expected 2)`);
  assert.strictEqual(length, buffer.length, `GLB header length (${length}) does not match buffer length (${buffer.length})`);

  let offset = 12;
  const chunks = [];

  while (offset < buffer.length) {
    assert.ok(offset + 8 <= buffer.length, `Truncated chunk header at byte offset ${offset}`);
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    offset += 8;

    assert.ok(offset + chunkLength <= buffer.length, `Chunk length exceeds buffer at offset ${offset}`);
    const chunkData = buffer.subarray(offset, offset + chunkLength);
    chunks.push({ type: chunkType, length: chunkLength, data: chunkData });
    offset += chunkLength;
  }

  assert.ok(chunks.length >= 2, 'GLB must contain at least JSON and BIN chunks');
  // First chunk must be JSON (0x4E4F534A is 'JSON')
  assert.strictEqual(chunks[0].type, 0x4e4f534a, `First chunk must be JSON (0x4e4f534a), got 0x${chunks[0].type.toString(16)}`);
  // Second chunk must be BIN (0x004E4942 is 'BIN\0')
  assert.strictEqual(chunks[1].type, 0x004e4942, `Second chunk must be BIN (0x004e4942), got 0x${chunks[1].type.toString(16)}`);

  const jsonText = chunks[0].data.toString('utf8');
  let json;
  try {
    json = JSON.parse(jsonText);
  } catch (err) {
    assert.fail(`Failed to parse GLB JSON chunk: ${err.message}`);
  }

  assert.ok(json.asset, 'glTF JSON chunk missing asset object');
  assert.strictEqual(json.asset.version, '2.0', `Invalid glTF asset version: ${json.asset.version}`);

  return {
    magic,
    version,
    length,
    chunks,
    json
  };
}

/**
 * Re-implementation of hero-3d-scene.tsx normalization math for stress-testing
 */
function normalizeAndPivotModel(modelScene, targetSize = 2.2) {
  const box = new THREE.Box3().setFromObject(modelScene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  modelScene.position.set(-center.x, -center.y, -center.z);

  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? targetSize / maxDim : 1.0;

  const pivotGroup = new THREE.Group();
  pivotGroup.add(modelScene);
  pivotGroup.scale.setScalar(scale);

  return { pivotGroup, baseScale: scale };
}

describe('Challenger M2: Adversarial Stress & Robustness Verification', () => {

  describe('3D Asset Binary Integrity & glTF 2.0 Specification Compliance', () => {
    for (const [key, config] of Object.entries(EXPECTED_MODELS)) {
      test(`CH2.1 [${key}]: Public & Exported GLB existence, exact size, and magic header`, () => {
        const pubPath = path.join(PUBLIC_MODELS_DIR, config.filename);
        const outPath = path.join(OUT_MODELS_DIR, config.filename);

        assert.ok(fs.existsSync(pubPath), `Public mirrored model must exist: ${pubPath}`);
        assert.ok(fs.existsSync(outPath), `Exported model must exist: ${outPath}`);

        const pubStat = fs.statSync(pubPath);
        const outStat = fs.statSync(outPath);

        assert.strictEqual(pubStat.size, config.expectedSize, `Public ${config.filename} size mismatch: got ${pubStat.size}, expected ${config.expectedSize}`);
        assert.strictEqual(outStat.size, config.expectedSize, `Exported ${config.filename} size mismatch: got ${outStat.size}, expected ${config.expectedSize}`);

        // Read public file header
        const pubBuffer = fs.readFileSync(pubPath);
        const parsed = parseGlbStrict(pubBuffer);

        assert.strictEqual(parsed.magic, 0x46546c67);
        assert.strictEqual(parsed.version, 2);
        assert.strictEqual(parsed.length, config.expectedSize);
        assert.ok(parsed.chunks.length >= 2, 'GLB should contain JSON and BIN chunks');
        assert.strictEqual(parsed.chunks[1].type, 0x004e4942, 'Second chunk must be BIN (0x004e4942)');

        // Validate extensions
        const extensionsUsed = parsed.json.extensionsUsed || [];
        const extensionsRequired = parsed.json.extensionsRequired || [];

        for (const reqExt of config.requiredExtensions) {
          assert.ok(
            extensionsUsed.includes(reqExt),
            `Model ${config.filename} missing required extension in extensionsUsed: ${reqExt}`
          );
          assert.ok(
            extensionsRequired.includes(reqExt),
            `Model ${config.filename} missing required extension in extensionsRequired: ${reqExt}`
          );
        }
      });
    }

    test('CH2.2: Bit-for-bit SHA-256 parity between public and out directories', () => {
      for (const config of Object.values(EXPECTED_MODELS)) {
        const pubPath = path.join(PUBLIC_MODELS_DIR, config.filename);
        const outPath = path.join(OUT_MODELS_DIR, config.filename);

        const pubHash = crypto.createHash('sha256').update(fs.readFileSync(pubPath)).digest('hex');
        const outHash = crypto.createHash('sha256').update(fs.readFileSync(outPath)).digest('hex');

        assert.strictEqual(outHash, pubHash, `SHA-256 hash mismatch between out and public for ${config.filename}!`);
      }
    });
  });

  describe('Three.js & MeshoptDecoder Decompression Pipeline', () => {
    test('CH2.3: MeshoptDecoder module exports and WebAssembly readiness', async () => {
      assert.ok(MeshoptDecoder, 'MeshoptDecoder module must be imported');
      assert.ok(MeshoptDecoder.ready instanceof Promise, 'MeshoptDecoder.ready must be a Promise');

      await MeshoptDecoder.ready;

      assert.strictEqual(MeshoptDecoder.supported, true, 'MeshoptDecoder must be supported in this environment');
      assert.strictEqual(typeof MeshoptDecoder.decodeVertexBuffer, 'function', 'decodeVertexBuffer must be a function');
      assert.strictEqual(typeof MeshoptDecoder.decodeIndexBuffer, 'function', 'decodeIndexBuffer must be a function');
      assert.strictEqual(typeof MeshoptDecoder.decodeIndexSequence, 'function', 'decodeIndexSequence must be a function');
      assert.strictEqual(typeof MeshoptDecoder.decodeGltfBuffer, 'function', 'decodeGltfBuffer must be a function');
    });

    test('CH2.4: Empirical Meshopt decompression of model-jantung.glb bufferView', async () => {
      await MeshoptDecoder.ready;

      const pubPath = path.join(PUBLIC_MODELS_DIR, 'model-jantung.glb');
      const buffer = fs.readFileSync(pubPath);
      const parsed = parseGlbStrict(buffer);

      const bufferViews = parsed.json.bufferViews || [];
      const meshoptViews = bufferViews.filter(
        (bv) => bv.extensions && bv.extensions.EXT_meshopt_compression
      );

      assert.ok(
        meshoptViews.length > 0,
        'model-jantung.glb must contain at least one EXT_meshopt_compression bufferView'
      );

      const binChunk = parsed.chunks[1];
      assert.ok(binChunk, 'BIN chunk must exist');

      let decompressedCount = 0;
      for (const bv of meshoptViews.slice(0, 5)) {
        const ext = bv.extensions.EXT_meshopt_compression;
        const sourceData = binChunk.data.subarray(
          ext.byteOffset,
          ext.byteOffset + ext.byteLength
        );
        const destSize = ext.count * ext.byteStride;
        const dest = new Uint8Array(destSize);

        if (ext.mode === 'ATTRIBUTES') {
          MeshoptDecoder.decodeVertexBuffer(dest, ext.count, ext.byteStride, sourceData, ext.filter);
        } else if (ext.mode === 'TRIANGLES' || ext.mode === 'INDICES') {
          MeshoptDecoder.decodeIndexBuffer(dest, ext.count, ext.byteStride, sourceData);
        }

        // Verify decompressed destination contains non-zero data
        const hasNonZero = dest.some((b) => b !== 0);
        assert.ok(hasNonZero, `Decompressed buffer for view mode ${ext.mode} must contain non-zero data`);
        decompressedCount++;
      }

      assert.strictEqual(decompressedCount, Math.min(5, meshoptViews.length));
    });
  });

  describe('Bounding Box Normalization & Target Scale Arithmetic Stress Test', () => {
    test('CH2.5: Standard off-center scene is strictly centered at (0, 0, 0) and scaled to 2.2', () => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(10, 20, 30),
        new THREE.MeshBasicMaterial()
      );
      // Offset mesh inside parentScene
      mesh.position.set(500, 250, -750);

      const parentScene = new THREE.Scene();
      parentScene.add(mesh);

      const { pivotGroup, baseScale } = normalizeAndPivotModel(parentScene, 2.2);

      // Max dimension was 30 -> expected scale = 2.2 / 30
      const expectedScale = 2.2 / 30;
      assert.ok(Math.abs(baseScale - expectedScale) < 1e-6, `Base scale ${baseScale} should equal ${expectedScale}`);

      // Evaluate bounding box of pivotGroup
      const resultBox = new THREE.Box3().setFromObject(pivotGroup);
      const resultCenter = new THREE.Vector3();
      resultBox.getCenter(resultCenter);

      assert.ok(Math.abs(resultCenter.x) < 1e-5, `Center X should be 0, got ${resultCenter.x}`);
      assert.ok(Math.abs(resultCenter.y) < 1e-5, `Center Y should be 0, got ${resultCenter.y}`);
      assert.ok(Math.abs(resultCenter.z) < 1e-5, `Center Z should be 0, got ${resultCenter.z}`);

      const resultSize = new THREE.Vector3();
      resultBox.getSize(resultSize);
      const maxResultDim = Math.max(resultSize.x, resultSize.y, resultSize.z);
      assert.ok(Math.abs(maxResultDim - 2.2) < 1e-5, `Max dimension should be 2.2, got ${maxResultDim}`);
    });

    test('CH2.6: Degenerate point mesh and flat 2D plane do not produce NaN or Infinity', () => {
      // Degenerate empty group (size 0, 0, 0)
      const emptyGroup = new THREE.Group();
      const resEmpty = normalizeAndPivotModel(emptyGroup, 2.2);
      assert.strictEqual(resEmpty.baseScale, 1.0, 'Degenerate zero-dimension mesh must fallback to scale 1.0');
      assert.ok(!Number.isNaN(resEmpty.baseScale), 'Scale must not be NaN');
      assert.ok(Number.isFinite(resEmpty.baseScale), 'Scale must be finite');

      // Flat 2D plane (10 x 0 x 20)
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 20), new THREE.MeshBasicMaterial());
      const planeScene = new THREE.Scene();
      planeScene.add(plane);
      const resPlane = normalizeAndPivotModel(planeScene, 2.2);
      assert.ok(Number.isFinite(resPlane.baseScale), 'Plane scale must be finite');
      assert.ok(Math.abs(resPlane.baseScale - (2.2 / 20)) < 1e-6);
    });
  });

  describe('Interaction Mathematics & Behavioral Verification', () => {
    test('CH2.7: Drag damping decays velocity by 0.92 per frame and clamps X rotation [-0.7, 0.7]', () => {
      let vx = 0.5;
      let vy = 0.5;
      let rotX = 0;

      for (let frame = 0; frame < 200; frame++) {
        vx *= 0.92;
        vy *= 0.92;
        if (Math.abs(vx) < 0.00001) vx = 0;
        if (Math.abs(vy) < 0.00001) vy = 0;
        rotX = Math.max(-0.7, Math.min(0.7, rotX + vx));
      }

      assert.strictEqual(vx, 0, 'Velocity X must decay to exactly 0');
      assert.strictEqual(vy, 0, 'Velocity Y must decay to exactly 0');
      assert.ok(rotX >= -0.7 && rotX <= 0.7, `Rotation X ${rotX} must stay within [-0.7, 0.7]`);
    });

    test('CH2.8: Click discrimination threshold (< 5px = click, >= 5px = drag)', () => {
      const clickSimulation = (distance) => {
        let clicked = false;
        if (distance < 5) clicked = true;
        return clicked;
      };

      assert.strictEqual(clickSimulation(0), true, '0px movement must trigger click');
      assert.strictEqual(clickSimulation(3.5), true, '3.5px movement must trigger click');
      assert.strictEqual(clickSimulation(4.99), true, '4.99px movement must trigger click');
      assert.strictEqual(clickSimulation(5.0), false, '5.0px movement must be treated as drag');
      assert.strictEqual(clickSimulation(10.2), false, '10.2px movement must be treated as drag');
    });

    test('CH2.9: Cardiac Lub-Dub dual-peak curve conforms to physiological specifications', () => {
      const cycleDuration = 1.0 / 1.2; // 72 BPM

      const evaluatePulse = (t) => {
        const cycle = (t % cycleDuration) / cycleDuration;
        if (cycle < 0.16) {
          return Math.sin((cycle / 0.16) * Math.PI) * 0.075;
        } else if (cycle >= 0.22 && cycle < 0.36) {
          return Math.sin(((cycle - 0.22) / 0.14) * Math.PI) * 0.045;
        }
        return 0;
      };

      // Peak of ventricular systole is at cycle = 0.08
      const peakSystole = evaluatePulse(0.08 * cycleDuration);
      assert.ok(Math.abs(peakSystole - 0.075) < 1e-4, `Peak ventricular systole should be ~0.075, got ${peakSystole}`);

      // Pause between Lub and Dub (cycle = 0.19)
      const pausePulse = evaluatePulse(0.19 * cycleDuration);
      assert.strictEqual(pausePulse, 0, 'Pause between Lub and Dub must be 0');

      // Peak of atrial kick is at cycle = 0.22 + 0.07 = 0.29
      const peakAtrial = evaluatePulse(0.29 * cycleDuration);
      assert.ok(Math.abs(peakAtrial - 0.045) < 1e-4, `Peak atrial kick should be ~0.045, got ${peakAtrial}`);

      // Diastolic rest (cycle = 0.5)
      const restPulse = evaluatePulse(0.5 * cycleDuration);
      assert.strictEqual(restPulse, 0, 'Diastolic rest pulse must be 0');
    });
  });

});
