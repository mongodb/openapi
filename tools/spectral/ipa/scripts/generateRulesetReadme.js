import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import spectral from '@stoplight/spectral-core';
import { loadRuleset } from '../utils.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const readmeFilePath = path.join(dirname, '../rulesets', 'README.md');
const conditionsFilePath = path.join(dirname, '../rulesets', 'CONDITIONS.md');
const CONDITIONS_URL = 'https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/rulesets/CONDITIONS.md';

// Plain-English names for the `given` of rules built with defineRule, for their Applies to section
const GIVEN_DESCRIPTIONS = {
  '$.paths': 'each path',
  '$.paths[*]': 'each path item',
  '$.paths[*].post': 'each POST operation',
  '#GetOperationObject': 'each Get operation',
  '#GetOperationObject.responses[*].content': 'each media type of each Get response',
  '$.paths[*].post.responses.200.content': 'each media type of each POST 200 response',
};

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

fs.writeFile(conditionsFilePath, await getConditionsFileContent(), (error) => {
  if (error) {
    console.error('Error while generating the IPA rulesets CONDITIONS.md:', error);
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
    content += `### ${ipaNumber}\n\n` + `Rules are based on ${getIpaRulesetUrl(ipaNumber)}.\n\n` + `${sections}\n\n`;
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
      given: rules[ruleName].definition.given,
      meta: rules[ruleName].then[0]?.function?.meta,
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
    if (rule.meta) {
      sections += getAppliesToSection(rule);
    }
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
  return `[https://mongodb.github.io/ipa/${parts[1]}](https://mongodb.github.io/ipa/${parts[1]})`;
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

// ---------- Rules built with defineRule: generated from the rule's conditions ----------

function getAppliesToSection(rule) {
  const given = [rule.given].flat().map((g) => GIVEN_DESCRIPTIONS[g] ?? `\`${g}\``);
  const subject = given.join(', ').replace(/^./, (c) => c.toUpperCase());
  // not(...) conditions read better as a separate list than as "when: unless ..."
  const required = rule.meta.appliesTo.filter((c) => c.op !== 'not' || c.label);
  const excluded = rule.meta.appliesTo.filter((c) => c.op === 'not' && !c.label).map((c) => c.children[0]);
  let section = `##### Applies to\n${subject}${required.length ? ', when:' : ''}\n`;
  required.forEach((condition) => {
    section += `  - ${describeCondition(condition)}\n`;
  });
  if (excluded.length) {
    section += `${required.length ? '\nExcept' : 'Except'} when:\n`;
    excluded.forEach((condition) => {
      section += `  - ${describeCondition(condition)}\n`;
    });
  }
  return section + '\n';
}

// Named conditions link to the glossary (in-page when rendering the glossary itself); combinations are spelled out
function describeCondition(condition, glossaryUrl = CONDITIONS_URL) {
  const children = condition.children ?? [];
  if (condition.label) {
    return `${condition.label} ([\`${condition.id}\`](${glossaryUrl}#${anchor(condition.id)}))`;
  }
  switch (condition.op) {
    case 'not':
      return `not: ${describeCondition(children[0], glossaryUrl)}`;
    case 'anyOf':
      return `any of: ${children.map((c) => describeCondition(c, glossaryUrl)).join('; ')}`;
    case 'allOf':
      return `all of: ${children.map((c) => describeCondition(c, glossaryUrl)).join('; ')}`;
    default:
      return `\`${condition.id}\``;
  }
}

function anchor(conditionId) {
  return conditionId.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

async function getConditionsFileContent() {
  const rules = await getAllRules();
  const named = new Map();
  const usedBy = new Map();
  const collect = (condition, ruleName) => {
    if (condition.label) {
      named.set(condition.id, condition);
      if (!usedBy.has(condition.id)) {
        usedBy.set(condition.id, new Set());
      }
      usedBy.get(condition.id).add(ruleName);
    }
    (condition.children ?? []).forEach((child) => collect(child, ruleName));
  };
  Object.entries(rules).forEach(([ruleName, rule]) => {
    const meta = rule.then[0]?.function?.meta;
    [...(meta?.appliesTo ?? []), ...(meta?.checkUses ?? [])].forEach((condition) => collect(condition, ruleName));
  });

  let content =
    '<!--- NOTE: This file is generated, please see /scripts/generateRulesetReadme.js --->\n\n' +
    '# IPA Validation Conditions\n\n' +
    'Named conditions that decide where IPA rules apply. They are defined in ' +
    '[rulesets/functions/utils/conditions](https://github.com/mongodb/openapi/tree/main/tools/spectral/ipa/rulesets/functions/utils/conditions) ' +
    'and used by rules built with `defineRule`. Only conditions used by at least one rule are listed.\n\n';

  const sorted = [...named.values()].sort((a, b) => a.id.localeCompare(b.id));
  sorted.forEach((condition) => {
    content += `### ${condition.id}\n\n`;
    content += `Evaluated on: ${condition.subject ?? 'n/a'}

${condition.definition}\n\n`;
    if (condition.children?.length) {
      content += `Defined as: ${describeCondition({ ...condition, label: undefined }, '')}\n\n`;
    }
    if (condition.variantOf) {
      content += `> **Variant of [\`${condition.variantOf}\`](#${anchor(condition.variantOf)}).** ${condition.divergence}\n\n`;
    } else if (condition.divergence) {
      content += `> **Divergence.** ${condition.divergence}\n\n`;
    }
    // An example's note says what makes it (not) match when that is not visible in the path
    const examples = condition.examples;
    if (examples) {
      const describeExample = (example) =>
        `\`${example.path.slice(1).join(' ')}\`${example.note ? ` (${example.note})` : ''}`;
      content += `Matches:\n${examples.match.map((e) => `- ${describeExample(e)}`).join('\n')}\n\n`;
      content += `Does not match:\n${examples.noMatch.map((e) => `- ${describeExample(e)}`).join('\n')}\n\n`;
    }
    const ruleNames = [...usedBy.get(condition.id)].sort();
    content += `Used by: ${ruleNames.map((name) => `[${name}](https://mdb.link/mongodb-atlas-openapi-validation#${name})`).join(', ')}\n\n`;
  });
  return content.trimEnd() + '\n';
}
