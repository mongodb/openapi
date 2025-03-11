import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPEC_MAPPING = [
  {
    doc: 'f929d2d7-27d7-4591-b22f-6c2e543a7874',
    file: 'openapi/v1-deprecated/v1.json',
    branch: 'main',
  },
];

/**
 * Handles the resource versions for Atlas Admin API v2
 */
function handleAdminAPIv2() {
  const docId = '2accf4b8-a543-426c-94c3-794ae26b68be';
  const directory = 'openapi/v2';
  const filePath = path.join(__dirname, `../../${directory}/versions.json`);
  const versions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!versions || !Array.isArray(versions)) {
    return;
  }

  for (const [index, version] of versions.entries()) {
    const openapiFilename = `openapi-${version}.json`;
    const openapiFilePath = path.join(path.dirname(filePath), openapiFilename);

    if (!fs.existsSync(openapiFilePath)) {
      continue;
    }

    const file = `${directory}/${openapiFilename}`;
    SPEC_MAPPING.push({
      doc: docId,
      file,
      branch: version,
    });

    // We want the latest version to have its own version AND be the latest/default branch
    if (index === versions.length - 1) {
      SPEC_MAPPING.push({
        doc: docId,
        file,
        branch: 'latest',
      });
    }
  }
}

handleAdminAPIv2();
// Output to GH action
console.log(JSON.stringify(SPEC_MAPPING));
