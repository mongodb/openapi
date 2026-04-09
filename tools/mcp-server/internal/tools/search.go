package tools

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
	"github.com/oasdiff/kin-openapi/openapi3"
)

// SearchParams are the parameters for the search tool.
type SearchParams struct {
	Alias         string   `json:"alias" jsonschema:"Alias of the spec to search"`
	Pattern       string   `json:"pattern" jsonschema:"Regular expression pattern to search for"`
	SearchIn      []string `json:"searchIn,omitempty" jsonschema:"Optional: categories to search"`
	CaseSensitive bool     `json:"caseSensitive,omitempty" jsonschema:"Optional: case-sensitive search"`
	Limit         int      `json:"limit,omitempty" jsonschema:"Optional: max results per category"`
}

// SearchResult is the result of a search operation.
type SearchResult struct {
	Success    bool               `json:"success"`
	Alias      string             `json:"alias"`
	Pattern    string             `json:"pattern"`
	Operations []OperationMatch   `json:"operations"`
	Schemas    []SchemaMatch      `json:"schemas"`
	Parameters []ParameterMatch   `json:"parameters"`
	Responses  []ResponseMatch    `json:"responses"`
	Tags       []TagMatch         `json:"tags"`
	Paths      []PathMatch        `json:"paths"`
	Pagination PaginationMetadata `json:"pagination"`
}

// PaginationMetadata contains pagination information.
type PaginationMetadata struct {
	Limit           int             `json:"limit"`
	TotalMatches    int             `json:"totalMatches"`
	CategoryCounts  map[string]int  `json:"categoryCounts"`
	CategoryHasMore map[string]bool `json:"categoryHasMore,omitempty"`
}

// OperationMatch represents a matched operation.
type OperationMatch struct {
	Path        string   `json:"path"`
	Method      string   `json:"method"`
	OperationID string   `json:"operationId,omitempty"`
	Summary     string   `json:"summary,omitempty"`
	Description string   `json:"description,omitempty"`
	Tags        []string `json:"tags,omitempty"`
	MatchedIn   []string `json:"matchedIn"`
	MatchedText string   `json:"matchedText"`
}

// SchemaMatch represents a matched schema.
type SchemaMatch struct {
	Name              string   `json:"name"`
	Description       string   `json:"description,omitempty"`
	MatchedIn         []string `json:"matchedIn"`
	MatchedText       string   `json:"matchedText"`
	MatchedProperties []string `json:"matchedProperties,omitempty"`
}

// ParameterMatch represents a matched parameter.
type ParameterMatch struct {
	Name        string   `json:"name"`
	In          string   `json:"in,omitempty"`
	Description string   `json:"description,omitempty"`
	MatchedIn   []string `json:"matchedIn"`
	MatchedText string   `json:"matchedText"`
}

// ResponseMatch represents a matched response.
type ResponseMatch struct {
	Name        string   `json:"name"`
	Description string   `json:"description,omitempty"`
	MatchedIn   []string `json:"matchedIn"`
	MatchedText string   `json:"matchedText"`
}

// TagMatch represents a matched tag.
type TagMatch struct {
	Name        string   `json:"name"`
	Description string   `json:"description,omitempty"`
	MatchedIn   []string `json:"matchedIn"`
	MatchedText string   `json:"matchedText"`
}

// PathMatch represents a matched path.
type PathMatch struct {
	Path        string   `json:"path"`
	MatchedIn   []string `json:"matchedIn"`
	MatchedText string   `json:"matchedText"`
}

// validSearchCategories defines the valid categories for searchIn parameter.
var validSearchCategories = map[string]bool{
	"operations": true,
	"schemas":    true,
	"parameters": true,
	"responses":  true,
	"tags":       true,
	"paths":      true,
}

// Helper methods for SearchResult

// totalCount returns the total number of matches across all categories.
func (r *SearchResult) totalCount() int {
	return len(r.Operations) + len(r.Schemas) + len(r.Parameters) +
		len(r.Responses) + len(r.Tags) + len(r.Paths)
}

// categoryCounts returns a map of category names to their match counts.
func (r *SearchResult) categoryCounts() map[string]int {
	return map[string]int{
		"operations": len(r.Operations),
		"schemas":    len(r.Schemas),
		"parameters": len(r.Parameters),
		"responses":  len(r.Responses),
		"tags":       len(r.Tags),
		"paths":      len(r.Paths),
	}
}

// Helper functions for matching

// checkAndRecordMatch checks if a value matches the regex and records the match.
func checkAndRecordMatch(re *regexp.Regexp, fieldName, value string, matchedIn, matchedTexts *[]string) {
	if value != "" && re.MatchString(value) {
		*matchedIn = append(*matchedIn, fieldName)
		*matchedTexts = append(*matchedTexts, re.FindString(value))
	}
}

