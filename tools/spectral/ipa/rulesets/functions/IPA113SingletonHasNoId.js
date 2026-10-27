// @ts-check
import { defineRule } from './utils/defineRule.js';
import { isSingleton } from './utils/conditions/resource.js';
import { hasGet } from './utils/conditions/operation.js';
import { getAllSuccessfulResponseSchemas } from './utils/methodUtils.js';

const ERROR_MESSAGE = 'Singleton resources must not have a user-provided or system-generated ID.';

export default defineRule({
  appliesTo: [isSingleton, hasGet],
  check: ({ input, path }) => {
    const resourceSchemas = getAllSuccessfulResponseSchemas(input['get']);
    return resourceSchemas.some(({ schema }) => schemaHasIdProperty(schema)) ? [{ path, message: ERROR_MESSAGE }] : [];
  },
});

function schemaHasIdProperty(schema) {
  if (Object.keys(schema).includes('properties')) {
    const propertyNames = Object.keys(schema['properties']);
    return propertyNames.includes('id') || propertyNames.includes('_id');
  }
  return false;
}
