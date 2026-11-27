import fs from 'node:fs';

// Docs-render normalization for Bump.sh (CLOUDP-475594).
//
// Bump.sh's renderer degrades a discriminated union to an opaque `array[object]`
// when the union parent declares its own `properties` alongside `oneOf` and each
// child composes back to the parent via `allOf` (a parent<->child $ref cycle),
// and the union is reached through array items in a request body. This script
// rewrites ONLY the copy of the spec deployed to Bump.sh into an acyclic view:
//
//   Parent:     { discriminator, oneOf: [...] }             (union only)
//   ParentBase: { type: 'object', properties: {...common} } (new schema)
//   ChildN:     { allOf: [ {$ref ParentBase}, {provider part} ] }
//
// The published spec in this repository is untouched; the deployed contract as
// consumed by SDKs and validators is unchanged. If the source schema no longer
// has the cyclic shape (for example because it was refactored at the source),
// the input is passed through unchanged and a workflow warning is emitted.
//
// Usage: node normalizeDiscriminatedUnionForBump.js <specPath> <outPath> [parentName]

const BASE_SUFFIX = 'Base';
const DEFAULT_PARENT = 'CloudRegionConfig20240805';

function warn(message) {
  console.log(`::warning::${message}`);
}

function passThrough(specPath, outPath, reason) {
  fs.copyFileSync(specPath, outPath);
  warn(`normalizeDiscriminatedUnionForBump: passing spec through unchanged (${reason})`);
}

function transform(schemas, parentName) {
  const parent = schemas[parentName];
  if (!parent) {
    return { changed: false, reason: `${parentName} not found` };
  }
  if (!('oneOf' in parent) || !('properties' in parent)) {
    return {
      changed: false,
      reason: `${parentName} no longer has the cyclic oneOf+properties shape; source may be fixed`,
    };
  }
  if (!('discriminator' in parent)) {
    throw new Error(`${parentName} has no discriminator; refusing to guess branch keys`);
  }

  const baseName = parentName + BASE_SUFFIX;
  if (baseName in schemas) {
    throw new Error(`${baseName} already exists; refusing to overwrite`);
  }

  const out = structuredClone(schemas);
  out[baseName] = {
    type: 'object',
    description: parent.description ?? '',
    title: parent.title,
    properties: structuredClone(parent.properties),
  };
  const union = {
    description: parent.description ?? '',
    title: parent.title,
    discriminator: structuredClone(parent.discriminator),
    oneOf: structuredClone(parent.oneOf),
  };
  // Keep any x- vendor extensions at the union level.
  for (const [key, value] of Object.entries(parent)) {
    if (key.startsWith('x-') && !(key in union)) {
      union[key] = structuredClone(value);
    }
  }
  out[parentName] = union;

  // Rewrite each oneOf branch: swap the self-referential Parent allOf leg for ParentBase.
  for (const branch of union.oneOf) {
    const ref = branch.$ref ?? '';
    const childName = ref ? ref.split('/').pop() : null;
    if (!childName || !(childName in out)) {
      continue;
    }
    const node = out[childName];
    if (!Array.isArray(node.allOf) || node.allOf.length === 0) {
      continue;
    }
    for (const [index, leg] of node.allOf.entries()) {
      if (leg.$ref === `#/components/schemas/${parentName}`) {
        node.allOf[index] = { $ref: `#/components/schemas/${baseName}` };
      }
    }
  }
  return { changed: true, schemas: out };
}

function main() {
  const [specPath, outPath, parentName = DEFAULT_PARENT] = process.argv.slice(2);
  if (!specPath || !outPath) {
    console.error('Usage: node normalizeDiscriminatedUnionForBump.js <specPath> <outPath> [parentName]');
    process.exit(2);
  }
  const doc = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const schemas = doc?.components?.schemas;
  if (!schemas) {
    passThrough(specPath, outPath, 'no components.schemas');
    return;
  }

  const result = transform(schemas, parentName);
  if (!result.changed) {
    passThrough(specPath, outPath, result.reason);
    return;
  }

  doc.components.schemas = result.schemas;
  fs.writeFileSync(outPath, `${JSON.stringify(doc, null, 1)}\n`);
  console.log(
    `normalizeDiscriminatedUnionForBump: rewrote ${parentName} -> ${parentName}${BASE_SUFFIX} + acyclic union -> ${outPath}`
  );
}

main();
