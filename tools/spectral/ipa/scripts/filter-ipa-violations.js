import fs from 'node:fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

async function filterIpaViolations() {
  try {
    // Check if rule ID is provided
    const ruleId = process.argv[2];
    if (!ruleId) {
      console.error('Usage: node filter-ipa-violations.js <rule-id>');
      console.error('Example: node filter-ipa-violations.js xgen-IPA-102-collection-identifier-camelCase');
      process.exit(1);
    }

    const outputFile = path.join(process.cwd(), `${ruleId}-violations.md`);

    console.log(`Filtering violations for rule ID: ${ruleId}`);
    console.log('Running IPA validation...');

    let validationOutput;
    try {
      // Run IPA validation and get output as JSON
      execSync(
        'spectral lint --format=json -o results.json ./openapi/.raw/v2.yaml --ruleset=./tools/spectral/ipa/ipa-spectral.yaml',
        {
          encoding: 'utf-8',
          timeout: 4000,
          maxBuffer: 10 * 1024 * 1024,
        }
      );
    } catch (error) {
      console.error('Error (expected):', error.message);
    }

    // Read the JSON output
    validationOutput = await fs.readFile('results.json', 'utf-8');
    console.log('Filtering results...');

    // Parse the JSON output
    const validationResults = JSON.parse(validationOutput);

    // Filter results for the exact specified rule ID
    const filteredResults = validationResults.filter((violation) => violation.code === ruleId);

    // Group by source file
    const groupedBySource = filteredResults.reduce((acc, violation) => {
      const source = violation.source;
      if (!acc[source]) {
        acc[source] = [];
      }
      acc[source].push({
        path: violation.path,
        message: violation.message,
        source: violation.source,
      });
      return acc;
    }, {});

    // Generate markdown content
    let markdownContent = `# ${ruleId} Violations Checklist\n\n`;
    markdownContent += `Generated on: ${new Date().toLocaleString()}\n\n`;

    Object.keys(groupedBySource).forEach((source) => {
      const violations = groupedBySource[source];

      violations.forEach((violation) => {
        markdownContent += `## ${violation.source}\n\n`;
        markdownContent += `Path: \`${violation.path.join('/')}\`\n\n`;
        markdownContent += `- [ ] Fixed\n\n`;
      });
    });

    // Write the markdown file
    await fs.writeFile(outputFile, markdownContent, 'utf-8');

    const violationCount = filteredResults.length;
    console.log(`Results saved to ${outputFile}`);
    console.log(`Found ${violationCount} violations to fix`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

filterIpaViolations();
