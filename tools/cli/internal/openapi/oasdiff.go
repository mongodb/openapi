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
	"slices"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/openapi/errors"
	"github.com/tufin/oasdiff/diff"

	"github.com/tufin/oasdiff/load"
)

type OasDiff struct {
	base       *load.SpecInfo
	external   *load.SpecInfo
	config     *diff.Config
	diffGetter Differ
	result     *OasDiffResult
	parser     Parser
}

func (o OasDiff) mergeSpecIntoBase() (*load.SpecInfo, error) {
	if o.external == nil || o.external.Spec == nil {
		return o.base, nil
	}

	if o.base == nil || o.base.Spec == nil {
		return o.external, nil
	}

	if err := o.mergePaths(); err != nil {
		return nil, err
	}

	if err := o.mergeTags(); err != nil {
		return nil, err
	}

	if err := o.mergeComponents(); err != nil {
		return nil, err
	}

	return o.base, nil
}

func (o OasDiff) mergePaths() error {
	pathsToMerge := o.external.Spec.Paths
	if pathsToMerge == nil || pathsToMerge.Len() == 0 {
		return nil
	}

	basePaths := o.base.Spec.Paths
	if basePaths == nil || basePaths.Len() == 0 {
		o.base.Spec.Paths = pathsToMerge
		return nil
	}

	for path, externalPathData := range pathsToMerge.Map() {
		// Tries to find if the path already exists or not
		if originalPathData := basePaths.Value(path); originalPathData == nil {
			basePaths.Set(path, removeExternalRefs(externalPathData))
		} else {
			if err := o.handlePathConflict(externalPathData, path); err != nil {
				return err
			}
			basePaths.Set(path, removeExternalRefs(externalPathData))
		}
	}
	o.base.Spec.Paths = basePaths
	return nil
}

// removeExternalRefs updates the external references of OASes to remove the reference to openapi-mms.json.
// Example of an external ref is "$ref": "openapi-mms.json#/components/responses/internalServerError"
// Example of an external ref after removeExternalRefs: "$ref": "#/components/responses/internalServerError"
func removeExternalRefs(path *openapi3.PathItem) *openapi3.PathItem {
	if path.Get != nil {
		updateExternalRefResponses(path.Get.Responses)
		updateExternalRefParams(&path.Get.Parameters)
	}

	if path.Put != nil {
		updateExternalRefResponses(path.Put.Responses)
		updateExternalRefParams(&path.Put.Parameters)
		updateExternalRefReqBody(path.Put.RequestBody)
	}

	if path.Post != nil {
		updateExternalRefResponses(path.Post.Responses)
		updateExternalRefParams(&path.Post.Parameters)
		updateExternalRefReqBody(path.Post.RequestBody)
	}

	if path.Patch != nil {
		updateExternalRefResponses(path.Patch.Responses)
		updateExternalRefParams(&path.Patch.Parameters)
		updateExternalRefReqBody(path.Patch.RequestBody)
	}

	if path.Delete != nil {
		updateExternalRefResponses(path.Delete.Responses)
		updateExternalRefParams(&path.Delete.Parameters)
	}

	return path
}

// handlePathConflict handles the path conflict by checking if the conflict should be skipped or not.
func (o OasDiff) handlePathConflict(basePath *openapi3.PathItem, basePathName string) error {
	if !o.shouldSkipPathConflict(basePath, basePathName) {
		return errors.PathConflictError{
			Entry: basePathName,
		}
	}

	var pathsAreIdentical bool
	var err error
	if pathsAreIdentical, err = o.arePathsIdenticalWithExcludeExtensions(basePathName); err != nil {
		return err
	}

	log.Printf("Skipping conflict for path: %s, pathsAreIdentical: %v", basePathName, pathsAreIdentical)
	if pathsAreIdentical {
		return nil
	}

	// allowDocsDiff = true not supported
	if allOperationsAllowDocsDiff(basePath) {
		return errors.AllowDocsDiffNotSupportedError{
			Entry: basePathName,
		}
	}

	exclude := []string{"extensions"}
	customConfig := diff.NewConfig().WithExcludeElements(exclude)
	d, err := o.GetDiffWithConfig(o.base, o.external, customConfig)
	if err != nil {
		return err
	}

	return errors.PathDocsDiffConflictError{
		Entry: basePathName,
		Diff:  d.Report,
	}
}

