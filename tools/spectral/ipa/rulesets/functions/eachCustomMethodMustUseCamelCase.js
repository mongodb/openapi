import { getCustomMethodName, isCustomMethod } from './utils/resourceEvaluation.js';
import { hasException } from './utils/exceptions.js';
import { casing } from '@stoplight/spectral-functions';
import collector, { EntryType } from '../../metrics/collector.js';

const RULE_NAME = 'xgen-IPA-109-custom-method-must-use-camel-case';

export default (input, opts, { path }) => {
  // Extract the path key (e.g., '/a/{exampleId}:method') from the JSONPath.
  let pathKey = path[1];

  if (!isCustomMethod(pathKey)) return;

  if (hasException(input, RULE_NAME, path)) {
    return;
  }

  let methodName = getCustomMethodName(pathKey);
  if (methodName.length === 0 || methodName.trim().length === 0) {
    collector.add(path, RULE_NAME, EntryType.VIOLATION);
    return [{ message: 'Custom method name cannot be empty or blank.' }];
  }

  if (casing(methodName, { type: 'camel', disallowDigits: true })) {
    collector.add(path, RULE_NAME, EntryType.VIOLATION);
    return [{ message: `${methodName} must use camelCase format.` }];
  }

  collector.add(path, RULE_NAME, EntryType.ADOPTION);
};
