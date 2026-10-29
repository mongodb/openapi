// Compares the results of the IPA ruleset at two points and reports per-rule differences.
//
// Usage: node tools/spectral/ipa/scripts/ipa-snapshot-compare.js --spec <oas-file> --base <git-ref> [--head <git-ref>] [--verbose]
//        node tools/spectral/ipa/scripts/ipa-snapshot-compare.js <base-dir> <head-dir> [--verbose]
//
// With --base, each side is linted with the ruleset of that git ref, checked out into a temporary worktree and removed
// afterwards. Without --head, the head is this checkout as it is now, including uncommitted changes. This script and
// the spec always come from this checkout, so the base ref does not need to contain them.
//
// With two directories, compares snapshots already written by scripts/ipa-snapshot.js.
//
// Prints, for the findings and for each collector entry type, which rules gained (+) or lost (-) entries, and with
// --verbose the entries themselves. Exits 0 when the results are identical and 1 otherwise, so it can be used to
// prove that a refactor is behavior-neutral.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { DEFAULT_RULESET, checkoutWorktree, takeSnapshot } from './ipa-snapshot.js';

/**
 * Computes the multiset difference between two lists of entries, grouped by rule. An entry that appears three times in
 * base and twice in head counts as one removed.
 *
 * @param {Array<Object>} base entries, optionally carrying a 'count' multiplicity
 * @param {Array<Object>} head entries, optionally carrying a 'count' multiplicity
 * @param {(entry: Object) => string} ruleOf returns the rule name of an entry
 * @returns {Map<string, {added: Array<Object>, removed: Array<Object>}>} differences per rule, only for rules that differ
 */
export function diffEntries(base, head, ruleOf) {
  const counts = new Map();
  const tally = (list, sign) => {
    for (const entry of list) {
      const { count = 1, ...rest } = entry;
      const key = JSON.stringify(rest);
      const delta = sign * count;
      counts.set(key, (counts.get(key) ?? 0) + delta);
    }
  };
  tally(base, -1);
  tally(head, 1);

  const byRule = new Map();
  for (const [key, delta] of counts) {
    if (delta === 0) {
      continue;
    }
    const entry = JSON.parse(key);
    const rule = ruleOf(entry);
    if (!byRule.has(rule)) {
      byRule.set(rule, { added: [], removed: [] });
    }
    const bucket = delta > 0 ? byRule.get(rule).added : byRule.get(rule).removed;
    bucket.push({ ...entry, count: Math.abs(delta) });
  }
  return byRule;
}

/**
 * Compares two snapshot directories.
 *
 * @param {string} baseDir
 * @param {string} headDir
 * @returns {{findings: Map, collector: Object<string, Map>}} differences for findings and for each collector entry type
 */
export function compareSnapshots(baseDir, headDir) {
  const read = (dir, file) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
  const findings = diffEntries(read(baseDir, 'findings.json'), read(headDir, 'findings.json'), (f) => f.code);

  const baseCollector = read(baseDir, 'collector.json');
  const headCollector = read(headDir, 'collector.json');
  const collector = {};
  for (const type of new Set([...Object.keys(baseCollector), ...Object.keys(headCollector)])) {
    collector[type] = diffEntries(baseCollector[type] ?? [], headCollector[type] ?? [], (e) => e.ruleName);
  }
  return { findings, collector };
}

/**
 * Lints a spec with the ruleset at two git refs and compares the results. The temporary worktrees and snapshots are
 * removed afterwards.
 *
 * @param {Object} params
 * @param {string} params.spec the OpenAPI file, linted unchanged on both sides
 * @param {string} params.base git ref for the base ruleset
 * @param {string} [params.head] git ref for the head ruleset; this checkout, as it is now, when omitted
 * @returns {{findings: Map, collector: Object<string, Map>}} see compareSnapshots
 */
export function compareRefs({ spec, base, head }) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ipa-snapshot-compare-'));
  const worktrees = [];
  const snapshotOf = (name, ref) => {
    let ruleset = DEFAULT_RULESET;
    if (ref) {
      const worktree = checkoutWorktree(ref);
      worktrees.push(worktree);
      ruleset = worktree.ruleset;
    }
    const out = path.join(tmp, name);
    takeSnapshot({ spec, out, ruleset });
    return out;
  };
  try {
    const baseDir = snapshotOf('base', base);
    const headDir = snapshotOf('head', head);
    return compareSnapshots(baseDir, headDir);
  } finally {
    worktrees.forEach((worktree) => worktree.remove());
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function sum(list) {
  return list.reduce((total, entry) => total + entry.count, 0);
}

function printSection(title, diff, verbose, describe) {
  if (diff.size === 0) {
    console.log(`${title}: identical`);
    return;
  }
  console.log(`${title}:`);
  for (const rule of [...diff.keys()].sort()) {
    const { added, removed } = diff.get(rule);
    console.log(`  ${rule}: +${sum(added)} -${sum(removed)}`);
    if (verbose) {
      removed.forEach((e) => console.log(`    - ${describe(e)}${e.count > 1 ? ` (x${e.count})` : ''}`));
      added.forEach((e) => console.log(`    + ${describe(e)}${e.count > 1 ? ` (x${e.count})` : ''}`));
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      verbose: { type: 'boolean', short: 'v', default: false },
      spec: { type: 'string' },
      base: { type: 'string' },
      head: { type: 'string' },
    },
  });
  const byRef = Boolean(values.spec && values.base) && positionals.length === 0;
  const byDir = positionals.length === 2 && !values.spec && !values.base && !values.head;
  if (!byRef && !byDir) {
    console.error(
      'Usage: node ipa-snapshot-compare.js --spec <oas-file> --base <git-ref> [--head <git-ref>] [--verbose]'
    );
    console.error('       node ipa-snapshot-compare.js <base-dir> <head-dir> [--verbose]');
    process.exit(2);
  }

  const { findings, collector } = byRef ? compareRefs(values) : compareSnapshots(positionals[0], positionals[1]);
  printSection('Findings', findings, values.verbose, (f) => `${f.path}: ${f.message}`);
  for (const [type, diff] of Object.entries(collector)) {
    printSection(`Collector ${type}`, diff, values.verbose, (e) => e.componentId);
  }

  const identical = findings.size === 0 && Object.values(collector).every((diff) => diff.size === 0);
  process.exit(identical ? 0 : 1);
}