// handleSearch searches for matches in an OpenAPI spec.
func handleSearch(reg *registry.Registry, params SearchParams) (SearchResult, error) {
	// Set defaults
	if params.Limit == 0 {
		params.Limit = 100
	}

	// Validate searchIn categories
	if len(params.SearchIn) > 0 {
		var invalidCategories []string
		for _, category := range params.SearchIn {
			if !validSearchCategories[category] {
				invalidCategories = append(invalidCategories, category)
			}
		}
		if len(invalidCategories) > 0 {
			return SearchResult{Success: false}, fmt.Errorf(
				"invalid searchIn categories: %v. Valid categories are: operations, schemas, parameters, responses, tags, paths",
				invalidCategories,
			)
		}
	}

	// Validate and compile regex
	var re *regexp.Regexp
	var err error
	if params.CaseSensitive {
		re, err = regexp.Compile(params.Pattern)
	} else {
		re, err = regexp.Compile("(?i)" + params.Pattern)
	}
	if err != nil {
		return SearchResult{Success: false}, fmt.Errorf("invalid regex pattern: %w", err)
	}

	// Get spec from registry
	entry, err := reg.GetByAlias(params.Alias)
	if err != nil {
		return SearchResult{Success: false}, err
	}

	// Determine what to search
	searchIn := params.SearchIn
	if len(searchIn) == 0 {
		searchIn = []string{"operations", "schemas", "parameters", "responses", "tags", "paths"}
	}

	// Perform search
	result := SearchResult{
		Success: true,
		Alias:   params.Alias,
		Pattern: params.Pattern,
	}

	for _, category := range searchIn {
		switch category {
		case "operations":
			result.Operations = searchOperations(entry.Spec, re)
		case "schemas":
			result.Schemas = searchSchemas(entry.Spec, re)
		case "parameters":
			result.Parameters = searchParameters(entry.Spec, re)
		case "responses":
			result.Responses = searchResponses(entry.Spec, re)
		case "tags":
			result.Tags = searchTags(entry.Spec, re)
		case "paths":
			result.Paths = searchPaths(entry.Spec, re)
		}
	}

	// Apply per-category pagination
	applyPagination(&result, params.Limit)

	return result, nil
}

// searchOperations searches for matches in operations.
func searchOperations(spec *openapi3.T, re *regexp.Regexp) []OperationMatch {
	var matches []OperationMatch

	if spec.Paths == nil {
		return matches
	}

	for path, pathItem := range spec.Paths.Map() {
		for method, operation := range pathItem.Operations() {
			match := OperationMatch{
				Path:        path,
				Method:      strings.ToUpper(method),
				OperationID: operation.OperationID,
				Summary:     operation.Summary,
				Description: operation.Description,
				Tags:        operation.Tags,
			}

			var matchedIn []string
			var matchedTexts []string

			// Search in various fields
			checkAndRecordMatch(re, "operationId", operation.OperationID, &matchedIn, &matchedTexts)
			checkAndRecordMatch(re, "summary", operation.Summary, &matchedIn, &matchedTexts)
			checkAndRecordMatch(re, "description", operation.Description, &matchedIn, &matchedTexts)

			// Search in tags
			for _, tag := range operation.Tags {
				if re.MatchString(tag) {
					matchedIn = append(matchedIn, "tags")
					matchedTexts = append(matchedTexts, re.FindString(tag))
					break
				}
			}

			if len(matchedIn) > 0 {
				match.MatchedIn = matchedIn
				match.MatchedText = strings.Join(matchedTexts, ", ")
				matches = append(matches, match)
			}
		}
	}

	return matches
}

// searchSchemas searches for matches in component schemas.
func searchSchemas(spec *openapi3.T, re *regexp.Regexp) []SchemaMatch {
	var matches []SchemaMatch

	if spec.Components == nil || spec.Components.Schemas == nil {
		return matches
	}

	for name, schemaRef := range spec.Components.Schemas {
		if schemaRef == nil || schemaRef.Value == nil {
			continue
		}

		schema := schemaRef.Value
		match := SchemaMatch{
			Name:        name,
			Description: schema.Description,
		}

		var matchedIn []string
		var matchedTexts []string
		var matchedProps []string

		// Search in schema name and description
		checkAndRecordMatch(re, "name", name, &matchedIn, &matchedTexts)
		checkAndRecordMatch(re, "description", schema.Description, &matchedIn, &matchedTexts)

		// Search in property names
		if schema.Properties != nil {
			for propName := range schema.Properties {
				if re.MatchString(propName) {
					matchedIn = append(matchedIn, "properties")
					matchedProps = append(matchedProps, propName)
					matchedTexts = append(matchedTexts, re.FindString(propName))
				}
			}
		}

		if len(matchedIn) > 0 {
			match.MatchedIn = matchedIn
			match.MatchedText = strings.Join(matchedTexts, ", ")
			if len(matchedProps) > 0 {
				match.MatchedProperties = matchedProps
			}
			matches = append(matches, match)
		}
	}

	return matches
}

