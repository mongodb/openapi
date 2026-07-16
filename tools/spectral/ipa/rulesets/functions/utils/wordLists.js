import fs from 'node:fs';

/**
 * Environment variable that consumers of the ruleset (e.g. MMS) can point at a JSON
 * file to extend the shared `ignoreList` and `grammaticalWords` configuration used by
 * IPA-117 and IPA-126. This lets consumers supply their own words without requiring a
 * new release of the ruleset package.
 *
 * The referenced JSON file may define `ignoreList` and/or `grammaticalWords` arrays:
 *   { "ignoreList": ["MMS"], "grammaticalWords": ["per"] }
 *
 * The openapi repository's own CI does not set this variable, so the package-provided
 * lists in the rulesets are used unchanged.
 */
export const WORD_LISTS_ENV_VAR = 'IPA_WORD_LISTS';

const EMPTY_LISTS = { ignoreList: [], grammaticalWords: [] };

// Cache parsed files by path. The env var is fixed for the lifetime of a validation
// run, so this avoids re-reading the same file for every tag or operation summary.
const cacheByPath = new Map();

/**
 * Reads consumer-provided word list additions from the JSON file referenced by the
 * IPA_WORD_LISTS environment variable. Returns empty lists when the variable is unset.
 *
 * @param {NodeJS.ProcessEnv} env the environment to read the variable from
 * @returns {{ignoreList: Array<string>, grammaticalWords: Array<string>}} the additions
 */
export function loadExtraWordLists(env = process.env) {
  const filePath = env[WORD_LISTS_ENV_VAR];
  if (!filePath) {
    return EMPTY_LISTS;
  }
  if (cacheByPath.has(filePath)) {
    return cacheByPath.get(filePath);
  }
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    throw new Error(`Failed to load ${WORD_LISTS_ENV_VAR} from "${filePath}": ${e.message}`, { cause: e });
  }
  const lists = {
    ignoreList: parsed.ignoreList ?? [],
    grammaticalWords: parsed.grammaticalWords ?? [],
  };
  cacheByPath.set(filePath, lists);
  return lists;
}

/**
 * Merges the package-provided lists (from the rule's functionOptions) with any
 * consumer-provided additions, de-duplicating entries. Consumer additions only ever
 * add words, they never remove package-provided ones.
 *
 * @param {{ignoreList?: Array<string>, grammaticalWords?: Array<string>}} options the rule's functionOptions
 * @param {NodeJS.ProcessEnv} env the environment to read consumer additions from
 * @returns {{ignoreList: Array<string>, grammaticalWords: Array<string>}} the resolved lists
 */
export function resolveWordLists(options = {}, env = process.env) {
  const { ignoreList = [], grammaticalWords = [] } = options ?? {};
  const extra = loadExtraWordLists(env);
  return {
    ignoreList: [...new Set([...ignoreList, ...extra.ignoreList])],
    grammaticalWords: [...new Set([...grammaticalWords, ...extra.grammaticalWords])],
  };
}
