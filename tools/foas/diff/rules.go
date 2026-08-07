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

import "github.com/oasdiff/oasdiff/checker"

const (
	deprecationDaysStable = 365
	deprecationDaysBeta   = 365
)

var severityOverrides = map[string]checker.Level{
	"response-non-success-status-removed":           checker.ERR,
	"api-operation-id-removed":                      checker.ERR,
	"api-tag-removed":                               checker.ERR,
	"response-property-enum-value-removed":          checker.ERR,
	"response-mediatype-enum-value-removed":         checker.ERR,
	"request-body-enum-value-removed":               checker.ERR,
	"api-schema-removed":                            checker.ERR,
	"response-property-one-of-added":                checker.INFO,
	"response-body-one-of-added":                    checker.INFO,
	"request-parameter-removed":                     checker.ERR,
	"request-property-removed":                      checker.ERR,
	"response-optional-property-removed":            checker.ERR,
	"response-optional-write-only-property-removed": checker.ERR,
}

func newCheckerConfig() *checker.Config {
	return checker.NewConfig(
		checker.GetAllChecks(),
		checker.WithSeverityLevels(severityOverrides),
		checker.WithDeprecation(deprecationDaysBeta, deprecationDaysStable),
	)
}
