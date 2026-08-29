// Copyright 2026 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package diff

import (
	"errors"
	"fmt"
	"reflect"

	"github.com/oasdiff/oasdiff/checker"
)

type ruleMessage func(args []any) string

// customRule keeps the oasdiff execution metadata and the FOAS-owned message
// formatter together. Add each approved custom rule to registeredCustomRules.
type customRule struct {
	id          string
	severity    Severity
	description string
	handler     checker.BackwardCompatibilityCheck
	direction   checker.Direction
	area        checker.Area
	kind        checker.Kind
	action      checker.Action
	message     ruleMessage
}

func newCustomRule(
	id string,
	severity Severity,
	description string,
	handler checker.BackwardCompatibilityCheck,
	direction checker.Direction,
	area checker.Area,
	kind checker.Kind,
	action checker.Action,
	message ruleMessage,
) customRule {
	return customRule{
		id:          id,
		severity:    severity,
		description: description,
		handler:     handler,
		direction:   direction,
		area:        area,
		kind:        kind,
		action:      action,
		message:     message,
	}
}

// registeredCustomRules is the single registry for approved FOAS-specific
// compatibility rules. A new rule normally consists of one checker file and
// one entry in this slice.
func registeredCustomRules() []customRule {
	return nil
}

func validateCustomRules(rules []customRule) error {
	builtInLevels := checker.GetCheckLevels()
	ids := make(map[string]struct{}, len(rules))
	for _, rule := range rules {
		if rule.id == "" {
			return errors.New("custom diff rule ID is required")
		}
		if _, exists := builtInLevels[rule.id]; exists {
			return fmt.Errorf("custom diff rule %q conflicts with an oasdiff rule", rule.id)
		}
		if _, exists := ids[rule.id]; exists {
			return fmt.Errorf("custom diff rule %q is registered more than once", rule.id)
		}
		if rule.description == "" {
			return fmt.Errorf("custom diff rule %q description is required", rule.id)
		}
		if rule.handler == nil {
			return fmt.Errorf("custom diff rule %q checker is required", rule.id)
		}
		if rule.message == nil {
			return fmt.Errorf("custom diff rule %q message formatter is required", rule.id)
		}
		if _, err := checkerLevel(rule.severity); err != nil {
			return fmt.Errorf("custom diff rule %q: %w", rule.id, err)
		}
		ids[rule.id] = struct{}{}
	}
	return nil
}

func customChecks(rules []customRule) checker.BackwardCompatibilityChecks {
	checks := make(checker.BackwardCompatibilityChecks, 0, len(rules))
	handlers := make(map[uintptr]struct{}, len(rules))
	for _, rule := range rules {
		pointer := reflect.ValueOf(rule.handler).Pointer()
		if _, exists := handlers[pointer]; exists {
			continue
		}
		handlers[pointer] = struct{}{}
		checks = append(checks, rule.handler)
	}
	return checks
}

func customRuleMessages(rules []customRule) map[string]ruleMessage {
	messages := make(map[string]ruleMessage, len(rules))
	for _, rule := range rules {
		messages[rule.id] = rule.message
	}
	return messages
}

func checkerLevel(severity Severity) (checker.Level, error) {
	switch severity {
	case SeverityInfo:
		return checker.INFO, nil
	case SeverityWarning:
		return checker.WARN, nil
	case SeverityError:
		return checker.ERR, nil
	default:
		return 0, fmt.Errorf("unsupported severity %q", severity)
	}
}
