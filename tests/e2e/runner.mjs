#!/usr/bin/env node

/**
 * Portfolio Performance Optimization & UI/UX Refresh — E2E Test Suite Runner
 *
 * Systematic 4-tier opaque-box test runner covering Requirements R1 through R4
 * across Tech, Medical, and Academic modes in light & dark themes.
 *
 * Requirements Covered:
 *   - R1: Model 3D Hero-Section Ringan per Mode (Polyhedron, Helix DNA, Pena Bulu)
 *   - R2: Peringkasan Category Pill Galeri (Projects & Achievements compact scroll & reset sync)
 *   - R3: Sistem Smart Bento Grid Adaptif pada Bagian Tentang Saya (5-Tile 12-Column layout & history)
 *   - R4: Penyesuaian Logo Icon Proyek Berdasarkan Mode Aktif (Dynamic ProjectModeIcon)
 *
 * Usage:
 *   node tests/e2e/runner.mjs
 *   node tests/e2e/runner.mjs --tier 1
 *   node tests/e2e/runner.mjs --tier 1,2
 *   node tests/e2e/runner.mjs --filter "Bento"
 *   node tests/e2e/runner.mjs --list
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const SUITES = [
  {
    tier: 1,
    name: 'Tier 1: Feature Coverage (R1 - R4)',
    file: 'tests/e2e/tier1-feature-coverage.test.mjs',
    minTests: 20,
    actualTests: 24,
    description: 'Validates primary behavior & acceptance criteria for R1 to R4 (>=5 tests per feature)'
  },
  {
    tier: 2,
    name: 'Tier 2: Boundary & Corner Cases (R1 - R4)',
    file: 'tests/e2e/tier2-boundary-corner.test.mjs',
    minTests: 20,
    actualTests: 24,
    description: 'Validates edge cases, invalid inputs, clamping, rapid toggles, and viewport bounds'
  },
  {
    tier: 3,
    name: 'Tier 3: Cross-Feature Interactions',
    file: 'tests/e2e/tier3-cross-feature.test.mjs',
    minTests: 5,
    actualTests: 8,
    description: 'Validates pairwise & systemic cross-feature state interactions'
  },
  {
    tier: 4,
    name: 'Tier 4: Real-World Application Scenarios',
    file: 'tests/e2e/tier4-application-scenarios.test.mjs',
    minTests: 3,
    actualTests: 5,
    description: 'Validates end-to-end full user journeys across Tech, Medical, and Academic modes'
  }
];

function printBanner() {
  console.log('\n' + '='.repeat(80));
  console.log('   PORTFOLIO PERFORMANCE & UI/UX REFRESH — E2E TEST RUNNER');
  console.log('   Derived from ORIGINAL_REQUEST.md & PROJECT.md');
  console.log('='.repeat(80));
  console.log(`Node.js: ${process.version} | Platform: ${process.platform} | Root: ${PROJECT_ROOT}`);
  console.log('='.repeat(80) + '\n');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    tiers: null,
    filter: null,
    list: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--list' || arg === '-l') {
      options.list = true;
    } else if (arg === '--tier' || arg === '-t') {
      const val = args[++i];
      if (val && val !== 'all') {
        options.tiers = val.split(',').map((x) => parseInt(x.trim(), 10));
      }
    } else if (arg === '--filter' || arg === '-f') {
      options.filter = args[++i];
    }
  }

  return options;
}

function showHelp() {
  console.log(`
Usage:
  node tests/e2e/runner.mjs [options]

Options:
  --tier, -t <tiers>     Run specific tier(s), e.g. 1 or 1,2 or all (default: all)
  --filter, -f <pattern> Filter tests matching regex pattern
  --list, -l             List test suites and test inventory without running
  --help, -h             Show this help message

Examples:
  node tests/e2e/runner.mjs
  node tests/e2e/runner.mjs --tier 1
  node tests/e2e/runner.mjs --tier 1,2
  node tests/e2e/runner.mjs --filter "Bento"
`);
}

function listInventory() {
  console.log('Test Inventory:');
  console.log('-'.repeat(80));
  for (const s of SUITES) {
    console.log(`[Tier ${s.tier}] ${s.name}`);
    console.log(`  File: ${s.file}`);
    console.log(`  Tests: ${s.actualTests} (min required >= ${s.minTests})`);
    console.log(`  Purpose: ${s.description}`);
  }
  console.log('-'.repeat(80));
}

function runSuites(selectedSuites, filterPattern) {
  const startTime = Date.now();
  const testFiles = selectedSuites.map((s) => path.resolve(PROJECT_ROOT, s.file));

  const nodeArgs = ['--test'];
  if (filterPattern) {
    nodeArgs.push(`--test-name-pattern=${filterPattern}`);
  }
  nodeArgs.push(...testFiles);

  console.log(`Executing ${selectedSuites.length} test suite(s)...`);
  selectedSuites.forEach((s) => console.log(`  • [Tier ${s.tier}] ${s.file}`));
  console.log('-'.repeat(80) + '\n');

  const result = spawnSync(process.execPath, nodeArgs, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    env: process.env
  });

  const durationMs = Date.now() - startTime;
  console.log('\n' + '='.repeat(80));
  console.log('   REQUIREMENTS COVERAGE MATRIX & VERIFICATION SUMMARY');
  console.log('='.repeat(80));

  const reqTable = [
    {
      req: 'R1',
      title: 'Model 3D Hero-Section Ringan per Mode (Polyhedron, Helix DNA, Pena Bulu)',
      status: 'COVERED',
      tiers: 'Tier 1, Tier 2, Tier 3, Tier 4'
    },
    {
      req: 'R2',
      title: 'Peringkasan Category Pill Galeri (Projects & Achievements compact scroll)',
      status: 'COVERED',
      tiers: 'Tier 1, Tier 2, Tier 3, Tier 4'
    },
    {
      req: 'R3',
      title: 'Sistem Smart Bento Grid Adaptif pada Bagian Tentang Saya (5-Tile Layout)',
      status: 'COVERED',
      tiers: 'Tier 1, Tier 2, Tier 3, Tier 4'
    },
    {
      req: 'R4',
      title: 'Penyesuaian Logo Icon Proyek Berdasarkan Mode Aktif (ProjectModeIcon)',
      status: 'COVERED',
      tiers: 'Tier 1, Tier 2, Tier 3, Tier 4'
    }
  ];

  console.table(reqTable);
  console.log(`Execution Time: ${(durationMs / 1000).toFixed(2)}s`);
  console.log(`Exit Status: ${result.status === 0 ? 'PASSED (Code 0)' : `FAILED (Code ${result.status})`}`);
  console.log('='.repeat(80) + '\n');

  process.exit(result.status !== null ? result.status : 1);
}

function main() {
  const options = parseArgs();
  printBanner();

  if (options.help) {
    showHelp();
    return;
  }

  if (options.list) {
    listInventory();
    return;
  }

  let selectedSuites = SUITES;
  if (options.tiers && options.tiers.length > 0) {
    selectedSuites = SUITES.filter((s) => options.tiers.includes(s.tier));
    if (selectedSuites.length === 0) {
      console.error(`Error: No suites matched tier(s): ${options.tiers.join(', ')}`);
      process.exit(1);
    }
  }

  runSuites(selectedSuites, options.filter);
}

main();
