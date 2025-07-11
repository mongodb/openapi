import { isSingleResourceIdentifier, isResourceCollectionIdentifier, isSingletonResource } from './resourceEvaluation';

export function invalidGetMethod(resourcePath, resourcePaths) {
  return (
    !isSingleResourceIdentifier(resourcePath) &&
    !(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePaths))
  );
}

export function invalidListMethod(resourcePath, resourcePaths) {
  return !isResourceCollectionIdentifier(resourcePath) || isSingletonResource(resourcePaths);
}
