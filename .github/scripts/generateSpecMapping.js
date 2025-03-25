import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standalone specs can be added directly to the mapping. Any spec that requires displaying a version dropdown
// will need to map its different versions to a separate Bump "branch". For example, a new resource version
// for Atlas Admin API v2 will lead to a new entry in the array with its own Bump branch.
const SPEC_MAPPING = [
  {
    doc: process.env.ATLAS_ADMIN_V1_DOC_ID,
    file: 'openapi/v1-deprecated/v1.json',
    branch: 'main',
  },
];

function handleAdminAPIv2() {
  const docId = process.env.ATLAS_ADMIN_V2_DOC_ID;
  const directory = 'openapi/v2';
  const filePath = path.join(__dirname, `../../${directory}/versions.json`);
  const versions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!versions || !Array.isArray(versions)) {
    console.error(`No versions found for Atlas Admin API v2 at ${filePath}`);
    return;
  }

  for (const [index, version] of versions.entries()) {
    const openapiFilename = `openapi-${version}.json`;
    const openapiFilePath = path.join(path.dirname(filePath), openapiFilename);

    if (!fs.existsSync(openapiFilePath)) {
      console.error(`Could not find resource version "${version}" at ${openapiFilePath}`);
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
