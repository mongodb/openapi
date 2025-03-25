import config from './config.js';
import {
  extractTeamOwnership,
  getSeverityPerRule,
  loadCollectorResults,
  merge,
} from './utils/metricCollectionUtils.js';
import { loadJsonFile, loadRuleset } from '../utils.js';

export async function runMetricCollectionJob(
  {
    oasFilePath = config.defaultOasFilePath,
    rulesetFilePath = config.defaultRulesetFilePath,
    collectorResultsFilePath = config.defaultCollectorResultsFilePath,
  },
  spectral
) {
  try {
    console.log(`Loading OpenAPI file: ${oasFilePath}`);
    const oasContent = loadJsonFile(oasFilePath);

    console.log('Extracting team ownership data...');
    const ownershipData = extractTeamOwnership(oasContent);

    console.log('Getting rule severities...');
    const ruleset = await loadRuleset(rulesetFilePath, spectral);
    const ruleSeverityMap = getSeverityPerRule(ruleset);

    console.log('Loading collector results...');
    const collectorResults = loadCollectorResults(collectorResultsFilePath);

    console.log('Merging results...');
    const mergedResults = merge(ownershipData, collectorResults, ruleSeverityMap);

    console.log('Metric collection job complete.');
    return mergedResults;
  } catch (error) {
    console.error('Error during metric collection:', error.message);
    throw error;
  }
}
