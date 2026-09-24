// Compares two snapshots written by scripts/ipa-snapshot.js and reports per-rule differences.
//
// Usage: node tools/spectral/ipa/scripts/ipa-snapshot-compare.js <base-dir> <head-dir> [--verbose]
//
// Prints, for the findings and for each collector entry type, which rules gained (+) or lost (-) entries, and with
// --verbose the entries themselves. Exits 0 when the snapshots are identical and 1 otherwise, so it can be used to
// prove that a refactor is behavior-neutral.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

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
    options: { verbose: { type: 'boolean', short: 'v', default: false } },
  });
  if (positionals.length !== 2) {
    console.error('Usage: node ipa-snapshot-compare.js <base-dir> <head-dir> [--verbose]');
    process.exit(2);
  }

  const { findings, collector } = compareSnapshots(positionals[0], positionals[1]);
  printSection('Findings', findings, values.verbose, (f) => `${f.path}: ${f.message}`);
  for (const [type, diff] of Object.entries(collector)) {
    printSection(`Collector ${type}`, diff, values.verbose, (e) => e.componentId);
  }

  const identical = findings.size === 0 && Object.values(collector).every((diff) => diff.size === 0);
  process.exit(identical ? 0 : 1);
}
