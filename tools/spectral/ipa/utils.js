import { bundleAndLoadRuleset } from '@stoplight/spectral-ruleset-bundler/with-loader';
import fs from 'node:fs';

export async function loadRuleset(rulesetPath, spectral) {
  try {
    const ruleset = await bundleAndLoadRuleset(rulesetPath, { fs, fetch });
    await spectral.setRuleset(ruleset);
    return ruleset;
  } catch (error) {
    throw new Error(`Failed to load ruleset: ${error.message}`, { cause: error });
  }
}

export function loadJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load file: ${error.message}`, { cause: error });
  }
}
