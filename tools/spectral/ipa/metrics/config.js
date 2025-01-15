import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, '../../../../');

const config = {
  defaultOasFilePath: path.join(rootDir, 'openapi', 'v2.json'),
  defaultCollectorResultsFilePath: path.join(dirname, 'ipa-collector-results-combined.log'),
  defaultRulesetFilePath: path.join(dirname, '..', 'ipa-spectral.yaml'),
  defaultMetricCollectionResultsFilePath: path.join(dirname, 'metric-collection-results.json'),
};

export default config;
