// Copyright 2024 MongoDB Inc
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

package openapi

import (
	"log"

	"github.com/mongodb/openapi/tools/cli/internal/openapi/errors"
	"github.com/tufin/oasdiff/diff"
	"github.com/tufin/oasdiff/load"
)

type OasDiff struct {
	base     *load.SpecInfo
	external *load.SpecInfo
	config   *diff.Config
	specDiff *diff.Diff
	parser   Parser
}

func (o OasDiff) mergeSpecIntoBase() error {
	if err := o.mergePaths(); err != nil {
		return err
	}

	if err := o.mergeTags(); err != nil {
		return err
	}

	return o.mergeComponents()
}

func (o OasDiff) mergePaths() error {
	pathsToMerge := o.external.Spec.Paths
	basePaths := o.base.Spec.Paths
	for k, v := range pathsToMerge.Map() {
		if ok := basePaths.Value(k); ok == nil {
			basePaths.Set(k, v)
		} else {
			return errors.PathConflictError{
				Entry: k,
			}
		}
	}

	o.base.Spec.Paths = basePaths
	return nil
}

func (o OasDiff) mergeTags() error {
	tagsToMerge := o.external.Spec.Tags
	baseTags := o.base.Spec.Tags
	tagsSet := make(map[string]bool)

	for _, v := range baseTags {
		tagsSet[v.Name] = true
	}

	for _, v := range tagsToMerge {
		if _, ok := tagsSet[v.Name]; !ok {
			baseTags = append(baseTags, v)
		} else {
			return errors.TagConflictError{
				Entry:       v.Name,
				Description: v.Description,
			}
		}
	}

	o.base.Spec.Tags = baseTags
	return nil
}

func (o OasDiff) mergeComponents() error {
	if err := o.mergeParameters(); err != nil {
		return err
	}

	if err := o.mergeResponses(); err != nil {
		return err
	}

	return o.mergeSchemas()
}

func (o OasDiff) mergeParameters() error {
	externalSpecParams := o.external.Spec.Components.Parameters
	baseParams := o.base.Spec.Components.Parameters
	for k, v := range externalSpecParams {
		if _, ok := baseParams[k]; !ok {
			baseParams[k] = v
		} else {
			if o.areParamsIdentical(k) {
				// if the responses are the same, we skip
				log.Printf("\nWe silently resolved the conflict with the response '%s' because the definition was identical.\n", k)
				continue
			}

			// The params have the same name but different definitions
			return errors.ParamConflictError{
				Entry: k,
			}
		}
	}

	o.base.Spec.Components.Parameters = baseParams
	return nil
}

func (o OasDiff) mergeResponses() error {
	extResponses := o.external.Spec.Components.Responses
	baseResponses := o.base.Spec.Components.Responses
	for k, v := range extResponses {
		if _, ok := baseResponses[k]; !ok {
			baseResponses[k] = v
		} else {
			if o.areResponsesIdentical(k) {
				// if the params are the same, we skip
				log.Printf("\nWe silently resolved the conflict with the params '%s' because the definition was identical.\n", k)
				continue
			}

			// The responses have the same name but different definitions
			return errors.ResponseConflictError{
				Entry: k,
			}
		}
	}

	o.base.Spec.Components.Responses = baseResponses
	return nil
}

func (o OasDiff) mergeSchemas() error {
	extSchemas := o.external.Spec.Components.Schemas
	baseSchemas := o.base.Spec.Components.Schemas

	for k, schemaToMerge := range extSchemas {
		if _, ok := baseSchemas[k]; !ok {
			baseSchemas[k] = schemaToMerge
		} else {
			if o.areSchemaIdentical(k) {
				// if the schemas are the same, we skip
				log.Printf("\nWe silently resolved the conflict with the schemas '%s' because the definition was identical.\n", k)
				continue
			}

			// The schemas have the same name but different definitions
			return errors.SchemaConflictError{
				Entry: k,
			}
		}
	}

	o.base.Spec.Components.Schemas = baseSchemas
	return nil
}

func (o OasDiff) areParamsIdentical(paramName string) bool {
	if _, ok := o.specDiff.ParametersDiff.Modified[paramName]; !ok {
		return true
	}

	return false
}

func (o OasDiff) areResponsesIdentical(name string) bool {
	if _, ok := o.specDiff.ResponsesDiff.Modified[name]; !ok {
		return true
	}

	return false
}

func (o OasDiff) areSchemaIdentical(name string) bool {
	if _, ok := o.specDiff.SchemasDiff.Modified[name]; !ok {
		return true
	}

	return false
}
