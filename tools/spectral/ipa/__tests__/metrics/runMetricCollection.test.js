import { describe, expect, it } from '@jest/globals';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Integration test for runMetricCollection.js script
 *
 * This test ensures that the script can be run without syntax errors,
 * which helps catch issues like:
 * - Missing or incorrectly exported dependencies (e.g., parquet-wasm exports)
 * - Import/export syntax errors
 * - Module resolution problems
 */
describe('tools/spectral/ipa/metrics/scripts/runMetricCollection.js', () => {
  it('should run without import/syntax errors', () => {
    const scriptPath = path.join(__dirname, '../../metrics/scripts/runMetricCollection.js');

    // Run the script with Node.js
    const result = spawnSync('node', [scriptPath], {
      encoding: 'utf8',
      timeout: 10000,
    });

    // The script will fail because required files don't exist in the test environment,
    // but it should NOT fail with a SyntaxError about missing exports
    const output = result.stdout + result.stderr;

    // Check that we don't have import/syntax errors
    expect(output).not.toMatch(/SyntaxError.*does not provide an export named/);
    expect(output).not.toMatch(/SyntaxError.*Unexpected token/);

    // We expect it to fail with ENOENT for the missing collector results file
    // This proves the imports worked correctly
    expect(output).toMatch(/ENOENT.*ipa-collector-results-combined\.log/);
  });
});

