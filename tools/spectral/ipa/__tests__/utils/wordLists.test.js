import { afterAll, describe, expect, it } from '@jest/globals';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadExtraWordLists, resolveWordLists, WORD_LISTS_ENV_VAR } from '../../rulesets/functions/utils/wordLists.js';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ipa-word-lists-'));
let fileCounter = 0;

// The loader caches by file path, so use a unique file per test to keep them isolated.
function writeListsFile(contents) {
  const filePath = path.join(tmpDir, `lists-${fileCounter++}.json`);
  fs.writeFileSync(filePath, typeof contents === 'string' ? contents : JSON.stringify(contents));
  return filePath;
}

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('tools/spectral/ipa/rulesets/functions/utils/wordLists.js', () => {
  describe('loadExtraWordLists', () => {
    it('returns empty lists when the env var is unset', () => {
      expect(loadExtraWordLists({})).toEqual({ ignoreList: [], grammaticalWords: [] });
    });

    it('reads both lists from the referenced file', () => {
      const filePath = writeListsFile({ ignoreList: ['MMS'], grammaticalWords: ['per'] });
      expect(loadExtraWordLists({ [WORD_LISTS_ENV_VAR]: filePath })).toEqual({
        ignoreList: ['MMS'],
        grammaticalWords: ['per'],
      });
    });

    it('defaults missing lists to empty arrays', () => {
      const filePath = writeListsFile({ ignoreList: ['MMS'] });
      expect(loadExtraWordLists({ [WORD_LISTS_ENV_VAR]: filePath })).toEqual({
        ignoreList: ['MMS'],
        grammaticalWords: [],
      });
    });

    it('throws a descriptive error when the file cannot be parsed', () => {
      const filePath = writeListsFile('{ not json');
      expect(() => loadExtraWordLists({ [WORD_LISTS_ENV_VAR]: filePath })).toThrow(WORD_LISTS_ENV_VAR);
    });
  });

  describe('resolveWordLists', () => {
    const options = { ignoreList: ['API', 'AWS'], grammaticalWords: ['and', 'or'] };

    it('returns the package-provided lists unchanged when no additions are configured', () => {
      expect(resolveWordLists(options, {})).toEqual({
        ignoreList: ['API', 'AWS'],
        grammaticalWords: ['and', 'or'],
      });
    });

    it('merges consumer additions with the package-provided lists', () => {
      const filePath = writeListsFile({ ignoreList: ['MMS'], grammaticalWords: ['per'] });
      expect(resolveWordLists(options, { [WORD_LISTS_ENV_VAR]: filePath })).toEqual({
        ignoreList: ['API', 'AWS', 'MMS'],
        grammaticalWords: ['and', 'or', 'per'],
      });
    });

    it('de-duplicates words already present in the package-provided lists', () => {
      const filePath = writeListsFile({ ignoreList: ['AWS', 'MMS'], grammaticalWords: ['and'] });
      expect(resolveWordLists(options, { [WORD_LISTS_ENV_VAR]: filePath })).toEqual({
        ignoreList: ['API', 'AWS', 'MMS'],
        grammaticalWords: ['and', 'or'],
      });
    });

    it('handles undefined options', () => {
      expect(resolveWordLists(undefined, {})).toEqual({ ignoreList: [], grammaticalWords: [] });
    });
  });
});
