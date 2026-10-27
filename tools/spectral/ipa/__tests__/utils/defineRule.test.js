import { beforeEach, describe, expect, it } from '@jest/globals';
import collector, { EntryType } from '../../metrics/collector';
import { defineRule } from '../../rulesets/functions/utils/defineRule';
import { defineCondition } from '../../rulesets/functions/utils/conditions/registry';

const holds = defineCondition({ id: 'defineRuleTest.holds', fn: () => true });
const fails = defineCondition({ id: 'defineRuleTest.fails', fn: () => false });

const spectralContext = {
  path: ['paths', '/resource', 'get'],
  documentInventory: { resolved: { paths: { '/resource': { get: {} } } }, unresolved: { paths: {} } },
  rule: { name: 'test-rule' },
};

function collected() {
  return Object.fromEntries(Object.entries(collector.entries).map(([type, list]) => [type, list.length]));
}

describe('tools/spectral/ipa/rulesets/functions/utils/defineRule.js', () => {
  beforeEach(() => {
    collector.entries = { [EntryType.VIOLATION]: [], [EntryType.ADOPTION]: [], [EntryType.EXCEPTION]: [] };
  });

  it('attaches the conditions as meta', () => {
    const rule = defineRule({ appliesTo: [holds], check: () => [] });
    expect(rule.meta).toEqual({
      appliesTo: [holds],
      checkUses: [],
      document: 'resolved',
      onInternalError: 'violation',
    });
  });

  it('does not run the check or collect when a condition fails', () => {
    let checked = false;
    const rule = defineRule({
      appliesTo: [holds, fails],
      check: () => {
        checked = true;
        return [];
      },
    });
    expect(rule({}, null, spectralContext)).toBeUndefined();
    expect(checked).toBe(false);
    expect(collected()).toEqual({ violations: 0, adoptions: 0, exceptions: 0 });
  });

  it('collects an adoption when the check returns no errors', () => {
    const rule = defineRule({ appliesTo: [holds], check: () => [] });
    expect(rule({}, null, spectralContext)).toBeUndefined();
    expect(collected()).toEqual({ violations: 0, adoptions: 1, exceptions: 0 });
  });

  it('collects an exception from the exception target', () => {
    const rule = defineRule({
      check: ({ path }) => [{ path, message: 'bad' }],
      exceptionTarget: () => ({ 'x-xgen-IPA-exception': { 'test-rule': 'reason' } }),
    });
    expect(rule({}, null, spectralContext)).toBeUndefined();
    expect(collected()).toEqual({ violations: 0, adoptions: 0, exceptions: 1 });
  });

  it('gives the check the context and options', () => {
    const rule = defineRule({
      check: ({ options, resourcePath, path }) => [{ path, message: `${options.a} ${resourcePath}` }],
    });
    expect(rule({}, { a: 'x' }, spectralContext)).toEqual([{ path: spectralContext.path, message: 'x /resource' }]);
  });

  it('runs beforeCheck only when the rule applies, and lets its exceptions propagate', () => {
    const beforeCheck = () => {
      throw new Error('before');
    };
    expect(() => defineRule({ appliesTo: [holds], beforeCheck, check: () => [] })({}, null, spectralContext)).toThrow(
      'before'
    );
    expect(() =>
      defineRule({ appliesTo: [fails], beforeCheck, check: () => [] })({}, null, spectralContext)
    ).not.toThrow();
  });

  it('reads the unresolved document when asked to', () => {
    const rule = defineRule({
      document: 'unresolved',
      check: ({ oas, path }) => [{ path, message: String(oas.paths['/resource']) }],
    });
    expect(rule({}, null, spectralContext)[0].message).toBe('undefined');
  });

  it('names the function after the rule, so a crash outside the check says which rule', () => {
    const rule = defineRule({ check: () => [] });
    rule({}, null, spectralContext);
    expect(rule.name).toBe('test-rule');
  });

  describe('when the check throws', () => {
    const throwing = () => {
      throw new Error('boom');
    };

    it("reports and collects a violation in 'violation' mode", () => {
      const rule = defineRule({ check: throwing });
      expect(rule({}, null, spectralContext)[0].message).toContain('test-rule Internal Rule Error: Error: boom');
      expect(collected()).toEqual({ violations: 1, adoptions: 0, exceptions: 0 });
    });

    it("reports without collecting in 'return' mode", () => {
      const rule = defineRule({ check: throwing, onInternalError: 'return' });
      expect(rule({}, null, spectralContext)[0].message).toContain('Internal Rule Error');
      expect(collected()).toEqual({ violations: 0, adoptions: 0, exceptions: 0 });
    });

    it("propagates in 'throw' mode", () => {
      const rule = defineRule({ check: throwing, onInternalError: 'throw' });
      expect(() => rule({}, null, spectralContext)).toThrow('boom');
    });
  });
});
