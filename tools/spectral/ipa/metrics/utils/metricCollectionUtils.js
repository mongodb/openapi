import { EntryType } from '../collector.js';
import { loadJsonFile } from '../../utils.js';

export function getSeverityPerRule(ruleset) {
  const rules = ruleset.rules || {};
  const map = {};
  for (const [name, ruleObject] of Object.entries(rules)) {
    map[name] = ruleObject.definition.severity;
  }
  return map;
}

export function extractTeamOwnership(oasContent) {
  const ownerTeams = {};
  const paths = oasContent.paths || {};

  for (const [path, pathItem] of Object.entries(paths)) {
    for (const [, operation] of Object.entries(pathItem)) {
      const ownerTeam = operation['x-xgen-owner-team'];

      if (ownerTeam) {
        if (!ownerTeams[path]) {
          ownerTeams[path] = ownerTeam;
        } else if (ownerTeams[path] !== ownerTeam) {
          console.warn(`Conflict on path ${path}: ${ownerTeams[path]} vs ${ownerTeam}`);
        }
      }
    }
  }

  return ownerTeams;
}

export function loadCollectorResults(collectorResultsFilePath) {
  try {
    const content = loadJsonFile(collectorResultsFilePath);
    return {
      [EntryType.VIOLATION]: content[EntryType.VIOLATION],
      [EntryType.ADOPTION]: content[EntryType.ADOPTION],
      [EntryType.EXCEPTION]: content[EntryType.EXCEPTION],
    };
  } catch (error) {
    throw new Error(`Failed to parse Collector Results: ${error.message}`);
  }
}

function getIPAFromIPARule(ipaRule) {
  const pattern = /IPA-\d{3}/;
  const match = ipaRule.match(pattern);
  if (match) {
    return match[0];
  }
}

export function merge(ownershipData, collectorResults, ruleSeverityMap) {
  const results = [];

  function addEntry(entryType, adoptionStatus) {
    for (const entry of collectorResults[entryType]) {
      const existing = results.find(
        (result) => result.component_id === entry.componentId && result.ipa_rule === entry.ruleName
      );

      if (existing) {
        console.warn('Duplicate entries found', existing);
        continue;
      }

      let ownerTeam = null;
      if (entry.componentId.startsWith('paths')) {
        const pathParts = entry.componentId.split('.');
        if (pathParts.length === 2) {
          const path = pathParts[1];
          ownerTeam = ownershipData[path];
        }
      }

      results.push({
        component_id: entry.componentId,
        ipa_rule: entry.ruleName,
        ipa: getIPAFromIPARule(entry.ruleName),
        severity_level: ruleSeverityMap[entry.ruleName],
        adoption_status: adoptionStatus,
        exception_reason: entryType === EntryType.EXCEPTION ? entry.exceptionReason : null,
        owner_team: ownerTeam,
        timestamp: new Date().toISOString(),
      });
    }
  }

  addEntry(EntryType.VIOLATION, 'violated');
  addEntry(EntryType.ADOPTION, 'adopted');
  addEntry(EntryType.EXCEPTION, 'exempted');

  return results;
}
