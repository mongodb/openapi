import { describe, expect, it } from '@jest/globals';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Spectral } from '@stoplight/spectral-core';
import { httpAndFileResolver } from '@stoplight/spectral-ref-resolver';
import { bundleAndLoadRuleset } from '@stoplight/spectral-ruleset-bundler/with-loader';

// Proof that consumers extending the ruleset can supply their own `ignoreList` and
// `grammaticalWords` by redeclaring the rule with their own `functionOptions` — the
// native Spectral mechanism — without editing this package. The lists in the shipped
// rulesets remain the canonical defaults used by this repository's own CI.
async function runRuleWithOptions(ruleName, rulesetFile, functionOptions, document) {
  const rulesetPath = path.join(__dirname, '../rulesets', rulesetFile);
  const s = new Spectral({ resolver: httpAndFileResolver });
  const ruleset = Object(await bundleAndLoadRuleset(rulesetPath, { fs, fetch })).toJSON();
  const definition = ruleset.rules[ruleName].definition;
  if (functionOptions) {
    definition.then.functionOptions = functionOptions;
  }
  const scopedRuleset = { rules: { [ruleName]: definition } };
  if (ruleset.aliases) {
    scopedRuleset.aliases = ruleset.aliases;
  }
  s.setRuleset(scopedRuleset);
  return s.run(JSON.stringify(document));
}

describe('Consumer-provided word lists via functionOptions', () => {
  describe('xgen-IPA-126-tag-names-should-use-title-case (ignoreList)', () => {
    const document = { tags: [{ name: 'ACME Alerts' }] };

    it('flags a consumer acronym that is not in the package ignoreList', async () => {
      const errors = await runRuleWithOptions(
        'xgen-IPA-126-tag-names-should-use-title-case',
        'IPA-126.yaml',
        null,
        document
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toEqual('xgen-IPA-126-tag-names-should-use-title-case');
    });

    it('accepts the consumer acronym once added to functionOptions', async () => {
      const errors = await runRuleWithOptions(
        'xgen-IPA-126-tag-names-should-use-title-case',
        'IPA-126.yaml',
        { ignoreList: ['ACME'], grammaticalWords: [] },
        document
      );
      expect(errors).toHaveLength(0);
    });
  });

  describe('xgen-IPA-117-operation-summary-format (grammaticalWords)', () => {
    const document = { paths: { '/resource': { get: { summary: 'Return One Resource per Project' } } } };

    it('flags a consumer grammatical word that is not in the package list', async () => {
      const errors = await runRuleWithOptions('xgen-IPA-117-operation-summary-format', 'IPA-117.yaml', null, document);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toEqual('xgen-IPA-117-operation-summary-format');
    });

    it('accepts the consumer grammatical word once added to functionOptions', async () => {
      const errors = await runRuleWithOptions(
        'xgen-IPA-117-operation-summary-format',
        'IPA-117.yaml',
        { ignoreList: [], grammaticalWords: ['per'] },
        document
      );
      expect(errors).toHaveLength(0);
    });
  });
});
