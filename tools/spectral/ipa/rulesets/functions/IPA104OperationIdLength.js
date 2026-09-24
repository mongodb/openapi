// @ts-check
import { getOperationIdRuleConditions } from './utils/conditions/operationIdRules.js';
import { operationIdLengthRule } from './utils/operationIdRules.js';

export default operationIdLengthRule(getOperationIdRuleConditions());
