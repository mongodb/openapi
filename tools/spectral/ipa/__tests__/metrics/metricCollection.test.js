import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { runMetricCollectionJob } from '../../metrics/metricCollection.js';

const dirname = path.dirname(fileURLToPath(require('url').pathToFileURL(__filename).toString()));
const expectedResultFilePath = path.join(dirname, 'data', 'expected-metric-collection-results.json');

// Testing the metrics collection with test data in folder 'data'
// The testing data runs with:
// - One IPA (104)
// - The v2 spec of sha d74daaad5793d066a91cfcbf4bec6fca494e0ae1

const testConfig = {
  oasFilePath: path.join(dirname, 'data', 'example-openapi-spec.json'),
  collectorResultsFilePath: path.join(dirname, 'data', 'ipa-collector-results-combined.log'),
  rulesetFilePath: path.join(dirname, 'data', 'test-ipa-spectral.yaml'),
};

describe('tools/spectral/ipa/metrics/metricCollection.js runMetricCollectionJob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Outputs the expected metrics collection results', async () => {
    const expectedResults = JSON.parse(fs.readFileSync(expectedResultFilePath, 'utf8'));

    const results = await runMetricCollectionJob(testConfig);

    expect(results).not.toBe(undefined);
    expect(results.length).toEqual(expectedResults.length);

    results.forEach((entry, index) => {
      const expectedEntry = getEntry(expectedResults, entry['component_id'], entry['ipa_rule']);
      expect(entry['component_id']).toEqual(expectedEntry['component_id']);
      expect(entry['adoption_status']).toEqual(expectedEntry['adoption_status']);
      expect(entry['ipa']).toEqual(expectedEntry['ipa']);
      expect(entry['ipa_rule']).toEqual(expectedEntry['ipa_rule']);
      expect(entry['exception_reason']).toEqual(expectedEntry['exception_reason']);
      expect(entry['owner_team']).toEqual(expectedEntry['owner_team']);
      expect(entry['severity_level']).toEqual(expectedEntry['severity_level']);
    });
  });
});

function getEntry(allEntries, componentId, ipaRule) {
  const matches = allEntries.filter((entry) => {
    return entry['component_id'] === componentId && entry['ipa_rule'] === ipaRule;
  });
  expect(matches.length).toEqual(1);
  return matches[0];
}
