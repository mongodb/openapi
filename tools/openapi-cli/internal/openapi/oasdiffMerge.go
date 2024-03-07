package openapi

import (
	"andreaangiolillo/openapi-cli/internal/openapi/errors"
	"fmt"
	"github.com/tufin/oasdiff/diff"
	"github.com/tufin/oasdiff/load"
	"os"
)

type OasDiffMerge struct {
	base     *load.SpecInfo
	external *load.SpecInfo
	config   *diff.Config
	specDiff *diff.Diff
}

func NewOasDiffMerge(base *load.SpecInfo) *OasDiffMerge {
	return &OasDiffMerge{
		base: base,
	}
}

func (o OasDiffMerge) mergeSpecIntoBase() error {
	if err := o.mergePaths(); err != nil {
		return err
	}

	if err := o.mergeTags(); err != nil {
		return err
	}

	if err := o.mergeComponents(); err != nil {
		return err
	}

	return nil
}

func (o OasDiffMerge) mergePaths() error {
	pathsToMerge := o.external.Spec.Paths
	basePaths := o.base.Spec.Paths
	for k, v := range pathsToMerge {
		if _, ok := basePaths[k]; !ok {
			basePaths[k] = v
		} else {
			return errors.PathConflictError{
				Entry: k,
			}
		}
	}

	o.base.Spec.Paths = basePaths
	return nil
}

func (o OasDiffMerge) mergeTags() error {
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

func (o OasDiffMerge) mergeComponents() error {
	if err := o.mergeParameters(); err != nil {
		return err
	}

	if err := o.mergeResponses(); err != nil {
		return err
	}

	if err := o.mergeSchemas(); err != nil {
		return err
	}

	return nil
}

func (o OasDiffMerge) mergeParameters() error {
	externalSpecParams := o.external.Spec.Components.Parameters
	baseParams := o.base.Spec.Components.Parameters
	for k, v := range externalSpecParams {
		if _, ok := baseParams[k]; !ok {
			baseParams[k] = v
		} else {
			if o.areParamsIdentical(k) {
				// if the responses are the same, we skip
				_, _ = fmt.Fprintf(os.Stderr, "We silently resolved the conflict with the response '%s' because the definition was identical.", k)
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

func (o OasDiffMerge) mergeResponses() error {
	extResponses := o.external.Spec.Components.Responses
	baseResponses := o.base.Spec.Components.Responses
	for k, v := range extResponses {
		if _, ok := baseResponses[k]; !ok {
			baseResponses[k] = v
		} else {
			if o.areParamsIdentical(k) {
				// if the params are the same, we skip
				_, _ = fmt.Fprintf(os.Stderr, "We silently resolved the conflict with the params '%s' because the definition was identical.", k)
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

func (o OasDiffMerge) mergeSchemas() error {
	extSchemas := o.external.Spec.Components.Schemas
	baseSchemas := o.base.Spec.Components.Schemas

	for k, schemaToMerge := range extSchemas {
		if _, ok := baseSchemas[k]; !ok {
			baseSchemas[k] = schemaToMerge
		} else {
			if o.areSchemaIdentical(k) {
				// if the schemas are the same, we skip
				_, _ = fmt.Fprintf(os.Stderr, "We silently resolved the conflict with the schemas '%s' because the definition was identical.", k)
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

func (o OasDiffMerge) areParamsIdentical(paramName string) bool {
	if _, ok := o.specDiff.ParametersDiff.Modified[paramName]; !ok {
		return true
	}

	return false
}

func (o OasDiffMerge) areResponsesIdentical(name string) bool {
	if _, ok := o.specDiff.ResponsesDiff.Modified[name]; !ok {
		return true
	}

	return false
}

func (o OasDiffMerge) areSchemaIdentical(name string) bool {
	if _, ok := o.specDiff.SchemasDiff.Modified[name]; !ok {
		return true
	}

	return false
}
