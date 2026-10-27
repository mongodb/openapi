import { describe, expect, it } from '@jest/globals';
import {
  allOf,
  anyOf,
  defineCondition,
  evaluate,
  listConditions,
  not,
} from '../../rulesets/functions/utils/conditions/registry';
import { RuleContext } from '../../rulesets/functions/utils/ruleContext';

describe('tools/spectral/ipa/rulesets/functions/utils/conditions', () => {
  describe('combinators', () => {
    const yes = defineCondition({ id: 'test.yes', fn: () => true });
    const no = defineCondition({ id: 'test.no', fn: () => false });
    const named = defineCondition({ id: 'test.named', of: allOf(yes, no) });

    it('reports the failing leaf of an anonymous allOf', () => {
      expect(evaluate(allOf(yes, no), {})).toEqual({ pass: false, failedAt: ['test.no'] });
    });

    it('reports a named composite and the operand that failed', () => {
      expect(evaluate(named, {})).toEqual({ pass: false, failedAt: ['test.named', 'test.no'] });
    });

    it('evaluates not and anyOf', () => {
      expect(evaluate(not(no), {}).pass).toBe(true);
      expect(evaluate(not(yes), {})).toEqual({ pass: false, failedAt: ['not(test.yes)'] });
      expect(evaluate(anyOf(no, yes), {}).pass).toBe(true);
      expect(evaluate(anyOf(no, no), {}).pass).toBe(false);
    });

    it('short-circuits like && and ||', () => {
      const throws = defineCondition({
        id: 'test.throws',
        fn: () => {
          throw new Error('evaluated');
        },
      });
      expect(evaluate(allOf(no, throws), {}).pass).toBe(false);
      expect(evaluate(anyOf(yes, throws), {}).pass).toBe(true);
    });

    it('rejects duplicate ids', () => {
      expect(() => defineCondition({ id: 'test.yes', fn: () => true })).toThrow('already defined');
    });

    it('lists the defined conditions', () => {
      expect(listConditions().map((c) => c.id)).toContain('test.named');
    });
  });

  describe('RuleContext', () => {
    const calls = [];
    const counted = defineCondition({
      id: 'test.counted',
      fn: () => {
        calls.push(1);
        return true;
      },
    });
    const context = new RuleContext({
      input: {},
      options: {},
      path: ['paths', '/groups/{groupId}', 'get'],
      ruleName: 'test-rule',
      oas: { paths: { '/groups/{groupId}': { get: { summary: 's' } } } },
    });

    it('evaluates a condition once per call', () => {
      context.is(counted);
      context.is(counted);
      expect(calls).toHaveLength(1);
    });

    it('derives the resource path and operation from the path', () => {
      expect(context.resourcePath).toBe('/groups/{groupId}');
      expect(context.operation).toEqual({ summary: 's' });
      expect(context.node).toEqual({ summary: 's' });
    });
  });
});
