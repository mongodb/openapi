import { describe, expect, it } from '@jest/globals';
import { defineRule } from '../../rulesets/functions/utils/defineRule';
import { defineCondition } from '../../rulesets/functions/utils/conditions/registry';

const holds = defineCondition({ id: 'defineRuleTest.holds', fn: () => true });
const fails = defineCondition({ id: 'defineRuleTest.fails', fn: () => false });

const spectralContext = {
  path: ['paths', '/resource', 'get'],
  documentInventory: { resolved: { paths: { '/resource': { get: {} } } }, unresolved: { paths: {} } },
  rule: { name: 'test-rule' },
};

describe('tools/spectral/ipa/rulesets/functions/utils/defineRule.js', () => {
  it('attaches the conditions as meta', () => {
    const rule = defineRule({ appliesTo: [holds], check: () => [] });
    expect(rule.meta).toEqual({ appliesTo: [holds], document: 'resolved' });
  });

  it('does not run the check when a condition fails', () => {
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
  });

  it('returns the errors of the check when the rule applies', () => {
    const rule = defineRule({ appliesTo: [holds], check: ({ path }) => [{ path, message: 'bad' }] });
    expect(rule({}, null, spectralContext)).toEqual([{ path: spectralContext.path, message: 'bad' }]);
  });

  it('gives the check the context and options', () => {
    const rule = defineRule({
      check: ({ options, resourcePath, path }) => [{ path, message: `${options.a} ${resourcePath}` }],
    });
    expect(rule({}, { a: 'x' }, spectralContext)).toEqual([{ path: spectralContext.path, message: 'x /resource' }]);
  });

  it('reads the unresolved document when asked to', () => {
    const rule = defineRule({
      document: 'unresolved',
      check: ({ oas, path }) => [{ path, message: String(oas.paths['/resource']) }],
    });
    expect(rule({}, null, spectralContext)[0].message).toBe('undefined');
  });

  it('lets an exception in a condition fail the lint run', () => {
    const throws = defineCondition({
      id: 'defineRuleTest.throws',
      fn: () => {
        throw new Error('condition');
      },
    });
    expect(() => defineRule({ appliesTo: [throws], check: () => [] })({}, null, spectralContext)).toThrow('condition');
  });

  it('names the function after the rule, so a crash outside the check says which rule', () => {
    const rule = defineRule({ check: () => [] });
    rule({}, null, spectralContext);
    expect(rule.name).toBe('test-rule');
  });
});
