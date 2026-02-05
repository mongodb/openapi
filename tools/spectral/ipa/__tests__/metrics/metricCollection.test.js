import fs from 'node:fs';
import path from 'path';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { runMetricCollectionJob } from '../../metrics/metricCollection.js';
import { Spectral } from '@stoplight/spectral-core';

const expectedResultFilePath = path.join(__dirname, 'data', 'expected-metric-results.json');

// Testing the metrics collection with test data in folder 'data'
// The testing data runs with:
// - One IPA (104)
// - The v2 spec of sha d74daaad5793d066a91cfcbf4bec6fca494e0ae1

const testConfig = {
  oasFilePath: path.join(__dirname, 'data', 'example-openapi-spec.json'),
  collectorResultsFilePath: path.join(__dirname, 'data', 'collector-results.log'),
  rulesetFilePath: path.join(__dirname, 'data', 'test-ipa-spectral.yaml'),
};

describe('tools/spectral/ipa/metrics/metricCollection.js runMetricCollectionJob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Outputs the expected metrics collection results', async () => {
    const expectedResults = JSON.parse(fs.readFileSync(expectedResultFilePath, 'utf8'));
    const spectral = new Spectral();

    const results = await runMetricCollectionJob(testConfig, spectral);

    expect(results).not.toBe(undefined);
    expect(results.metrics.length).toEqual(expectedResults.length);
    results.metrics.forEach((entry, index) => {
      const expectedEntry = getEntry(expectedResults, entry['component_id'], entry['ipa_rule']);
      expect(entry['component_id']).toEqual(expectedEntry['component_id']);
      expect(entry['adoption_status']).toEqual(expectedEntry['adoption_status']);
      expect(entry['ipa']).toEqual(expectedEntry['ipa']);
      expect(entry['ipa_rule']).toEqual(expectedEntry['ipa_rule']);
      expect(entry['exception_reason']).toEqual(expectedEntry['exception_reason']);
      expect(entry['owner_team']).toEqual(expectedEntry['owner_team']);
      expect(entry['severity_level']).toEqual(expectedEntry['severity_level']);
    });

    expect(results.warnings.count).toEqual(1);
    const violations = [
      {
        code: 'xgen-IPA-104-valid-operation-id-warn',
        component_id: 'paths./api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}.get',
      },
    ];
    expect(results.warnings.violations).toEqual(violations);
  });
});

function getEntry(allEntries, componentId, ipaRule) {
  const matches = allEntries.filter((entry) => {
    return entry['component_id'] === componentId && entry['ipa_rule'] === ipaRule;
  });
  expect(matches.length).toEqual(1);
  return matches[0];
}
