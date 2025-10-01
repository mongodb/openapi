import fs from 'node:fs';
import path from 'path';
import { spawnSync } from 'child_process';
import spectral from '@stoplight/spectral-core';
import { Table, writeParquet, WriterPropertiesBuilder } from 'parquet-wasm/esm/parquet_wasm.js';
import { tableFromJSON, tableToIPC } from 'apache-arrow';
import config from '../config.js';
import { runMetricCollectionJob } from '../metricCollection.js';

const { Spectral } = spectral;
const args = process.argv.slice(2);
const oasFilePath = args[0];

if (!fs.existsSync(config.defaultOutputsDir)) {
  fs.mkdirSync(config.defaultOutputsDir);
  console.log(`Output directory created successfully`);
}

if (!fs.existsSync(config.defaultRulesetFilePath)) {
  console.error('Could not find ruleset file path', config.defaultRulesetFilePath);
  process.exit(1);
}

if (!oasFilePath && !fs.existsSync(config.defaultOasFilePath)) {
  console.error('Could not find default OAS file path', config.defaultOasFilePath);
  process.exit(1);
}

if (oasFilePath && !fs.existsSync(oasFilePath)) {
  console.error('Could not find OAS file path', oasFilePath);
  process.exit(1);
}

const result = spawnSync('npx', [
  'spectral',
  'lint',
  oasFilePath ? oasFilePath : config.defaultOasFilePath,
  '--ruleset',
  config.defaultRulesetFilePath,
]);

if (result.error) {
  console.error('Error running Spectral lint:', result.error);
  process.exit(1);
}

console.log('Spectral lint completed successfully.');

runMetricCollectionJob(
  {
    oasFilePath,
  },
  new Spectral()
)
  .then((results) => {
    console.log('Writing results');
    const table = tableFromJSON(results.metrics);
    const wasmTable = Table.fromIPCStream(tableToIPC(table, 'stream'));
    const parquetUint8Array = writeParquet(
      wasmTable,
      new WriterPropertiesBuilder().setCompression(2).build() // 2 = GZIP compression
    );
    fs.writeFileSync(config.defaultMetricCollectionResultsFilePath, parquetUint8Array);
    fs.writeFileSync(path.join(config.defaultOutputsDir, 'warning-count.txt'), results.warnings.count.toString());

    fs.writeFileSync(
      path.join(config.defaultOutputsDir, 'warning-violations.json'),
      JSON.stringify(results.warnings.violations, null, 2)
    );
  })
  .catch((error) => console.error(error.message));
