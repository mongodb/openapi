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

    const warningViolations = mergedResults.filter(
      (result) => result.severity_level === 'warn' && result.adoption_status === 'violated'
    );

    const processedWarnings = warningViolations.map((violation) => ({
      code: violation.ipa_rule,
      component_id: violation.component_id,
    }));

    console.log(`Found ${warningViolations.length} warning-level violations`);

    console.log('Metric collection job complete.');
    return {
      metrics: mergedResults,
      warnings: {
        count: warningViolations.length,
        violations: processedWarnings,
      },
    };
  } catch (error) {
    console.error('Error during metric collection:', error.message);
    throw error;
  }
}
