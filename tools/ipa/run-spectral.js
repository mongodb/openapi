import spectral from "@stoplight/spectral-core";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import { fileURLToPath } from "node:url";
import * as fs from "node:fs";
import * as path from "node:path";
import customJUnitFormatter from "./formatters/custom-formatter.js";
const { Spectral } = spectral;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const spectral = new Spectral();

  try {
    // Load the ruleset
    const rulesetPath = path.join(__dirname, "./ipa-spectral.yaml");
    const ruleset = await bundleAndLoadRuleset(rulesetPath, { fs, fetch });
    await spectral.setRuleset(ruleset);

    // Read the OpenAPI file and run Spectral
    const { readFile, writeFile } = fs.promises;
    const openApiContent = await readFile('../../openapi/v2.json', 'utf8');
    const results = await spectral.run(openApiContent);

    // Use the custom formatter
    const formattedOutput = await customJUnitFormatter(results, '../../openapi/v2.json', spectral);

    // Write the output to a file
    console.log(formattedOutput);
    await writeFile('./spectral-report.xml', formattedOutput);

  } catch (err) {
    console.error('Error running Spectral:', err.message);
    process.exit(1);
  }
})();