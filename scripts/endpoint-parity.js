#!/usr/bin/env node

/**
 * Script to find endpoint parity between v1/v1.5 and v2 API versions.
 *
 * Parity mappings:
 * - v1 (v1.0) endpoints map 1-to-1 to v2 endpoints for version 2023-01-01
 * - v1.5 endpoints map 1-to-1 to v2 endpoints for version 2023-02-01
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const V1_SPEC_PATH = path.join(__dirname, '../openapi/v1-deprecated/v1.json');
const V2_SPEC_PATH = path.join(__dirname, '../openapi/.raw/v2.json');
const V2_2023_01_01_PATH = path.join(__dirname, '../openapi/v2/openapi-2023-01-01.json');
const V2_2023_02_01_PATH = path.join(__dirname, '../openapi/v2/openapi-2023-02-01.json');

/**
 * Extract endpoints from an OpenAPI spec
 * @param {object} spec - The OpenAPI specification object
 * @param {string} versionFilter - Optional filter for path version (e.g., 'v1.0', 'v1.5', 'v2')
 * @param {boolean} onlyWithSunset - If true, only include endpoints with x-sunset set
 * @returns {Map<string, object>} - Map of normalized path -> endpoint details
 */
function extractEndpoints(spec, versionFilter = null, onlyWithSunset = false) {
  const endpoints = new Map();

  if (!spec.paths) {
    return endpoints;
  }

  for (const [pathKey, pathItem] of Object.entries(spec.paths)) {
    // Apply version filter if specified
    if (versionFilter) {
      const versionPattern = `/api/atlas/${versionFilter}`;
      if (!pathKey.startsWith(versionPattern)) {
        continue;
      }
    }

    const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

    for (const method of methods) {
      if (pathItem[method]) {
        const operation = pathItem[method];
        const sunset = operation['x-sunset'] || null;

        // Skip if we only want sunset endpoints and this one doesn't have sunset
        if (onlyWithSunset && !sunset) {
          continue;
        }

        const key = `${method.toUpperCase()} ${pathKey}`;
        endpoints.set(key, {
          path: pathKey,
          method: method.toUpperCase(),
          operationId: operation.operationId || 'N/A',
          sunset: sunset,
          deprecated: operation.deprecated || false
        });
      }
    }
  }

  return endpoints;
}

/**
 * Find the owning team for a given path and method
 * @param {string} pathStr - The API path
 * @param {string} method - The HTTP method
 * @param {object} spec - The OpenAPI specification object
 * @returns {string|null} - The owning team or null if not found
 */
function findTeam(pathStr, method, spec) {
  const pathItem = spec.paths[pathStr];
  if (!pathItem) return null;
  const operation = pathItem[method];
  if (!operation) return null;
  return operation['x-xgen-owner-team'] || null;
}

/**
 * Normalize a path by removing the version prefix
 * @param {string} pathStr - The API path
 * @returns {string} - The normalized path without version prefix
 */
function normalizePath(pathStr) {
  // Remove /api/atlas/v1.0/, /api/atlas/v1.5/, or /api/atlas/v2/ prefix
  return pathStr.replace(/^\/api\/atlas\/v[12](\.[05])?/, '');
}

/**
 * Get versioned path
 * @param {string} pathStr - The API path
 * @param {string} version - The version to use
 * @returns {string} - The versioned path
 */
function getVersionedPath(pathStr, version) {
  return `/api/atlas/${version}${normalizePath(pathStr)}`;
}

/**
 * Find pairings between two sets of endpoints
 * @param {Map} sourceEndpoints - Source endpoints (v1 or v1.5)
 * @param {Map} targetEndpoints - Target endpoints (v2)
 * @param {string} sourceVersion - Source version label
 * @param {string} targetVersion - Target version label
 * @returns {Array} - Array of pairing objects
 */
function findPairings(sourceEndpoints, targetEndpoints, sourceVersion, targetVersion) {
  const pairings = [];

  for (const [, sourceEndpoint] of sourceEndpoints) {
    const normalizedSourcePath = normalizePath(sourceEndpoint.path);

    // Find matching v2 endpoint
    for (const [, targetEndpoint] of targetEndpoints) {
      const normalizedTargetPath = normalizePath(targetEndpoint.path);

      if (normalizedSourcePath === normalizedTargetPath &&
          sourceEndpoint.method === targetEndpoint.method) {
        pairings.push({
          sourceVersion,
          targetVersion,
          method: sourceEndpoint.method,
          sourcePath: sourceEndpoint.path,
          targetPath: targetEndpoint.path,
          sourceOperationId: sourceEndpoint.operationId,
          targetOperationId: targetEndpoint.operationId,
          sunset: targetEndpoint.sunset,
          deprecated: targetEndpoint.deprecated
        });
        break;
      }
    }
  }

  return pairings;
}

