/**
 * CommonJS wrapper for parquet-wasm
 *
 * This wrapper allows us to use parquet-wasm 0.7.0 from ES modules in Node.js.
 *
 * Background: parquet-wasm 0.7.0 has package.json with "type": "module" which makes
 * Node.js treat .js files as ES modules. However, the node build uses CommonJS syntax.
 *
 * Solution: Since this file has a .cjs extension, Node.js always treats it as CommonJS,
 * allowing us to use require(). We then use createRequire() in our ES module to load this wrapper.
 *
 * See: https://github.com/kylebarron/parquet-wasm/issues/798
 */

const path = require('path');
const fs = require('fs');

// Read and eval the parquet-wasm node build
// We use eval because require() won't work due to the "type": "module" in package.json
const parquetWasmPath = path.resolve(__dirname, '../../../../../node_modules/parquet-wasm/node/parquet_wasm.js');

const code = fs.readFileSync(parquetWasmPath, 'utf8');
const moduleExports = {};
const moduleObj = { exports: moduleExports };

// Execute the code in a function scope with CommonJS globals
const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', code);
fn(moduleExports, require, moduleObj, parquetWasmPath, path.dirname(parquetWasmPath));

// Re-export everything
module.exports = moduleObj.exports;
