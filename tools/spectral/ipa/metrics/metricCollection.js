import spectral from '@stoplight/spectral-core';
import * as fs from 'node:fs';
import { spawnSync } from 'child_process';
import {
  loadOpenAPIFile,
  extractTeamOwnership,
  loadRuleset,
  loadCollectorResults,
  getSeverityPerRule,
  merge,
} from './utils.js';
import config from './config.js';
const { Spectral } = spectral;

async function runMetricCollectionJob(oasFilePath = config.defaultOasFilePath) {
  try {
    console.log(`Loading OpenAPI file: ${oasFilePath}`);
    const oasContent = loadOpenAPIFile(oasFilePath);

    console.log('Extracting team ownership data...');
    const ownershipData = extractTeamOwnership(oasContent);

    console.log('Getting rule severities...');
    const spectral = new Spectral();
    const ruleset = await loadRuleset(config.defaultRulesetFilePath, spectral);
    const ruleSeverityMap = getSeverityPerRule(ruleset);

    console.log('Loading collector results...');
    const collectorResults = loadCollectorResults(config.defaultCollectorResultsFilePath);

    console.log('Merging results...');
    const mergedResults = merge(ownershipData, collectorResults, ruleSeverityMap);

    console.log('Metric collection job complete.');
    return mergedResults;
  } catch (error) {
    console.error('Error during metric collection:', error.message);
    throw error;
  }
}

const args = process.argv.slice(2);
const customOasFile = args[0];

const result = spawnSync(
  'spectral',
  [
    'lint',
    '--ruleset',
    config.defaultRulesetFilePath,
    '--format',
    'stylish',
    '--verbose',
    '--format',
    'junit',
    '--output.junit',
    config.defaultSpectralReportFile,
    config.defaultOasFilePath,
  ],
  {
    encoding: 'utf-8',
  }
);

if (result.error) {
  console.error('Error running Spectral lint:', result.error);
  process.exit(1);
}

console.log('Spectral lint completed successfully.');
fs.writeFileSync(config.defaultSpectralOutputFile, result.stdout);

runMetricCollectionJob(customOasFile)
  .then((results) => fs.writeFileSync(config.defaultMetricCollectionResultsFilePath, JSON.stringify(results)))
  .catch((error) => console.error(error.message));
