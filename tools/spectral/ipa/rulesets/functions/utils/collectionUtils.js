import collector, { EntryType } from '../../../metrics/collector.js';

export function collectAndReturnViolation(path, ruleName, errorData) {
  collector.add(EntryType.VIOLATION, path, ruleName);

  if (typeof errorData === 'string') {
    return [{ message: errorData }];
  } else if (Array.isArray(errorData)) {
    return errorData;
  } else {
    throw new Error('Invalid error data type. Expected string or array.');
  }
}

export function collectAdoption(path, ruleName) {
  collector.add(EntryType.ADOPTION, path, ruleName);
}