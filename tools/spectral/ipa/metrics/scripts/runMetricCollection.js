import fs from 'node:fs';
import path from 'path';
import { spawnSync } from 'child_process';
import spectral from '@stoplight/spectral-core';
import { tableFromJSON, tableToIPC } from 'apache-arrow';
import config from '../config.js';
import { runMetricCollectionJob } from '../metricCollection.js';
import { createRequire } from 'module';

const { Spectral } = spectral;

// Use createRequire to load our CommonJS wrapper for parquet-wasm
// This allows us to use parquet-wasm 0.7.0 from Node.js ESM
// See parquet-wasm-wrapper.cjs for details
const require = createRequire(import.meta.url);
const { Compression, Table, writeParquet, WriterPropertiesBuilder } = require('./parquet-wasm-wrapper.cjs');

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
    console.log('Writing results to parquet file...');

    try {
      console.log('Converting metrics to Arrow table...');
      const table = tableFromJSON(results.metrics);

      console.log('Converting Arrow table to WASM table...');
      const wasmTable = Table.fromIPCStream(tableToIPC(table, 'stream'));

      console.log('Writing parquet file with GZIP compression...');
      const parquetUint8Array = writeParquet(
        wasmTable,
        new WriterPropertiesBuilder().setCompression(Compression.GZIP).build()
      );

      console.log(`Saving parquet file to: ${config.defaultMetricCollectionResultsFilePath}`);
      fs.writeFileSync(config.defaultMetricCollectionResultsFilePath, parquetUint8Array);

      console.log('Writing warning count...');
      fs.writeFileSync(path.join(config.defaultOutputsDir, 'warning-count.txt'), results.warnings.count.toString());

      console.log('Writing warning violations...');
      fs.writeFileSync(
        path.join(config.defaultOutputsDir, 'warning-violations.json'),
        JSON.stringify(results.warnings.violations, null, 2)
      );

      console.log('Metric collection completed successfully!');
    } catch (error) {
      console.error('Error writing results:', error.message);
      console.error('Stack trace:', error.stack);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Error during metric collection:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  });
