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
	"context"
	"crypto/sha256"
	"errors"
	"fmt"
	"sort"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/oasdiff/oasdiff/checker"
	oasdiff "github.com/oasdiff/oasdiff/diff"
	"github.com/oasdiff/oasdiff/flatten/allof"
	"github.com/oasdiff/oasdiff/load"
)

// Compare compares a base OpenAPI document with a revision using FOAS
// compatibility rules.
func Compare(ctx context.Context, base, revision Document) (Report, error) {
	return compareWithCustomRules(ctx, base, revision, registeredCustomRules())
}

func compareWithCustomRules(ctx context.Context, base, revision Document, customRules []customRule) (Report, error) {
	if contextErr := ctx.Err(); contextErr != nil {
		return Report{}, contextErr
	}
	if base.Spec == nil {
		return Report{}, errors.New("base OpenAPI document is required")
	}
	if revision.Spec == nil {
		return Report{}, errors.New("revision OpenAPI document is required")
	}

	baseSpec, revisionSpec, err := prepareSpecs(base.Spec, revision.Spec)
	if err != nil {
		return Report{}, err
	}

	diffConfig := oasdiff.NewConfig()
	diffConfig.IncludePathParams = true
	report, sourceMap, err := oasdiff.GetWithOperationsSourcesMap(
		diffConfig,
		&load.SpecInfo{Spec: baseSpec, Url: base.Source},
		&load.SpecInfo{Spec: revisionSpec, Url: revision.Source},
	)
	if err != nil {
		return Report{}, fmt.Errorf("compute OpenAPI diff: %w", err)
	}

	result := Report{
		RulesetVersion: RulesetVersion,
		Engine:         "oasdiff",
		Changes:        make([]Change, 0),
	}
	if report == nil {
		return result, nil
	}

	if contextErr := ctx.Err(); contextErr != nil {
		return Report{}, contextErr
	}

	checkerConfig, err := newCheckerConfig(customRules)
	if err != nil {
		return Report{}, fmt.Errorf("configure compatibility checks: %w", err)
	}
	checkerChanges := checker.CheckBackwardCompatibilityUntilLevel(
		checkerConfig,
		report,
		sourceMap,
		checker.INFO,
	)
	localizer := checker.NewDefaultLocalizer()
	customMessages := customRuleMessages(customRules)
	result.Changes = make([]Change, 0, len(checkerChanges))
	for _, checkerChange := range checkerChanges {
		result.Changes = append(result.Changes, normalizeCheckerChange(checkerChange, localizer, customMessages))
	}

	result.Changes = appendMissingAdditions(result.Changes, report)

	sortChanges(result.Changes)
	result.Summary = summarize(result.Changes)
	result.HasChanges = result.Summary.Total > 0
	return result, nil
}

func prepareSpecs(base, revision *openapi3.T) (flattenedBase, flattenedRevision *openapi3.T, err error) {
	flattenedBase, err = allof.MergeSpec(base)
	if err != nil {
		return nil, nil, fmt.Errorf("flatten base OpenAPI document: %w", err)
	}
	flattenedRevision, err = allof.MergeSpec(revision)
	if err != nil {
		return nil, nil, fmt.Errorf("flatten revision OpenAPI document: %w", err)
	}
	return flattenedBase, flattenedRevision, nil
}

func normalizeCheckerChange(
	change checker.Change,
	localizer checker.Localizer,
	customMessages map[string]ruleMessage,
) Change {
	component, changeType := classifyChange(change.GetId())
	severity := severityFromChecker(change.GetLevel())
	text := change.GetUncolorizedText(localizer)
	if message, exists := customMessages[change.GetId()]; exists {
		text = message(change.GetArgs())
	}
	result := Change{
		ID:               change.GetId(),
		Text:             text,
		Severity:         severity,
		Breaking:         severity == SeverityError,
		Origin:           OriginChecker,
		Component:        component,
		ChangeType:       changeType,
		Operation:        change.GetOperation(),
		OperationID:      change.GetOperationId(),
		Path:             change.GetPath(),
		Source:           change.GetSource(),
		Section:          change.GetSection(),
		BaseLocation:     sourceLocation(change.GetBaseSource()),
		RevisionLocation: sourceLocation(change.GetRevisionSource()),
	}
	result.Fingerprint = fingerprint(&result)
	return result
}

func severityFromChecker(level checker.Level) Severity {
	switch {
	case level >= checker.ERR:
		return SeverityError
	case level >= checker.WARN:
		return SeverityWarning
	default:
		return SeverityInfo
	}
}

func sourceLocation(source *checker.Source) *SourceLocation {
	if source == nil {
		return nil
	}
	return &SourceLocation{
		File:      source.File,
		Line:      source.Line,
		Column:    source.Column,
		EndLine:   source.EndLine,
		EndColumn: source.EndColumn,
	}
}

