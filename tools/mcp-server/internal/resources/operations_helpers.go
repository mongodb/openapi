package resources

import (
	"fmt"
	"sort"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/pkg/apiversion"
)

// availableVersions classifies content types from the given content maps into stable versions,
// preview/upcoming flags, and a parsed version map reused by filterVersionedContent.
func availableVersions(contents ...openapi3.Content) (
	stable []string, hasPreview, hasUpcoming bool, parsedVersions map[string]*apiversion.APIVersion,
) {
	stable = []string{}
	parsedVersions = make(map[string]*apiversion.APIVersion)
	seen := make(map[string]bool)
	for _, content := range contents {
		for contentType, mediaType := range content {
			version, err := apiversion.ParseVersionFromContentType(contentType, mediaType)
			if err != nil {
				continue
			}
			parsedVersions[contentType] = version
			switch {
			case version.IsPreview():
				hasPreview = true
			case version.IsUpcoming():
				hasUpcoming = true
			default:
				versionStr := version.String()
				if !seen[versionStr] {
					seen[versionStr] = true
					stable = append(stable, versionStr)
				}
			}
		}
	}
	sort.Strings(stable)
	return
}

// filterVersionedContent filters a content map to entries matching versionFilter, sorted by content type.
func filterVersionedContent(
	content openapi3.Content, parsedVersions map[string]*apiversion.APIVersion, versionFilter, targetVersion string,
) []ContentEntry {
	result := []ContentEntry{}
	for contentType, mediaType := range content {
		version, ok := parsedVersions[contentType]
		if !ok {
			continue
		}
		var matched bool
		switch versionFilter {
		case "all":
			matched = true
		case apiversion.PreviewStabilityLevel:
			matched = version.IsPreview()
		case apiversion.UpcomingStabilityLevel:
			matched = version.IsUpcoming()
		default:
			matched = targetVersion == "" || version.String() == targetVersion
		}
		if matched {
			result = append(result, ContentEntry{ContentType: contentType, Version: version.String(), Schema: mediaType.Schema})
		}
	}
	sort.Slice(result, func(i, j int) bool { return result[i].ContentType < result[j].ContentType })
	return result
}

// resolveTargetVersion resolves versionFilter to the exact date string used for content filtering.
// Returns an error if versionFilter is a specific date not present in stable.
func resolveTargetVersion(versionFilter string, stable []string, latestStable string) (string, error) {
	switch versionFilter {
	case "latest", "":
		return latestStable, nil
	case "all", apiversion.PreviewStabilityLevel, apiversion.UpcomingStabilityLevel:
		return "", nil
	default:
		i := sort.SearchStrings(stable, versionFilter)
		if i >= len(stable) || stable[i] != versionFilter {
			return "", fmt.Errorf("version %q not found: available versions are [%s]", versionFilter, strings.Join(stable, ", "))
		}
		return versionFilter, nil
	}
}

func buildParameters(op *openapi3.Operation) []OperationParam {
	params := []OperationParam{}
	for _, pRef := range op.Parameters {
		if pRef == nil || pRef.Value == nil {
			continue
		}
		p := pRef.Value
		params = append(params, OperationParam{
			Name:        p.Name,
			In:          p.In,
			Description: p.Description,
			Required:    p.Required,
		})
	}
	return params
}

// rawContentEntries returns content entries as-is, without version filtering.
// Used for non-200 responses that do not participate in versioning.
func rawContentEntries(content openapi3.Content) []ContentEntry {
	result := make([]ContentEntry, 0, len(content))
	for contentType, mediaType := range content {
		result = append(result, ContentEntry{ContentType: contentType, Schema: mediaType.Schema})
	}
	sort.Slice(result, func(i, j int) bool { return result[i].ContentType < result[j].ContentType })
	return result
}

// buildResponses returns all responses sorted by status code.
// The 200 response is version-filtered; all others are included as-is.
func buildResponses(
	op *openapi3.Operation, successContent openapi3.Content,
	parsedVersions map[string]*apiversion.APIVersion, versionFilter, targetVersion string,
) []OperationResponseDetail {
	responses := []OperationResponseDetail{}
	if op.Responses == nil {
		return responses
	}
	codes := make([]string, 0, op.Responses.Len())
	for code := range op.Responses.Map() {
		codes = append(codes, code)
	}
	sort.Strings(codes)
	for _, code := range codes {
		ref := op.Responses.Value(code)
		if ref == nil || ref.Value == nil {
			continue
		}
		desc := ""
		if ref.Value.Description != nil {
			desc = *ref.Value.Description
		}
		var content []ContentEntry
		if code == "200" {
			content = filterVersionedContent(successContent, parsedVersions, versionFilter, targetVersion)
		} else {
			content = rawContentEntries(ref.Value.Content)
		}
		responses = append(responses, OperationResponseDetail{StatusCode: code, Description: desc, Content: content})
	}
	return responses
}

func buildOperationDetail(op *openapi3.Operation, method, path, versionFilter string) (OperationDetail, error) {
	var successContent openapi3.Content
	if op.Responses != nil {
		if ref := op.Responses.Value("200"); ref != nil && ref.Value != nil {
			successContent = ref.Value.Content
		}
	}
	var rbContent openapi3.Content
	if op.RequestBody != nil && op.RequestBody.Value != nil {
		rbContent = op.RequestBody.Value.Content
	}

	stable, hasPreview, hasUpcoming, parsedVersions := availableVersions(successContent, rbContent)
	latestStable := ""
	if len(stable) > 0 {
		latestStable = stable[len(stable)-1]
	}

	targetVersion, err := resolveTargetVersion(versionFilter, stable, latestStable)
	if err != nil {
		return OperationDetail{}, err
	}

	var reqBody *RequestBodyDetail
	if rbContent != nil {
		reqBody = &RequestBodyDetail{
			Required: op.RequestBody.Value.Required,
			Content:  filterVersionedContent(rbContent, parsedVersions, versionFilter, targetVersion),
		}
	}
	return OperationDetail{
		OperationID:         op.OperationID,
		Method:              method,
		Path:                path,
		Summary:             op.Summary,
		Description:         op.Description,
		LatestStableVersion: latestStable,
		AvailableVersions:   stable,
		HasPreview:          hasPreview,
		HasUpcoming:         hasUpcoming,
		Parameters:          buildParameters(op),
		RequestBody:         reqBody,
		Responses:           buildResponses(op, successContent, parsedVersions, versionFilter, targetVersion),
	}, nil
}
