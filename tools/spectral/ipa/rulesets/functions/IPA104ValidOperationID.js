// @ts-check
import { getOperationIdRuleConditions } from './utils/conditions/operationIdRules.js';
import { validOperationIdRule } from './utils/operationIdRules.js';

export default validOperationIdRule(getOperationIdRuleConditions());
