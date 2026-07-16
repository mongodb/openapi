import { afterAll, describe, expect, it } from '@jest/globals';
import * as fs from 'node:fs';
import os from 'node:os';
import * as path from 'node:path';
import { Spectral } from '@stoplight/spectral-core';
import { httpAndFileResolver } from '@stoplight/spectral-ref-resolver';
import { bundleAndLoadRuleset } from '@stoplight/spectral-ruleset-bundler/with-loader';
import { WORD_LISTS_ENV_VAR } from '../rulesets/functions/utils/wordLists.js';

// End-to-end proof that consumer-provided word lists (referenced via the
// IPA_WORD_LISTS environment variable) are merged into the package-provided lists
// and change validation behaviour for both IPA-117 and IPA-126, without editing the ruleset.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ipa-consumer-lists-'));
const listsFile = path.join(tmpDir, 'lists.json');
fs.writeFileSync(listsFile, JSON.stringify({ ignoreList: ['MMS'], grammaticalWords: ['per'] }));

async function runRule(ruleName, rulesetFile, document) {
  const rulesetPath = path.join(__dirname, '../rulesets', rulesetFile);
  const s = new Spectral({ resolver: httpAndFileResolver });
  const ruleset = Object(await bundleAndLoadRuleset(rulesetPath, { fs, fetch })).toJSON();
  const scopedRuleset = { rules: { [ruleName]: ruleset.rules[ruleName].definition } };
  if (ruleset.aliases) {
    scopedRuleset.aliases = ruleset.aliases;
  }
  s.setRuleset(scopedRuleset);
  return s.run(JSON.stringify(document));
}

describe('Consumer-provided word lists via IPA_WORD_LISTS', () => {
  const originalEnv = process.env[WORD_LISTS_ENV_VAR];

  afterAll(() => {
    if (originalEnv === undefined) {
      delete process.env[WORD_LISTS_ENV_VAR];
    } else {
      process.env[WORD_LISTS_ENV_VAR] = originalEnv;
    }
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('xgen-IPA-126-tag-names-should-use-title-case (ignoreList)', () => {
    const document = { tags: [{ name: 'MMS Alerts' }] };

    it('flags a consumer acronym that is not in the package ignoreList', async () => {
      delete process.env[WORD_LISTS_ENV_VAR];
      const errors = await runRule('xgen-IPA-126-tag-names-should-use-title-case', 'IPA-126.yaml', document);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toEqual('xgen-IPA-126-tag-names-should-use-title-case');
    });

    it('accepts the consumer acronym once supplied via the env var', async () => {
      process.env[WORD_LISTS_ENV_VAR] = listsFile;
      const errors = await runRule('xgen-IPA-126-tag-names-should-use-title-case', 'IPA-126.yaml', document);
      expect(errors).toHaveLength(0);
    });
  });

  describe('xgen-IPA-117-operation-summary-format (grammaticalWords)', () => {
    const document = { paths: { '/resource': { get: { summary: 'Return One Resource per Project' } } } };

    it('flags a consumer grammatical word that is not in the package list', async () => {
      delete process.env[WORD_LISTS_ENV_VAR];
      const errors = await runRule('xgen-IPA-117-operation-summary-format', 'IPA-117.yaml', document);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toEqual('xgen-IPA-117-operation-summary-format');
    });

    it('accepts the consumer grammatical word once supplied via the env var', async () => {
      process.env[WORD_LISTS_ENV_VAR] = listsFile;
      const errors = await runRule('xgen-IPA-117-operation-summary-format', 'IPA-117.yaml', document);
      expect(errors).toHaveLength(0);
    });
  });
});
