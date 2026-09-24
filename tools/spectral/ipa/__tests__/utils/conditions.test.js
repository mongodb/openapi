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
import '../../rulesets/functions/utils/conditions/path';
import '../../rulesets/functions/utils/conditions/resource';
import '../../rulesets/functions/utils/conditions/operation';
import '../../rulesets/functions/utils/conditions/response';

function contextFrom({ input, options, path, paths = {} }) {
  return new RuleContext({ input, options, path, ruleName: 'test-rule', oas: { paths } });
}

describe('tools/spectral/ipa/rulesets/functions/utils/conditions', () => {
  describe.each(listConditions().map((condition) => [condition.id, condition]))('%s', (_id, condition) => {
    it('has a definition and examples', () => {
      expect(condition.definition).toBeTruthy();
      expect(condition.examples.match.length).toBeGreaterThan(0);
      expect(condition.examples.noMatch.length).toBeGreaterThan(0);
    });

    it('matches its match examples', () => {
      condition.examples.match.forEach((example) => {
        expect({ example, pass: evaluate(condition, contextFrom(example)).pass }).toEqual({ example, pass: true });
      });
    });

    it('does not match its noMatch examples', () => {
      condition.examples.noMatch.forEach((example) => {
        expect({ example, pass: evaluate(condition, contextFrom(example)).pass }).toEqual({ example, pass: false });
      });
    });

    it('has an id that starts with its subject', () => {
      expect(condition.id.split('.')[0]).toBe(condition.subject);
    });

    it('names a known condition as variantOf', () => {
      if (condition.variantOf) {
        expect(listConditions().map((c) => c.id)).toContain(condition.variantOf);
        expect(condition.divergence).toBeTruthy();
      }
    });
  });

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
  });
});