function aggregateByTeam(pairings, spec) {
  const teamAggregation = {};

  for (const pairing of pairings) {
    const team = findTeam(getVersionedPath(pairing.targetPath, 'v2'), pairing.method.toLowerCase(), spec) || 'Unknown';
    
    if (!teamAggregation[team]) {
      teamAggregation[team] = { count: 0, endpoints: [] };
    }

    teamAggregation[team].count += 1;
    teamAggregation[team].endpoints.push(pairing);
  }

  return teamAggregation;
}

// Minimum sunset date filter - only show endpoints with sunset >= this date
const MIN_SUNSET_DATE = '2026-01-01';

/**
 * Filter pairings to only include those with sunset >= minDate
 */
function filterBySunsetDate(pairings, minDate) {
  return pairings.filter(p => p.sunset && p.sunset >= minDate);
}

/**
 * Main execution
 */
function main() {
  console.log('='.repeat(80));
  console.log('Endpoint Parity Analysis: v1/v1.5 to v2 Mappings (with Sunset)');
  console.log('='.repeat(80));
  console.log();
  console.log(`NOTE: Only showing v2 endpoints with x-sunset >= ${MIN_SUNSET_DATE}`);
  console.log();

  const v1Spec = JSON.parse(fs.readFileSync(V1_SPEC_PATH, 'utf8'));
  const v2Spec = JSON.parse(fs.readFileSync(V2_SPEC_PATH, 'utf8'));
  const v2_2023_01_01_Spec = JSON.parse(fs.readFileSync(V2_2023_01_01_PATH, 'utf8'));
  const v2_2023_02_01_Spec = JSON.parse(fs.readFileSync(V2_2023_02_01_PATH, 'utf8'));

  // Extract endpoints - v1.0 and v1.5 are both in v1.json
  const v1_0_Endpoints = extractEndpoints(v1Spec, 'v1.0');
  const v1_5_Endpoints = extractEndpoints(v1Spec, 'v1.5');

  // Extract ALL v2 endpoints for reference counts
  const v2_2023_01_01_AllEndpoints = extractEndpoints(v2_2023_01_01_Spec, 'v2', false);
  const v2_2023_02_01_AllEndpoints = extractEndpoints(v2_2023_02_01_Spec, 'v2', false);

  // Extract only v2 endpoints with sunset
  const v2_2023_01_01_SunsetEndpoints = extractEndpoints(v2_2023_01_01_Spec, 'v2', true);
  const v2_2023_02_01_SunsetEndpoints = extractEndpoints(v2_2023_02_01_Spec, 'v2', true);

  const v1_0_AllPairings = findPairings(v1_0_Endpoints, v2_2023_01_01_SunsetEndpoints, 'v1.0', '2023-01-01');
  const v1_0_Pairings = filterBySunsetDate(v1_0_AllPairings, MIN_SUNSET_DATE);
  console.log(`Found ${v1_0_Pairings.length} paired endpoints with sunset >= ${MIN_SUNSET_DATE}`);

  const v1_5_AllPairings = findPairings(v1_5_Endpoints, v2_2023_02_01_SunsetEndpoints, 'v1.5', '2023-02-01');
  const v1_5_Pairings = filterBySunsetDate(v1_5_AllPairings, MIN_SUNSET_DATE);
  console.log(`Found ${v1_5_Pairings.length} paired endpoints with sunset >= ${MIN_SUNSET_DATE}`);

  const v1_0_TeamAggregation = aggregateByTeam(v1_0_Pairings, v2Spec);
  const v1_5_TeamAggregation = aggregateByTeam(v1_5_Pairings, v2Spec);

  const teams = new Set([
    ...Object.keys(v1_0_TeamAggregation),
    ...Object.keys(v1_5_TeamAggregation)
  ]);

  // Output JSON
  const output = {
    "v1.0" : v1_0_TeamAggregation,
    "v1.5" : v1_5_TeamAggregation,
    summary: {
      "v1.0 count": v1_0_Endpoints.size,
      "v1.5 count": v1_5_Endpoints.size,
      "v2 2023-01-01 count": v2_2023_01_01_AllEndpoints.size,
      "v2 2023-01-01 endpoints with sunset": v2_2023_01_01_SunsetEndpoints.size,
      "v2 2023-02-01 count": v2_2023_02_01_AllEndpoints.size,
      "v2 2023-02-01 endpoints with sunset": v2_2023_02_01_SunsetEndpoints.size,
      "v1.0 pairings with sunset": v1_0_Pairings.length,
      "v1.5 pairings with sunset": v1_5_Pairings.length,
      teams: Array.from(teams)
    }
  };

  const outputPath = path.join(__dirname, 'endpoint-parity-output.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nJSON output written to: ${outputPath}`);
}

main();

