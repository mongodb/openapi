package customcheckers

import (
	"fmt"
	"github.com/oasdiff/oasdiff/checker"
	"github.com/oasdiff/oasdiff/utils"
)

func GetAllChecks() checker.BackwardCompatibilityChecks {
	return rulesToChecks(getAllRules())
}

func GetAllRules() checker.BackwardCompatibilityRules {
	rules := []checker.BackwardCompatibilityRule{
		newRule(XXgenOperationIdOverrideAddedId, checker.ERR, "", APIXXgenOperationIdOverrideUpdatedCheck, checker.DirectionNone, checker.LocationNone, checker.ActionAdd),
		newRule(XXgenOperationIdOverrideRemovedId, checker.ERR, "", APIXXgenOperationIdOverrideUpdatedCheck, checker.DirectionNone, checker.LocationNone, checker.ActionRemove),
		newRule(XXgenOperationIdOverrideModifiedId, checker.ERR, "", APIXXgenOperationIdOverrideUpdatedCheck, checker.DirectionNone, checker.LocationNone, checker.ActionChange),
	}

	return rules
}

func getAllRules() checker.BackwardCompatibilityRules {
	rules := []checker.BackwardCompatibilityRule{
		newRule(XXgenOperationIdOverrideAddedId, checker.ERR, "", APIXXgenOperationIdOverrideUpdatedCheck, checker.DirectionNone, checker.LocationNone, checker.ActionAdd),
		newRule(XXgenOperationIdOverrideRemovedId, checker.ERR, "", APIXXgenOperationIdOverrideUpdatedCheck, checker.DirectionNone, checker.LocationNone, checker.ActionRemove),
		newRule(XXgenOperationIdOverrideModifiedId, checker.ERR, "", APIXXgenOperationIdOverrideUpdatedCheck, checker.DirectionNone, checker.LocationNone, checker.ActionChange),
	}

	return rules
}

func newRule(id string, level checker.Level, description string, check checker.BackwardCompatibilityCheck, direction checker.Direction, location checker.Location, action checker.Action) checker.BackwardCompatibilityRule {
	return checker.BackwardCompatibilityRule{
		Id:          id,
		Level:       level,
		Description: description,
		Handler:     check,
		Direction:   direction,
		Location:    location,
		Action:      action,
	}
}

func rulesToChecks(rules checker.BackwardCompatibilityRules) checker.BackwardCompatibilityChecks {
	result := checker.BackwardCompatibilityChecks{}
	m := utils.StringSet{}
	for _, rule := range rules {
		// functions are not comparable, so we convert them to strings
		pStr := fmt.Sprintf("%v", rule.Handler)
		if !m.Contains(pStr) {
			m.Add(pStr)
			result = append(result, rule.Handler)
		}
	}
	return result
}
