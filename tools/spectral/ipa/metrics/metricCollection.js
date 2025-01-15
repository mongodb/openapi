import spectral from '@stoplight/spectral-core';
import * as fs from 'node:fs';
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

    console.log('Initializing Spectral...');
    const spectral = new Spectral();
    const ruleset = await loadRuleset(config.defaultRulesetFilePath, spectral);

    console.log('Getting rule severities...');
    const ruleSeverityMap = getSeverityPerRule(ruleset);

    console.log('Running Spectral analysis...');
    const spectralResults = await spectral.run(oasContent);

    console.log('Loading collector results...');
    const collectorResults = loadCollectorResults(config.defaultCollectorResultsFilePath);

    console.log('Merging results...');
    const mergedResults = merge(spectralResults, ownershipData, collectorResults, ruleSeverityMap);

    console.log('Metric collection job complete.');
    return mergedResults;
  } catch (error) {
    console.error('Error during metric collection:', error.message);
    throw error;
  }
}

const args = process.argv.slice(2);
const customOasFile = args[0];

runMetricCollectionJob(customOasFile)
  .then((results) => fs.writeFileSync(config.defaultMetricCollectionResultsFilePath, JSON.stringify(results)))
  .catch((error) => console.error(error.message));
