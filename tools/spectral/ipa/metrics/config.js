import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(dirname, 'outputs');
const rootDir = path.resolve(dirname, '../../../../');

const config = {
  defaultOasFilePath: path.join(rootDir, 'openapi', 'v2.json'),
  defaultRulesetFilePath: path.join(dirname, '..', 'ipa-spectral.yaml'),
  defaultCollectorResultsFilePath: path.join(dirname, 'ipa-collector-results-combined.log'),
  defaultMetricCollectionResultsFilePath: path.join(outputDir, 'metric-collection-results.json'),
  defaultSpectralReportFile: path.join(outputDir, 'spectral-report.xml'),
  defaultSpectralOutputFile: path.join(outputDir, 'spectral-output.txt'),
};

export default config;
