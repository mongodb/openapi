// Copyright 2025 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package filter

import (
	"github.com/getkin/kin-openapi/openapi3"
)

// BumpFilter modifies includes the fields "x-state" and "x-beta" to the "preview" and "upcoming" APIs Operations.
// The "x-state" and "x-beta" fields are bump.sh custom fields to include budges
// Bump.sh feature: https://docs.bump.sh/help/specification-support/doc-badges/
type BumpFilter struct {
	oas      *openapi3.T
	metadata *Metadata
}

type State struct {
	Label string `json:"label"`
	Color string `json:"color"`
}

const (
	stateFieldName              = "x-state"
	stateFieldValueUpcoming     = "UPCOMING"
	stateFieldValuePreview      = "PREVIEW"
	stateFieldValuePreviewColor = "#F2FF35" // Yellow
	betaFieldName               = "x-beta"
	description                 = `This API is in preview. Breaking changes might be introduced ` +
		`before it is released. Don't use preview APIs in production.

`
)

func (f *BumpFilter) ValidateMetadata() error {
	return validateMetadataWithVersion(f.metadata)
}

func (f *BumpFilter) Apply() error {
	if f.metadata.targetVersion.IsStable() {
		return nil
	}

	if f.metadata.targetVersion.IsUpcoming() {
		return f.includeBumpFieldForUpcoming()
	}

	return f.includeBumpFieldForPreview()
}

func (f *BumpFilter) includeBumpFieldForUpcoming() error {
	for _, p := range f.oas.Paths.Map() {
		for _, op := range p.Operations() {
			if op.Extensions == nil {
				op.Extensions = map[string]any{}
			}
			op.Extensions[stateFieldName] = stateFieldValueUpcoming
		}
	}

	return nil
}

func (f *BumpFilter) includeBumpFieldForPreview() error {
	for _, p := range f.oas.Paths.Map() {
		for _, op := range p.Operations() {
			if op.Extensions == nil {
				op.Extensions = map[string]any{}
			}
			op.Extensions[stateFieldName] = State{
				Label: stateFieldValuePreview,
				Color: stateFieldValuePreviewColor,
			}
			op.Extensions[betaFieldName] = true
			op.Description = description + " " + op.Description
		}
	}
	return nil
}
