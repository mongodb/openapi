import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import spectral from '@stoplight/spectral-core';
import { loadRuleset } from '../utils.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const readmeFilePath = path.join(dirname, '../rulesets', 'README.md');

const rulesetsSection = await getRulesetsSection();

const fileContent =
  '<!--- NOTE: This README file is generated, please see /scripts/generateRulesetReadme.js --->\n\n' +
  '# IPA Validation Rules\n\n' +
  'All Spectral rules used in the IPA validation are defined in rulesets grouped by IPA number (`IPA-XXX.yaml`). These rulesets are imported into the main IPA ruleset [ipa-spectral.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/ipa-spectral.yaml) which is used for running the validation.\n\n' +
  `${rulesetsSection}` +
  '\n';

fs.writeFile(readmeFilePath, fileContent, (error) => {
  if (error) {
    console.error('Error while generating the IPA rulesets README.md:', error);
    process.exit(1);
  }
});

async function getRulesetsSection() {
  let content =
    '## Rulesets\n\n' + 'Below is a list of all available rules, their descriptions and severity levels.\n\n';

  const rules = await getAllRules();
  const ruleNames = Object.keys(rules);
  const ipaNumbers = getIpaNumbers(ruleNames);

  ipaNumbers.forEach((ipaNumber) => {
    const ipaRules = filterRulesByIpaNumber(ipaNumber, rules);
    const sections = generateRulesetSections(ipaRules);
    content += `### ${ipaNumber}\n\n` + `Rule is based on ${getIpaRulesetUrl(ipaNumber)}.\n\n` + `${sections}\n\n`;
  });

  return content;
}

function generateRulesetSections(rules) {
  let sections = '';
  const ruleNames = Object.keys(rules);
  const sortedRuleEntries = ruleNames
    .map((ruleName) => ({
      name: ruleName,
      description: rules[ruleName].description,
      severity: rules[ruleName].definition.severity,
    }))
    .sort((a, b) => {
      if (a.severity < b.severity) {
        return -1;
      } else if (a.severity > b.severity) {
        return 1;
      }
      return 0;
    });

  sortedRuleEntries.forEach((rule) => {
    const severityFormatted = formatSeverity(rule.severity);
    sections += `#### ${rule.name}\n\n ${severityFormatted} \n${rule.description}\n`;
  });

  return sections;
}

function formatSeverity(severity) {
  switch (severity.toLowerCase()) {
    case 'info':
      return '![info](https://img.shields.io/badge/info-green)';
    case 'warn':
      return '![warn](https://img.shields.io/badge/warning-yellow)';
    case 'error':
      return '![error](https://img.shields.io/badge/error-red)';
    default:
      return `\`${severity}\``;
  }
}

async function getAllRules() {
  const rulesetFilePath = path.join(dirname, '..', 'ipa-spectral.yaml');
  const { Spectral } = spectral;
  const ruleset = await loadRuleset(rulesetFilePath, new Spectral());
  return ruleset.rules;
}

function getIpaNumbers(ruleNames) {
  const ipaNumbers = [];
  ruleNames.forEach((name) => {
    const ipaName = name.substring(5, 12);
    if (!ipaNumbers.includes(ipaName)) {
      ipaNumbers.push(ipaName);
    }
  });
  return ipaNumbers.sort();
}

function getIpaRulesetUrl(ipaNumber) {
  const parts = ipaNumber.split('-');
  if (parts.length > 1) {
    parts[1] = parts[1].replace(/^0+/, '');
  }
  const ipaNumberFormatted = parts.join('-');
  return `[http://go/ipa/${ipaNumberFormatted}](http://go/ipa/${ipaNumberFormatted})`;
}

function filterRulesByIpaNumber(ipaNumber, rules) {
  return Object.keys(rules)
    .filter((key) => key.includes(ipaNumber))
    .reduce((obj, key) => {
      return {
        ...obj,
        [key]: rules[key],
      };
    }, {});
}
