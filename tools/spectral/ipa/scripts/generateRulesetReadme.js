import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import spectral from '@stoplight/spectral-core';
import { markdownTable } from 'markdown-table';
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
    '## Rulesets\n\n' + 'The tables below lists all available rules, their descriptions and severity level.\n\n';

  const rules = await getAllRules();
  const ruleNames = Object.keys(rules);
  const ipaNumbers = getIpaNumbers(ruleNames);

  ipaNumbers.forEach((ipaNumber) => {
    const ipaRules = filterRulesByIpaNumber(ipaNumber, rules);
    const table = generateRulesetTable(ipaRules);
    content +=
      `### ${ipaNumber}\n\n` + `For rule definitions, see ${getIpaRulesetUrl(ipaNumber)}.\n\n` + `${table}\n\n`;
  });

  return content;
}

function generateRulesetTable(rules) {
  const table = [['Rule Name', 'Description', 'Severity']];
  const tableRows = [];

  const ruleNames = Object.keys(rules);
  ruleNames.forEach((ruleName) => {
    const rule = rules[ruleName];
    tableRows.push([ruleName, rule.description, rule.definition.severity]);
  });

  tableRows.sort(sortBySeverity);
  tableRows.forEach((row) => table.push(row));
  return markdownTable(table);
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
  return `[${ipaNumber}.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/rulesets/${ipaNumber}.yaml)`;
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

function sortBySeverity(a, b) {
  if (a[2] < b[2]) {
    return -1;
  } else if (a[2] > b[2]) {
    return 1;
  }
  return 0;
}
