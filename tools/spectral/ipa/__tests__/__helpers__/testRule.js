import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from '@jest/globals';
import { Spectral, Document } from '@stoplight/spectral-core';
import { httpAndFileResolver } from '@stoplight/spectral-ref-resolver';
import { bundleAndLoadRuleset } from '@stoplight/spectral-ruleset-bundler/with-loader';

export default (ruleName, tests) => {
  describe(`Rule ${ruleName}`, () => {
    for (const testCase of tests) {
      it.concurrent(testCase.name, async () => {
        const s = await createSpectral(ruleName);
        const doc = testCase.document instanceof Document ? testCase.document : JSON.stringify(testCase.document);
        const errors = await s.run(doc);

        if (testCase.name === 'invalid methods' && errors.length !== testCase.errors.length) {
          console.log('Errors:', errors);
        }
        expect(errors.length).toEqual(testCase.errors.length);

        errors.forEach((error, index) => {
          expect(error.code).toEqual(testCase.errors[index].code);
          expect(error.message).toEqual(testCase.errors[index].message);
          expect(error.path).toEqual(testCase.errors[index].path);
        });
      });
    }
  });
};

async function createSpectral(ruleName) {
  const rulesetPath = path.join(__dirname, '../../rulesets', ruleName.slice(5, 12) + '.yaml');
  const s = new Spectral({ resolver: httpAndFileResolver });
  const ruleset = Object(await bundleAndLoadRuleset(rulesetPath, { fs, fetch })).toJSON();
  s.setRuleset(getRulesetForRule(ruleName, ruleset));
  return s;
}

/**
 * Takes the passed ruleset and returns a ruleset with only the specified rule.
 *
 * @param ruleName the name of the rule
 * @param ruleset the ruleset containing the rule by ruleName and optionally other rules
 * @returns {Object} a ruleset with only the rule with name ruleName
 */
function getRulesetForRule(ruleName, ruleset) {
  const modifiedRuleset = { rules: {} };
  modifiedRuleset.rules[ruleName] = ruleset.rules[ruleName].definition;
  return modifiedRuleset;
}
