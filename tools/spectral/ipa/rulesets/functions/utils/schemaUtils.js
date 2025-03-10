export function schemaIsPaginated(schema) {
  const fields = Object.keys(schema);
  return fields.includes('properties') && Object.keys(schema['properties']).includes('results');
}

export function schemaIsArray(schema) {
  const fields = Object.keys(schema);
  return fields.includes('type') && schema['type'] === 'array';
}
