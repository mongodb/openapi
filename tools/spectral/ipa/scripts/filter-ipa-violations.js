import fs from 'node:fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import http from 'http';
import https from 'https';

async function filterIpaViolations() {
  try {
    // Check if rule ID is provided
    const ruleId = process.argv[2];
    if (!ruleId) {
      console.error('Usage: node filter-ipa-violations.js <rule-id> [remote-openapi-url]');
      console.error('Example: node filter-ipa-violations.js xgen-IPA-102-collection-identifier-camelCase');
      console.error(
        'Example with remote file: node filter-ipa-violations.js xgen-IPA-102-collection-identifier-camelCase https://raw.githubusercontent.com/mongodb/openapi/refs/heads/dev/openapi/.raw/v2.yaml'
      );
      process.exit(1);
    }

    // Check if a remote OpenAPI file URL is provided
    const remoteUrl = process.argv[3];
    const outputFile = path.join(process.cwd(), `${ruleId}-violations.md`);

    console.log(`Filtering violations for rule ID: ${ruleId}`);
    console.log('Running IPA validation...');

    // If remote URL provided, download it to a temp file
    let openapiFilePath = './openapi/.raw/v2.yaml'; // Default local file
    let tempFile = null;

    if (remoteUrl) {
      console.log(`Using remote OpenAPI file: ${remoteUrl}`);
      tempFile = path.join(process.cwd(), 'temp_openapi_file.yaml');
      await downloadFile(remoteUrl, tempFile);
      openapiFilePath = tempFile;
    } else {
      console.log('Using local OpenAPI file');
    }

    let validationOutput;
    try {
      // Run IPA validation and get output as JSON
      execSync(
        `spectral lint --format=json -o results.json ${openapiFilePath} --ruleset=./tools/spectral/ipa/ipa-spectral.yaml`,
        {
          encoding: 'utf-8',
          timeout: 4000,
          maxBuffer: 10 * 1024 * 1024,
        }
      );
    } catch (error) {
      console.error('Error (expected):', error.message);
    } finally {
      // Clean up temp file if it exists
      if (tempFile) {
        try {
          await fs.unlink(tempFile);
        } catch (err) {
          console.error('Error removing temporary file:', err.message);
        }
      }
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
        markdownContent += `## ${violation.message}\n\n`;
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

// Function to download a file from a URL
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    console.log(`Downloading OpenAPI file from ${url}...`);

    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject(new Error(`Failed to download file, status code: ${response.statusCode}`));
      }

      const file = fs.open(outputPath, 'w').then((fileHandle) => fileHandle.createWriteStream());
      file
        .then((fileStream) => {
          response.pipe(fileStream);
          response.on('end', () => {
            console.log('Download complete');
            resolve();
          });
        })
        .catch(reject);
    });

    request.on('error', (err) => {
      reject(err);
    });
  });
}

filterIpaViolations();
