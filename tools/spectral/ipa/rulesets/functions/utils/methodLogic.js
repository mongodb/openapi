import { isResourceCollectionIdentifier, isSingletonResource } from './resourceEvaluation';
import { isPathParam } from './resourceEvaluation';

export function invalidGetMethod(resourcePath, resourcePaths) {
  return (
    !isPathParam(resourcePath.split('/').pop()) &&
    !(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePaths))
  );
}

export function invalidListMethod(resourcePath, resourcePaths) {
  return isPathParam(resourcePath.split('/').pop()) || isSingletonResource(resourcePaths);
}
