// Runs the IPA ruleset against a spec and writes a normalized, diffable snapshot of the results.
//
// Use it to show that a change to the ruleset does not change its results: snapshot the same spec before and after,
// then compare the two with scripts/ipa-snapshot-compare.js.
//
// Usage: node tools/spectral/ipa/scripts/ipa-snapshot.js --spec <oas-file> --out <dir> [--ruleset <ruleset-file>]
//
// Writes to <dir>:
//   findings.json  - what Spectral reports: [{ code, path, severity, message }], sorted.
//                    code is the rule name and path is the JSON path of the finding, e.g. "paths./groups.get".
//                    Source file paths are left out so snapshots from different checkouts compare equal.
//   collector.json - what the metrics collector records, per entry type (violations, adoptions, exceptions):
//                    { violations: [{ componentId, ruleName, count }] }. An adoption is a component that passed a
//                    rule. An exception is a component that failed a rule but carries x-xgen-IPA-exception for it, so
//                    no finding is reported (the entry also has an exceptionReason). These feed the metrics and do
//                    not line up one to one with the findings: adoptions and exceptions never appear in them.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IPA_DIR_IN_REPO = path.join('tools', 'spectral', 'ipa');
const REPO_ROOT = path.join(__dirname, '..', '..', '..', '..');
export const DEFAULT_RULESET = path.join(__dirname, '..', 'ipa-spectral.yaml');
const SPECTRAL_BIN = path.join(REPO_ROOT, 'node_modules', '.bin', 'spectral');
// Rulesets that predate IPA_COLLECTOR_FILE (e.g. an older ref checked out for comparison) write this file to the cwd
const DEFAULT_COLLECTOR_FILE_NAME = 'ipa-collector-results-combined.log';

// Spectral's raw output has no stable order and carries absolute source file paths, so keep only the fields that
// identify a finding and sort them. Two runs that find the same things then produce identical JSON.
export function normalizeFindings(results) {
  return results
    .map(({ code, path: jsonPath, severity, message }) => ({ code, path: jsonPath.join('.'), severity, message }))
    .sort(compareByJson);
}

// The collector appends entries in the order rules ran, and a component can be recorded more than once (for example a
// schema reached through several $refs). Group identical entries and count them, in a stable order, so the snapshot
// does not depend on run order but still notices when the number of entries changes.
export function normalizeCollectorEntries(entries) {
  const normalized = {};
  for (const [type, list] of Object.entries(entries)) {
    const counts = new Map();
    for (const entry of list) {
      const key = JSON.stringify(sortKeys(entry));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    normalized[type] = [...counts.entries()]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, count]) => ({ ...JSON.parse(key), count }));
  }
  return normalized;
}

// So that entries with the same fields in a different order give the same JSON key above
function sortKeys(object) {
  return Object.fromEntries(Object.entries(object).sort(([a], [b]) => (a < b ? -1 : 1)));
}

function compareByJson(a, b) {
  const x = JSON.stringify(a);
  const y = JSON.stringify(b);
  return x < y ? -1 : x > y ? 1 : 0;
}

/**
 * Checks out a git ref into a temporary worktree that shares this checkout's node_modules, so the ruleset of that ref
 * can be run without touching the working tree. Nothing needs building.
 *
 * @param {string} ref any git ref or commit
 * @returns {{dir: string, ruleset: string, remove: () => void}} the ruleset file inside the worktree
 */
export function checkoutWorktree(ref) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ipa-worktree-'));
  execFileSync('git', ['worktree', 'add', '--detach', dir, ref], { cwd: REPO_ROOT, stdio: 'ignore' });
  fs.symlinkSync(path.join(REPO_ROOT, 'node_modules'), path.join(dir, 'node_modules'));
  return {
    dir,
    ruleset: path.join(dir, IPA_DIR_IN_REPO, 'ipa-spectral.yaml'),
    remove: () => execFileSync('git', ['worktree', 'remove', '--force', dir], { cwd: REPO_ROOT, stdio: 'ignore' }),
  };
}

export function takeSnapshot({ spec, out, ruleset = DEFAULT_RULESET }) {
  fs.mkdirSync(out, { recursive: true });
  const rawFindingsFile = path.resolve(out, 'spectral-output.json');
  const rawCollectorFile = path.resolve(out, DEFAULT_COLLECTOR_FILE_NAME);
  fs.rmSync(rawCollectorFile, { force: true });

  // Running in the out dir keeps older rulesets from overwriting the collector log in the caller's cwd
  const result = spawnSync(
    SPECTRAL_BIN,
    ['lint', path.resolve(spec), '--ruleset', path.resolve(ruleset), '-f', 'json', '-o', rawFindingsFile],
    {
      cwd: out,
      encoding: 'utf-8',
      maxBuffer: 100 * 1024 * 1024,
      env: { ...process.env, IPA_COLLECTOR_FILE: rawCollectorFile },
    }
  );

  if (result.error) {
    throw result.error;
  }
  // Spectral exits 1 when it reports error-severity findings; anything else means the lint itself failed
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(`Spectral exited with status ${result.status}:\n${result.stderr}`);
  }
  if (!fs.existsSync(rawFindingsFile)) {
    throw new Error(`Spectral did not produce ${rawFindingsFile}:\n${result.stderr}`);
  }

  const findings = normalizeFindings(JSON.parse(fs.readFileSync(rawFindingsFile, 'utf-8')));
  const collectorEntries = fs.existsSync(rawCollectorFile)
    ? normalizeCollectorEntries(JSON.parse(fs.readFileSync(rawCollectorFile, 'utf-8')))
    : {};

  fs.writeFileSync(path.join(out, 'findings.json'), JSON.stringify(findings, null, 2));
  fs.writeFileSync(path.join(out, 'collector.json'), JSON.stringify(collectorEntries, null, 2));
  fs.rmSync(rawFindingsFile, { force: true });
  fs.rmSync(rawCollectorFile, { force: true });

  return { findings, collectorEntries };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({
    options: {
      spec: { type: 'string' },
      out: { type: 'string' },
      ruleset: { type: 'string', default: DEFAULT_RULESET },
    },
  });
  if (!values.spec || !values.out) {
    console.error('Usage: node ipa-snapshot.js --spec <oas-file> --out <dir> [--ruleset <ruleset-file>]');
    process.exit(2);
  }

  const { findings, collectorEntries } = takeSnapshot(values);
  const counts = Object.entries(collectorEntries)
    .map(([type, list]) => `${type}: ${list.reduce((sum, e) => sum + e.count, 0)}`)
    .join(', ');
  console.log(`Wrote snapshot to ${values.out} (findings: ${findings.length}; ${counts})`);
}