// searchParameters searches for matches in component parameters.
func searchParameters(spec *openapi3.T, re *regexp.Regexp) []ParameterMatch {
	var matches []ParameterMatch

	if spec.Components == nil || spec.Components.Parameters == nil {
		return matches
	}

	for name, paramRef := range spec.Components.Parameters {
		if paramRef == nil || paramRef.Value == nil {
			continue
		}

		param := paramRef.Value
		match := ParameterMatch{
			Name:        param.Name,
			In:          param.In,
			Description: param.Description,
		}

		var matchedIn []string
		var matchedTexts []string

		// Search in parameter name (check both component name and param.Name)
		if re.MatchString(name) || re.MatchString(param.Name) {
			matchedIn = append(matchedIn, "name")
			matchedTexts = append(matchedTexts, re.FindString(param.Name))
		}

		// Search in description
		checkAndRecordMatch(re, "description", param.Description, &matchedIn, &matchedTexts)

		if len(matchedIn) > 0 {
			match.MatchedIn = matchedIn
			match.MatchedText = strings.Join(matchedTexts, ", ")
			matches = append(matches, match)
		}
	}

	return matches
}

// searchResponses searches for matches in component responses.
func searchResponses(spec *openapi3.T, re *regexp.Regexp) []ResponseMatch {
	var matches []ResponseMatch

	if spec.Components == nil || spec.Components.Responses == nil {
		return matches
	}

	for name, respRef := range spec.Components.Responses {
		if respRef == nil || respRef.Value == nil {
			continue
		}

		resp := respRef.Value
		description := ""
		if resp.Description != nil {
			description = *resp.Description
		}

		match := ResponseMatch{
			Name:        name,
			Description: description,
		}

		var matchedIn []string
		var matchedTexts []string

		// Search in response name and description
		checkAndRecordMatch(re, "name", name, &matchedIn, &matchedTexts)
		checkAndRecordMatch(re, "description", description, &matchedIn, &matchedTexts)

		if len(matchedIn) > 0 {
			match.MatchedIn = matchedIn
			match.MatchedText = strings.Join(matchedTexts, ", ")
			matches = append(matches, match)
		}
	}

	return matches
}

// searchTags searches for matches in tags.
func searchTags(spec *openapi3.T, re *regexp.Regexp) []TagMatch {
	var matches []TagMatch

	if spec.Tags == nil {
		return matches
	}

	for _, tag := range spec.Tags {
		match := TagMatch{
			Name:        tag.Name,
			Description: tag.Description,
		}

		var matchedIn []string
		var matchedTexts []string

		// Search in tag name and description
		checkAndRecordMatch(re, "name", tag.Name, &matchedIn, &matchedTexts)
		checkAndRecordMatch(re, "description", tag.Description, &matchedIn, &matchedTexts)

		if len(matchedIn) > 0 {
			match.MatchedIn = matchedIn
			match.MatchedText = strings.Join(matchedTexts, ", ")
			matches = append(matches, match)
		}
	}

	return matches
}

// searchPaths searches for matches in path patterns.
func searchPaths(spec *openapi3.T, re *regexp.Regexp) []PathMatch {
	var matches []PathMatch

	if spec.Paths == nil {
		return matches
	}

	for path := range spec.Paths.Map() {
		if re.MatchString(path) {
			match := PathMatch{
				Path:        path,
				MatchedIn:   []string{"path"},
				MatchedText: re.FindString(path),
			}
			matches = append(matches, match)
		}
	}

	return matches
}

// applyPagination applies per-category limit to search results.
func applyPagination(result *SearchResult, limit int) {
	// Store counts before truncation
	totalMatches := result.totalCount()
	categoryCounts := result.categoryCounts()
	categoryHasMore := make(map[string]bool)

	// Apply limit to each category
	if len(result.Operations) > limit {
		result.Operations = result.Operations[:limit]
		categoryHasMore["operations"] = true
	}
	if len(result.Schemas) > limit {
		result.Schemas = result.Schemas[:limit]
		categoryHasMore["schemas"] = true
	}
	if len(result.Parameters) > limit {
		result.Parameters = result.Parameters[:limit]
		categoryHasMore["parameters"] = true
	}
	if len(result.Responses) > limit {
		result.Responses = result.Responses[:limit]
		categoryHasMore["responses"] = true
	}
	if len(result.Tags) > limit {
		result.Tags = result.Tags[:limit]
		categoryHasMore["tags"] = true
	}
	if len(result.Paths) > limit {
		result.Paths = result.Paths[:limit]
		categoryHasMore["paths"] = true
	}

	// Build pagination metadata
	result.Pagination = PaginationMetadata{
		Limit:           limit,
		TotalMatches:    totalMatches,
		CategoryCounts:  categoryCounts,
		CategoryHasMore: categoryHasMore,
	}
}
