import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, '../../../../');

const config = {
  defaultOasFilePath: path.join(rootDir, 'openapi', 'v2.json'),
  defaultRulesetFilePath: path.join(dirname, '..', 'ipa-spectral.yaml'),
  defaultCollectorResultsFilePath: path.join(dirname, 'scripts', 'ipa-collector-results-combined.log'),
  defaultOutputsDir: path.join(dirname, 'outputs'),
};

config.defaultMetricCollectionResultsFilePath = path.join(
  config.defaultOutputsDir,
  'metric-collection-results.parquet'
);

export default config;