// shouldSkipConflict checks if the conflict should be skipped.
// The method goes through each path operation and performs the following checks:
// 1. Validates if both paths have same operations, if not, then it returns false.
// 2. If both paths have the same operations, then it checks if there is an x-xgen-soa-migration annotation.
// If there is no annotation, then it returns false.
func (o OasDiff) shouldSkipPathConflict(basePath *openapi3.PathItem, basePathName string) bool {
	var pathsDiff *diff.PathsDiff
	if o.result != nil && o.result.Report != nil && o.result.Report.PathsDiff != nil {
		pathsDiff = o.result.Report.PathsDiff
	}

	if pathsDiff != nil && pathsDiff.Modified != nil && pathsDiff.Modified[basePathName] != nil {
		if ok := pathsDiff.Modified[basePathName].OperationsDiff.Added; !ok.Empty() {
			return false
		}

		if ok := pathsDiff.Modified[basePathName].OperationsDiff.Deleted; !ok.Empty() {
			return false
		}
	}

	// now check if there is an x-xgen-soa-migration annotation in any of the operations, but if any of the operations
	// doesn't have, then we should not skip the conflict
	return allOperationsHaveExtension(basePath, basePathName, xgenSoaMigration)
}

// updateExternalRefResponses updates the external references of OASes to remove the reference to openapi-mms.json
// in the Responses.
// A Response can have an external ref in Response.Ref or in its content (Response.Content.Schema.Ref)
func updateExternalRefResponses(responses *openapi3.Responses) {
	if responses == nil {
		return
	}

	for _, v := range responses.Map() {
		if strings.Contains(v.Ref, ".json#") {
			v.Ref = removeExternalRef(v.Ref)
			continue
		}

		if v.Value == nil || v.Value.Content == nil {
			continue
		}

		updateExternalRefContent(&v.Value.Content)
	}
}

func removeExternalRef(ref string) string {
	pos := strings.Index(ref, "#")
	if pos == -1 {
		return ref
	}

	return ref[pos:]
}

// updateExternalRefContent updates the external references of OASes to remove the reference to openapi-mms.json
// in the Schema.Content.
func updateExternalRefContent(content *openapi3.Content) {
	for _, value := range *content {
		if value.Schema == nil {
			continue
		}

		if strings.Contains(value.Schema.Ref, ".json#") {
			value.Schema.Ref = removeExternalRef(value.Schema.Ref)
		}
	}
}

// updateExternalRefParams updates the external references of OASes to remove the reference to openapi-mms.json
// in the Parameters.
// A Parameter can have an external ref in Parameter.Ref or in its content (Parameter.Content.Schema.Ref)
func updateExternalRefParams(params *openapi3.Parameters) {
	if params == nil {
		return
	}

	for _, v := range *params {
		if strings.Contains(v.Ref, ".json#") {
			v.Ref = removeExternalRef(v.Ref)
			continue
		}

		if v.Value == nil || v.Value.Content == nil {
			continue
		}

		updateExternalRefContent(&v.Value.Content)
	}
}

// updateExternalRefReqBody updates the external references of OASes to remove the reference to openapi-mms.json
// in the RequestBody.
// A RequestBody can have an external ref in RequestBody.Ref or in its content (RequestBody.Content.Schema.Ref)
func updateExternalRefReqBody(reqBody *openapi3.RequestBodyRef) {
	if reqBody == nil {
		return
	}

	if reqBody.Ref != "" {
		if strings.Contains(reqBody.Ref, ".json#") {
			reqBody.Ref = removeExternalRef(reqBody.Ref)
		}
		return
	}

	if reqBody.Value == nil || reqBody.Value.Content == nil {
		return
	}

	updateExternalRefContent(&reqBody.Value.Content)
}

