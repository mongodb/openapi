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

import "github.com/getkin/kin-openapi/openapi3"

// RulesetVersion changes whenever FOAS compatibility classification changes.
const RulesetVersion = "1"

// Document is an OpenAPI document and its optional source identifier.
type Document struct {
	Spec   *openapi3.T `json:"-"`
	Source string      `json:"source,omitempty"`
}

// Severity is the FOAS severity assigned to a change.
type Severity string

const (
	SeverityInfo    Severity = "info"
	SeverityWarning Severity = "warning"
	SeverityError   Severity = "error"
)

// Origin identifies how a change was discovered.
type Origin string

const (
	OriginChecker    Origin = "checker"
	OriginStructural Origin = "structural"
)

// Component identifies the broad OpenAPI component affected by a change.
type Component string

const (
	ComponentEndpoint       Component = "endpoint"
	ComponentSchema         Component = "schema"
	ComponentParameter      Component = "parameter"
	ComponentHeader         Component = "header"
	ComponentRequestBody    Component = "requestBody"
	ComponentResponse       Component = "response"
	ComponentSecurityScheme Component = "securityScheme"
	ComponentExample        Component = "example"
	ComponentLink           Component = "link"
	ComponentCallback       Component = "callback"
)

// ChangeType is a coarse classification intended for filtering and display.
type ChangeType string

const (
	ChangeTypeAdded    ChangeType = "added"
	ChangeTypeDeleted  ChangeType = "deleted"
	ChangeTypeModified ChangeType = "modified"
)

// SourceLocation identifies a source range when it is available from the
// comparison engine.
type SourceLocation struct {
	File      string `json:"file,omitempty"`
	Line      int    `json:"line,omitempty"`
	Column    int    `json:"column,omitempty"`
	EndLine   int    `json:"endLine,omitempty"`
	EndColumn int    `json:"endColumn,omitempty"`
}

// Change is one normalized compatibility or structural change.
type Change struct {
	ID               string          `json:"id"`
	Fingerprint      string          `json:"fingerprint"`
	Text             string          `json:"text"`
	Severity         Severity        `json:"severity"`
	Breaking         bool            `json:"breaking"`
	Origin           Origin          `json:"origin"`
	Component        Component       `json:"component"`
	ChangeType       ChangeType      `json:"changeType"`
	Operation        string          `json:"operation,omitempty"`
	OperationID      string          `json:"operationId,omitempty"`
	Path             string          `json:"path,omitempty"`
	Name             string          `json:"name,omitempty"`
	Source           string          `json:"source,omitempty"`
	Section          string          `json:"section,omitempty"`
	BaseLocation     *SourceLocation `json:"baseLocation,omitempty"`
	RevisionLocation *SourceLocation `json:"revisionLocation,omitempty"`
}

// Summary contains full-report counts.
type Summary struct {
	Total       int `json:"total"`
	Breaking    int `json:"breaking"`
	NonBreaking int `json:"nonBreaking"`
}

// Report is the transport-neutral result of comparing two OpenAPI documents.
type Report struct {
	HasChanges     bool     `json:"hasChanges"`
	Summary        Summary  `json:"summary"`
	Changes        []Change `json:"changes"`
	RulesetVersion string   `json:"rulesetVersion"`
	Engine         string   `json:"engine"`
}
