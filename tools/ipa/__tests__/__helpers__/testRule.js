import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from '@jest/globals';
import { Spectral, Document } from '@stoplight/spectral-core';
import { httpAndFileResolver } from '@stoplight/spectral-ref-resolver';
import { bundleAndLoadRuleset } from '@stoplight/spectral-ruleset-bundler/with-loader';

const rulesetPath = path.join(__dirname, '../..', 'ipa-spectral.yaml');

export default (ruleName, tests) => {
  describe(`Rule ${ruleName}`, () => {
    for (const testCase of tests) {
      it.concurrent(testCase.name, async () => {
        const s = await createSpectral();
        const doc = testCase.document instanceof Document ? testCase.document : JSON.stringify(testCase.document);
        const allErrors = await s.run(doc);

        const errors = allErrors.filter((e) => {
          if (testCase.errors[0]) {
            return e.code === testCase.errors[0].code;
          }
          return false;
        });

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

async function createSpectral() {
  const s = new Spectral({ resolver: httpAndFileResolver });

  s.setRuleset(await bundleAndLoadRuleset(rulesetPath, { fs, fetch }));

  return s;
}
