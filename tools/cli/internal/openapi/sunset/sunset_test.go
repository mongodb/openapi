package sunset

import (
	"testing"

	"github.com/oasdiff/kin-openapi/openapi3"
	"github.com/oasdiff/oasdiff/load"
	"github.com/stretchr/testify/assert"
)

func TestNewSunsetListFromSpec(t *testing.T) {
	tests := []struct {
		name     string
		specInfo *load.SpecInfo
		expected []*Sunset
	}{
		{
			name: "Single operation with sunset and version extensions",
			specInfo: &load.SpecInfo{
				Spec: &openapi3.T{
					Paths: openapi3.NewPaths(openapi3.WithPath("/example", &openapi3.PathItem{
						Get: &openapi3.Operation{
							Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
								Content: openapi3.Content{
									"application/json": &openapi3.MediaType{
										Extensions: map[string]any{
											sunsetExtensionName:     "2025-12-31",
											apiVersionExtensionName: "v1.0",
										},
									},
								},
							})),
						},
					})),
				},
			},
			expected: []*Sunset{
				{
					Operation:  "GET",
					Path:       "/example",
					Version:    "v1.0",
					SunsetDate: "2025-12-31",
				},
			},
		},
		{
			name: "No extensions in response",
			specInfo: &load.SpecInfo{
				Spec: &openapi3.T{
					Paths: openapi3.NewPaths(openapi3.WithPath("/example", &openapi3.PathItem{
						Get: &openapi3.Operation{
							Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
								Content: openapi3.Content{
									"application/json": &openapi3.MediaType{},
								},
							})),
						},
					})),
				},
			},
			expected: nil,
		},
		{
			name: "No matching 2xx response",
			specInfo: &load.SpecInfo{
				Spec: &openapi3.T{
					Paths: openapi3.NewPaths(openapi3.WithPath("/example", &openapi3.PathItem{
						Get: &openapi3.Operation{
							Responses: openapi3.NewResponses(openapi3.WithName("404", &openapi3.Response{})),
						},
					})),
				},
			},
			expected: nil,
		},
		{
			name: "Multiple versions with sunset extensions",
			specInfo: &load.SpecInfo{
				Spec: &openapi3.T{
					Paths: openapi3.NewPaths(openapi3.WithPath("/example", &openapi3.PathItem{
						Get: &openapi3.Operation{
							Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
								Content: openapi3.Content{
									"application/vnd.atlas.2023-01-01+json": &openapi3.MediaType{
										Extensions: map[string]any{
											sunsetExtensionName:     "2025-12-31",
											apiVersionExtensionName: "2023-01-01",
										},
									},
									"application/vnd.atlas.2024-05-01+json": &openapi3.MediaType{
										Extensions: map[string]any{
											sunsetExtensionName:     "2025-06-01",
											apiVersionExtensionName: "2024-05-01",
										},
									},
								},
							})),
						},
					})),
				},
			},
			expected: []*Sunset{
				{
					Operation:  "GET",
					Path:       "/example",
					Version:    "2023-01-01",
					SunsetDate: "2025-12-31",
				},
				{
					Operation:  "GET",
					Path:       "/example",
					Version:    "2024-05-01",
					SunsetDate: "2025-06-01",
				},
			},
		},
		{
			name: "201 operations with extensions",
			specInfo: &load.SpecInfo{
				Spec: &openapi3.T{
					Paths: openapi3.NewPaths(
						openapi3.WithPath("/example1", &openapi3.PathItem{
							Get: &openapi3.Operation{
								Responses: openapi3.NewResponses(openapi3.WithName("201", &openapi3.Response{
									Content: openapi3.Content{
										"application/json": &openapi3.MediaType{
											Extensions: map[string]any{
												sunsetExtensionName:     "2024-06-15",
												apiVersionExtensionName: "v2.0",
											},
										},
									},
								})),
							},
						}),
					),
				},
			},
			expected: []*Sunset{
				{
					Operation:  "GET",
					Path:       "/example1",
					Version:    "v2.0",
					SunsetDate: "2024-06-15",
				},
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := NewListFromSpec(test.specInfo)
			assert.ElementsMatch(t, test.expected, result)
		})
	}
}

func TestNewExtensionsFrom2xxResponse(t *testing.T) {
	tests := []struct {
		name         string
		responsesMap map[string]*openapi3.ResponseRef
		expected     []map[string]any
	}{
		{
			name: "Valid 200 response with extensions",
			responsesMap: map[string]*openapi3.ResponseRef{
				"200": {
					Value: &openapi3.Response{
						Content: openapi3.Content{
							"application/json": &openapi3.MediaType{
								Extensions: map[string]any{
									sunsetExtensionName:     "2025-12-31",
									apiVersionExtensionName: "v1.0",
								},
							},
						},
					},
				},
			},
			expected: []map[string]any{
				{
					sunsetExtensionName:     "2025-12-31",
					apiVersionExtensionName: "v1.0",
				},
			},
		},
		{
			name: "No matching response",
			responsesMap: map[string]*openapi3.ResponseRef{
				"404": {
					Value: &openapi3.Response{},
				},
			},
			expected: nil,
		},
		{
			name: "Content entry without sunset extension is skipped",
			responsesMap: map[string]*openapi3.ResponseRef{
				"200": {
					Value: &openapi3.Response{
						Content: openapi3.Content{
							"application/vnd.atlas.2023-01-01+json": &openapi3.MediaType{
								Extensions: map[string]any{
									sunsetExtensionName:     "2025-12-31",
									apiVersionExtensionName: "2023-01-01",
								},
							},
							"application/vnd.atlas.2024-05-01+json": &openapi3.MediaType{
								Extensions: map[string]any{
									apiVersionExtensionName: "2024-05-01",
								},
							},
						},
					},
				},
			},
			expected: []map[string]any{
				{
					sunsetExtensionName:     "2025-12-31",
					apiVersionExtensionName: "2023-01-01",
				},
			},
		},
		{
			name: "Empty extensions for 2xx response",
			responsesMap: map[string]*openapi3.ResponseRef{
				"200": {
					Value: &openapi3.Response{
						Content: openapi3.Content{
							"application/json": &openapi3.MediaType{},
						},
					},
				},
			},
			expected: nil,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := successResponseExtensions(test.responsesMap)
			assert.Equal(t, test.expected, result)
		})
	}
}
