import { isCustomMethod } from './utils/resourceEvaluation.js';

const ERROR_MESSAGE = 'The HTTP method for custom methods must be GET or POST.';
const VALID_METHODS = ['get', 'post'];

export default (paths) => {
  // Collect all errors
  const errors = [];

  // Iterate through each path key and its corresponding path item
  for (const [pathKey, pathItem] of Object.entries(paths)) {
    // Skip if not a custom method
    if (!isCustomMethod(pathKey)) continue;

    // Get HTTP methods for this path
    const httpMethods = Object.keys(pathItem);

    // Check for invalid methods
    if (httpMethods.some((method) => !VALID_METHODS.includes(method))) {
      errors.push({ path: ['paths', pathKey], message: ERROR_MESSAGE });
      continue;
    }

    // Check for multiple valid methods
    const validMethodCount = httpMethods.filter((method) => VALID_METHODS.includes(method)).length;

    if (validMethodCount > 1) {
      errors.push({ path: ['paths', pathKey], message: ERROR_MESSAGE });
    }
  }

  return errors;
};
