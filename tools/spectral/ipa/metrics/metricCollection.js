import spectral from '@stoplight/spectral-core';
import { fileURLToPath } from 'node:url';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadOpenAPIFile, extractTeamOwnership, loadRuleset, loadCollectorResults, getSeverityPerRule, merge } from './utils.js';
const { Spectral } = spectral;

//TBD
const oasFile = '../../../../openapi/v2.json';
const dirname = path.dirname(fileURLToPath(import.meta.url));
const collectorResultsFile = path.join(dirname, '../ipa-collector-results-combined.log');


async function runMetricCollectionJob() {
  try {
    console.log('Loading OpenAPI file...');
    const oasContent = loadOpenAPIFile(oasFile);

    console.log('Extracting team ownership data...');
    const ownershipData = extractTeamOwnership(oasContent);

    console.log('Initializing Spectral...');
    const spectral = new Spectral();
    const rulesetPath = path.join(dirname, '../ipa-spectral.yaml');
    const ruleset = await loadRuleset(rulesetPath, spectral);

    console.log('Getting rule severities...');
    const ruleSeverityMap = getSeverityPerRule(ruleset);

    console.log('Running Spectral analysis...');
    const spectralResults = await spectral.run(oasContent);

    console.log('Loading collector results...');
    const collectorResults = loadCollectorResults(collectorResultsFile);

    console.log('Merging results...');
    const mergedResults = merge(spectralResults, ownershipData, collectorResults, ruleSeverityMap);

    console.log('Metric collection job complete.');
    return mergedResults;
  } catch (error) {
    console.error('Error during metric collection:', error.message);
    throw error;
  }
}


runMetricCollectionJob()
  .then((results) => fs.writeFileSync('results.log', JSON.stringify(results)))
  .catch((error) => console.error(error.message));
