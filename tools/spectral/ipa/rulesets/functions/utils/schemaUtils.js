export function schemaIsPaginated(schema) {
  const fields = Object.keys(schema);
  return fields.includes('properties') && Object.keys(schema['properties']).includes('results');
}

export function schemaIsArray(schema) {
  const fields = Object.keys(schema);
  return fields.includes('type') && schema['type'] === 'array';
}

/**
 * Extract properties from schema, handling allOf and schema references
 * @param {object} schema - Schema object
 * @returns {object} - Combined properties object
 */
function getSchemaProperties(schema) {
  let props = {};

  if (schema.properties) {
    props = { ...schema.properties };
  }

  // Handle allOf
  if (schema.allOf) {
    schema.allOf.forEach((subSchema) => {
      const subProps = getSchemaProperties(subSchema);
      props = { ...props, ...subProps };
    });
  }

  return props;
}

/**
 * Compares two schemas and returns inconsistent fields
 * @param {object} postSchema - POST request schema
 * @param {object} getSchema - GET response schema
 * @returns {Array} - Array of inconsistent field names
 */
export function compareSchemas(postSchema, getSchema) {
  const inconsistentFields = [];

  // Collect all properties from post schema
  const postProps = getSchemaProperties(postSchema);
  const getProps = getSchemaProperties(getSchema);

  // Compare properties from post schema that should be in get schema
  for (const prop in postProps) {
    // Skip writeOnly properties
    if (postProps[prop].writeOnly) {
      continue;
    }

    // If property doesn't exist in GET schema
    if (!getProps[prop]) {
      inconsistentFields.push(prop);
      continue;
    }

    // For objects, compare nested properties
    if (postProps[prop].type === 'object' && getProps[prop].type === 'object') {
      const nestedInconsistencies = compareSchemas(postProps[prop], getProps[prop]);
      if (nestedInconsistencies.length > 0) {
        // Prefix nested fields with their parent name
        inconsistentFields.push(...nestedInconsistencies.map((field) => `${prop}.${field}`));
      }
    }
  }

  return inconsistentFields;
}
