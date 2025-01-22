import fs from 'node:fs';
import { spawnSync } from 'child_process';
import spectral from '@stoplight/spectral-core';
import config from '../config.js';
import { runMetricCollectionJob } from '../metricCollection.js';

const args = process.argv.slice(2);
const oasFilePath = args[0];

if (!fs.existsSync(config.defaultOutputsDir)) {
  fs.mkdirSync(config.defaultOutputsDir);
  console.log(`Output directory created successfully`);
}

const result = spawnSync('spectral', ['lint', config.defaultOasFilePath, '--ruleset', config.defaultRulesetFilePath]);

if (result.error) {
  console.error('Error running Spectral lint:', result.error);
  process.exit(1);
}

console.log('Spectral lint completed successfully.');

runMetricCollectionJob(
  {
    oasFilePath,
  },
  spectral
)
  .then((results) => {
    console.log('Writing results');
    fs.writeFileSync(config.defaultMetricCollectionResultsFilePath, JSON.stringify(results));
  })
  .catch((error) => console.error(error.message));
