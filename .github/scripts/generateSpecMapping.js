import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ATLAS_ADMIN_API_V2_DOC = 'atlas-admin-api-v2';

const SPEC_MAPPING = [
  {
    doc: 'atlas-admin-api-v1',
    file: 'openapi/v1-deprecated/v1.json',
    branch: 'main',
  },
  // Need to programmatically handle resource versions separately
  {
    doc: ATLAS_ADMIN_API_V2_DOC,
    file: 'openapi/v2.json',
    branch: 'latest',
  },
];

/**
 * Handles the resource versions for Atlas Admin API v2
 */
function handleResourceVersions() {
  const directory = 'openapi/v2';
  const filePath = path.join(__dirname, `../../${directory}/versions.json`);
  const versions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const version of versions) {
    const openapiFilename = `openapi-${version}.json`;
    const openapiFilePath = path.join(path.dirname(filePath), openapiFilename);

    if (!fs.existsSync(openapiFilePath)) {
      continue;
    }

    SPEC_MAPPING.push({
      doc: ATLAS_ADMIN_API_V2_DOC,
      file: `${directory}/${openapiFilename}`,
      branch: version,
    });
  }
}

handleResourceVersions();
console.log(JSON.stringify(SPEC_MAPPING));
