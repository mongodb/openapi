import spectral from "@stoplight/spectral-core";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import { fileURLToPath } from "node:url";
import * as fs from "node:fs";
import * as path from "node:path";
import customJUnitFormatter from "./formatters/custom-formatter.js";
const { Spectral } = spectral;
import jp from 'jsonpath';
import exemptionCollector from '/tools/ipa/ExemptionCollector';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function extractComponentsForTarget(jsonData, target) {
  try {
    const matches = jp.query(jsonData, target[0]);

    return Object.keys(matches[0]);
  } catch (error) {
    console.error(`Error processing target ${target}:`, error);
    return [];
  }
}

(async () => {
  const spectral = new Spectral();

  try {
    // Read the OpenAPI file
    const { readFile, writeFile } = fs.promises;
    const openApiContent = await readFile('../../openapi/v2.json', 'utf8');

    // Load the ruleset
    const rulesetPath = path.join(__dirname, "./ipa-spectral.yaml");
    const ruleset = await bundleAndLoadRuleset(rulesetPath, { fs, fetch });
    await spectral.setRuleset(ruleset);

    const jsonData = JSON.parse(openApiContent);
    const componentsByRule = {};
    const allRules = spectral.ruleset.rules;
    const successfulComponents = [];

    //Run Spectral
    const results = await spectral.run(openApiContent);
    const exemptions = exemptionCollector.getExemptions();

    for (const [ruleName, rule] of Object.entries(allRules)) {
      // Extract components based on rule's given target
      const ruleTarget = rule.given || '$.';
      const components = extractComponentsForTarget(jsonData, ruleTarget);

      componentsByRule[ruleName] = components;

      // Collect all results for this specific rule
      const failureResults = results.filter((result) => result.code === ruleName);
      const failedPaths = new Set(failureResults.map((result) => result.path.join(".")));

      components.forEach((component) => {
        if (!failedPaths.has(component)) {
          successfulComponents.push({
            componentId: component,
            ruleName: ruleName,
            adoption: "success",
          });
        }
      });
    }

    await writeFile(
      "./spectral-components.json",
      JSON.stringify(componentsByRule, null, 2)
    );
    await writeFile(
      "./spectral-components-successful.json",
      JSON.stringify(successfulComponents, null, 2)
    );

    await writeFile(
      "./spectral-components-exemptions.json",
      JSON.stringify(exemptions, null, 2)
    );
    // Use the custom formatter
    const formattedOutput = await customJUnitFormatter(results, '../../openapi/v2.json', spectral);

    // Write the output to a file
    //console.log(formattedOutput);
    await writeFile('./spectral-report.xml', formattedOutput);

  } catch (err) {
    console.error('Error running Spectral:', err.message);
    process.exit(1);
  }
})();