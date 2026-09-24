import { describe, expect, it } from '@jest/globals';
import { normalizeCollectorEntries, normalizeFindings } from '../../scripts/ipa-snapshot';
import { diffEntries } from '../../scripts/ipa-snapshot-compare';

describe('tools/spectral/ipa/scripts/ipa-snapshot.js', () => {
  it('sorts findings and drops the source file', () => {
    const finding = (code, jsonPath) => ({ code, path: jsonPath, severity: 0, message: 'm', source: '/tmp/a.yaml' });
    expect(normalizeFindings([finding('b', ['paths', '/b']), finding('a', ['paths', '/a'])])).toEqual([
      { code: 'a', path: 'paths./a', severity: 0, message: 'm' },
      { code: 'b', path: 'paths./b', severity: 0, message: 'm' },
    ]);
  });

  it('counts identical collector entries regardless of key order', () => {
    const normalized = normalizeCollectorEntries({
      violations: [
        { ruleName: 'r', componentId: 'c' },
        { componentId: 'c', ruleName: 'r' },
        { ruleName: 'r', componentId: 'd' },
      ],
    });
    expect(normalized.violations).toEqual([
      { componentId: 'c', ruleName: 'r', count: 2 },
      { componentId: 'd', ruleName: 'r', count: 1 },
    ]);
  });
});

describe('tools/spectral/ipa/scripts/ipa-snapshot-compare.js', () => {
  const ruleOf = (entry) => entry.ruleName;

  it('reports nothing for identical entries', () => {
    const entries = [{ ruleName: 'r', componentId: 'c', count: 2 }];
    expect(diffEntries(entries, entries, ruleOf).size).toBe(0);
  });

  it('reports added and removed entries per rule, using the count difference', () => {
    const base = [
      { ruleName: 'r', componentId: 'c', count: 2 },
      { ruleName: 'r', componentId: 'gone' },
    ];
    const head = [
      { ruleName: 'r', componentId: 'c', count: 3 },
      { ruleName: 's', componentId: 'new' },
    ];
    const diff = diffEntries(base, head, ruleOf);
    expect(diff.get('r')).toEqual({
      added: [{ ruleName: 'r', componentId: 'c', count: 1 }],
      removed: [{ ruleName: 'r', componentId: 'gone', count: 1 }],
    });
    expect(diff.get('s')).toEqual({ added: [{ ruleName: 's', componentId: 'new', count: 1 }], removed: [] });
  });
});