func (o OasDiff) mergeTags() error {
	tagsToMerge := o.external.Spec.Tags
	if len(tagsToMerge) == 0 {
		return nil
	}

	baseTags := o.base.Spec.Tags
	if len(baseTags) == 0 {
		o.base.Spec.Tags = tagsToMerge
		return nil
	}

	tagsSet := make(map[string]bool, len(baseTags))
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
	slices.SortFunc(ByName(baseTags), func(a, b *openapi3.Tag) int {
		return strings.Compare(strings.ToLower(a.Name), strings.ToLower(b.Name))
	})
	o.base.Spec.Tags = baseTags
	return nil
}

func (o OasDiff) mergeComponents() error {
	if o.external.Spec.Components == nil {
		return nil
	}

	if o.base.Spec.Components == nil {
		o.base.Spec.Components = o.external.Spec.Components
		return nil
	}

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
	if len(externalSpecParams) == 0 {
		return nil
	}

	baseParams := o.base.Spec.Components.Parameters
	if len(baseParams) == 0 {
		o.base.Spec.Components.Parameters = externalSpecParams
		return nil
	}
	for k, v := range externalSpecParams {
		if _, ok := baseParams[k]; !ok {
			baseParams[k] = v
		} else {
			if o.areParamsIdentical(k) {
				// if the responses are the same, we skip
				log.Printf("\nWe silently resolved the conflict with the response %q because the definition was identical.\n", k)
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
	if len(extResponses) == 0 {
		return nil
	}

	baseResponses := o.base.Spec.Components.Responses
	if len(baseResponses) == 0 {
		o.base.Spec.Components.Responses = extResponses
		return nil
	}

	for k, v := range extResponses {
		if _, ok := baseResponses[k]; !ok {
			baseResponses[k] = v
		} else {
			if o.areResponsesIdentical(k) {
				// if the params are the same, we skip
				log.Printf("\nWe silently resolved the conflict with the params %q because the definition was identical.\n", k)
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
	if len(extSchemas) == 0 {
		return nil
	}

	baseSchemas := o.base.Spec.Components.Schemas
	if len(baseSchemas) == 0 {
		o.base.Spec.Components.Schemas = extSchemas
		return nil
	}

	for k, schemaToMerge := range extSchemas {
		if _, ok := baseSchemas[k]; !ok {
			baseSchemas[k] = schemaToMerge
		} else {
			if o.areSchemaIdentical(k) {
				// if the schemas are the same, we skip
				log.Printf("\nWe silently resolved the conflict with the schemas %q because the definition was identical.\n", k)
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
	_, ok := o.result.Report.ParametersDiff.Modified[paramName]
	return !ok
}

func (o OasDiff) areResponsesIdentical(name string) bool {
	_, ok := o.result.Report.ResponsesDiff.Modified[name]
	return !ok
}

func (o OasDiff) areSchemaIdentical(name string) bool {
	_, ok := o.result.Report.SchemasDiff.Modified[name]
	return !ok
}

// arePathsIdenticalWithExcludeExtensions checks if the paths are identical excluding extension diffs across operations (e.g. x-xgen-soa-migration).
func (o OasDiff) arePathsIdenticalWithExcludeExtensions(name string) (bool, error) {
	// If the diff only has extensions diff, then we consider the paths to be identical
	customConfig := diff.NewConfig().WithExcludeElements([]string{"extensions"})
	result, err := o.GetDiffWithConfig(o.base, o.external, customConfig)
	if err != nil {
		return false, err
	}

	d := result.Report
	if d.Empty() || d.PathsDiff.Empty() {
		return true, nil
	}
	v, ok := d.PathsDiff.Modified[name]
	if ok {
		if v.Empty() {
			return true, nil
		}
	}

	return !ok, nil
}

type ByName []*openapi3.Tag

func (a ByName) Len() int           { return len(a) }
func (a ByName) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByName) Less(i, j int) bool { return a[i].Name < a[j].Name }
