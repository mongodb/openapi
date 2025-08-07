import { describe, expect, it } from '@jest/globals';
import { extractTeamOwnership, getSeverityPerRule } from '../../metrics/utils/metricCollectionUtils.js';

describe('tools/spectral/ipa/metrics/utils/metricCollectionUtils.js', () => {
  describe('getSeverityPerRule', () => {
    const testRuleSet = {
      rules: {
        rule1: {
          definition: {
            severity: 1,
          },
        },
        rule2: {
          definition: {
            severity: 2,
          },
        },
      },
    };
    it('maps the rule severities correctly', () => {
      expect(getSeverityPerRule(testRuleSet)).toEqual({
        rule1: 1,
        rule2: 2,
      });
    });
  });

  describe('extractTeamOwnership', () => {
    const testOas = {
      paths: {
        '/resource1': {
          get: {
            description: 'get resource',
            'x-xgen-owner-team': 'team1',
          },
          post: {
            description: 'create resource',
            'x-xgen-owner-team': 'team1',
          },
        },
        '/resource2': {
          get: {
            description: 'get resource',
            'x-xgen-owner-team': 'team2',
          },
          post: {
            description: 'create resource',
            'x-xgen-owner-team': 'team2',
          },
        },
      },
    };
    it('maps the path ownership correctly', () => {
      expect(extractTeamOwnership(testOas)).toEqual({
        '/resource1': 'team1',
        '/resource2': 'team2',
      });
    });
  });
});