func appendMissingAdditions(changes []Change, report *oasdiff.Diff) []Change {
	existing := make(map[string]struct{}, len(changes))
	for index := range changes {
		existing[changeIdentity(&changes[index])] = struct{}{}
	}

	additions := structuralAdditions(report)
	for index := range additions {
		change := additions[index]
		key := changeIdentity(&change)
		if _, found := existing[key]; found {
			continue
		}
		existing[key] = struct{}{}
		changes = append(changes, change)
	}
	return changes
}

func structuralAdditions(report *oasdiff.Diff) []Change {
	var changes []Change

	if report.EndpointsDiff != nil {
		for _, endpoint := range report.EndpointsDiff.Added {
			change := Change{
				ID:         "endpoint-added",
				Text:       fmt.Sprintf("endpoint %s %s added", endpoint.Method, endpoint.Path),
				Severity:   SeverityInfo,
				Origin:     OriginStructural,
				Component:  ComponentEndpoint,
				ChangeType: ChangeTypeAdded,
				Operation:  endpoint.Method,
				Path:       endpoint.Path,
			}
			change.Fingerprint = fingerprint(&change)
			changes = append(changes, change)
		}
	}

	if report.ComponentsDiff == nil {
		return changes
	}

	components := report.ComponentsDiff
	if components.SchemasDiff != nil {
		changes = append(changes, namedAdditions("api-schema-added", ComponentSchema, "schema", components.SchemasDiff.Added)...)
	}
	if components.ParametersDiff != nil {
		changes = append(changes, namedAdditions("api-parameter-added", ComponentParameter, "parameter", components.ParametersDiff.Added)...)
	}
	if components.HeadersDiff != nil {
		changes = append(changes, namedAdditions("api-header-added", ComponentHeader, "header", components.HeadersDiff.Added)...)
	}
	if components.RequestBodiesDiff != nil {
		changes = append(changes, namedAdditions(
			"api-request-body-added",
			ComponentRequestBody,
			"request body",
			components.RequestBodiesDiff.Added,
		)...)
	}
	if components.ResponsesDiff != nil {
		changes = append(changes, namedAdditions("api-response-added", ComponentResponse, "response", components.ResponsesDiff.Added)...)
	}
	if components.SecuritySchemesDiff != nil {
		changes = append(changes, namedAdditions(
			"api-security-scheme-added",
			ComponentSecurityScheme,
			"security scheme",
			components.SecuritySchemesDiff.Added,
		)...)
	}
	if components.ExamplesDiff != nil {
		changes = append(changes, namedAdditions("api-example-added", ComponentExample, "example", components.ExamplesDiff.Added)...)
	}
	if components.LinksDiff != nil {
		changes = append(changes, namedAdditions("api-link-added", ComponentLink, "link", components.LinksDiff.Added)...)
	}
	if components.CallbacksDiff != nil {
		changes = append(changes, namedAdditions("api-callback-added", ComponentCallback, "callback", components.CallbacksDiff.Added)...)
	}
	return changes
}

func namedAdditions(id string, component Component, label string, names []string) []Change {
	changes := make([]Change, 0, len(names))
	for _, name := range names {
		change := Change{
			ID:         id,
			Text:       fmt.Sprintf("%s %q added", label, name),
			Severity:   SeverityInfo,
			Origin:     OriginStructural,
			Component:  component,
			ChangeType: ChangeTypeAdded,
			Name:       name,
		}
		change.Fingerprint = fingerprint(&change)
		changes = append(changes, change)
	}
	return changes
}

func changeIdentity(change *Change) string {
	return strings.Join([]string{
		string(change.Component),
		string(change.ChangeType),
		change.Operation,
		change.Path,
		change.Name,
	}, "\x00")
}

func fingerprint(change *Change) string {
	value := strings.Join([]string{
		change.ID,
		string(change.Component),
		string(change.ChangeType),
		change.Operation,
		change.OperationID,
		change.Path,
		change.Name,
		change.Text,
	}, "\x00")
	sum := sha256.Sum256([]byte(value))
	return fmt.Sprintf("sha256:%x", sum[:16])
}

func sortChanges(changes []Change) {
	sort.SliceStable(changes, func(i, j int) bool {
		left, right := &changes[i], &changes[j]
		if left.Breaking != right.Breaking {
			return left.Breaking
		}
		if left.Path != right.Path {
			return left.Path < right.Path
		}
		if left.Operation != right.Operation {
			return left.Operation < right.Operation
		}
		if left.Name != right.Name {
			return left.Name < right.Name
		}
		return left.ID < right.ID
	})
}

func summarize(changes []Change) Summary {
	summary := Summary{Total: len(changes)}
	for index := range changes {
		change := &changes[index]
		if change.Breaking {
			summary.Breaking++
			continue
		}
		summary.NonBreaking++
	}
	return summary
}
