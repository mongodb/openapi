import { isCustomMethod } from './utils/resourceEvaluation.js';

const ERROR_MESSAGE = 'The HTTP method for custom methods must be GET or POST.';
const ERROR_RESULT = [{ message: ERROR_MESSAGE }];
const validMethods = ['get', 'post'];

export default (input, _, { documentInventory }) => {
  if (!isCustomMethod(input)) {
    return;
  }

  const oas = documentInventory.resolved;
  let httpMethods = Object.keys(oas.paths[input]);

  const invalidMethodsFound = httpMethods.some((key) => !validMethods.includes(key));
  if (invalidMethodsFound) {
    return ERROR_RESULT;
  }

  const validMethodsFound = httpMethods.filter((key) => validMethods.includes(key));
  if (validMethodsFound.length > 1) {
    return ERROR_RESULT;
  }
};
