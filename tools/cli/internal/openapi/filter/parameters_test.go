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
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/pointer"
	"github.com/stretchr/testify/require"
)

func TestParametersFilter_Apply(t *testing.T) {
	testCases := []struct {
		name       string
		initSpec   *openapi3.T
		wantedSpec *openapi3.T
	}{
		unusedParametersScenario(),
		usedParametersInOperationScenario(),
		usedParametersAtPathLevelScenario(),
		mixedParametersScenario(),
		onlyUsedParametersScenario(),
		nilComponentsScenario(),
		nilParametersScenario(),
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			f := &ParametersFilter{
				oas: tc.initSpec,
			}

			require.NoError(t, f.Apply())
			require.Equal(t, tc.wantedSpec, f.oas)
		})
	}
}

func unusedParametersScenario() struct {
	name       string
	initSpec   *openapi3.T
	wantedSpec *openapi3.T
} {
	return struct {
		name       string
		initSpec   *openapi3.T
		wantedSpec *openapi3.T
	}{
		name: "Remove unused parameters",
		initSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperation",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Description: pointer.Get("Success"),
					})),
				},
			})),
			Components: &openapi3.Components{
				Parameters: map[string]*openapi3.ParameterRef{
					"UnusedParam1": {
						Value: &openapi3.Parameter{
							Name:     "unused1",
							In:       "query",
							Required: false,
							Schema: &openapi3.SchemaRef{
								Value: &openapi3.Schema{
									Type: &openapi3.Types{"string"},
								},
							},
						},
					},
					"UnusedParam2": {
						Value: &openapi3.Parameter{
							Name:     "unused2",
							In:       "header",
							Required: false,
							Schema: &openapi3.SchemaRef{
								Value: &openapi3.Schema{
									Type: &openapi3.Types{"integer"},
								},
							},
						},
					},
				},
			},
		},
		wantedSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperation",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Description: pointer.Get("Success"),
					})),
				},
			})),
			Components: &openapi3.Components{
				Parameters: map[string]*openapi3.ParameterRef{},
			},
		},
	}
}

func usedParametersInOperationScenario() struct {
	name       string
	initSpec   *openapi3.T
	wantedSpec *openapi3.T
} {
	return struct {
		name       string
		initSpec   *openapi3.T
		wantedSpec *openapi3.T
	}{
		name: "Keep parameters used in operations",
		initSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperation",
					Parameters: openapi3.Parameters{
						{
							Ref: "#/components/parameters/PageNum",
						},
					},
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Description: pointer.Get("Success"),
					})),
				},
			})),
			Components: &openapi3.Components{
				Parameters: map[string]*openapi3.ParameterRef{
					"PageNum": {
						Value: &openapi3.Parameter{
							Name:     "pageNum",
							In:       "query",
							Required: false,
							Schema: &openapi3.SchemaRef{
								Value: &openapi3.Schema{
									Type: &openapi3.Types{"integer"},
								},
							},
						},
					},
				},
			},
		},
		wantedSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperation",
					Parameters: openapi3.Parameters{
						{
							Ref: "#/components/parameters/PageNum",
						},
					},
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Description: pointer.Get("Success"),
					})),
				},
			})),
			Components: &openapi3.Components{
				Parameters: map[string]*openapi3.ParameterRef{
					"PageNum": {
						Value: &openapi3.Parameter{
							Name:     "pageNum",
							In:       "query",
							Required: false,
							Schema: &openapi3.SchemaRef{
								Value: &openapi3.Schema{
									Type: &openapi3.Types{"integer"},
								},
							},
						},
					},
				},
			},
		},
	}
}

func usedParametersAtPathLevelScenario() struct {
	name       string
	initSpec   *openapi3.T
	wantedSpec *openapi3.T
} {
	return struct {
		name       string
		initSpec   *openapi3.T
		wantedSpec *openapi3.T
	}{
		name: "Keep parameters used at path level",
		initSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("/test/{id}", &openapi3.PathItem{
				Parameters: openapi3.Parameters{
					{
						Ref: "#/components/parameters/PathId",
					},
				},
				Get: &openapi3.Operation{
					OperationID: "testOperation",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Description: pointer.Get("Success"),
					})),
				},
			})),
			Components: &openapi3.Components{
				Parameters: map[string]*openapi3.ParameterRef{
					"PathId": {
						Value: &openapi3.Parameter{
							Name:     "id",
							In:       "path",
							Required: true,
							Schema: &openapi3.SchemaRef{
								Value: &openapi3.Schema{
									Type: &openapi3.Types{"string"},
								},
							},
						},
					},
				},
			},
		},
		wantedSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("/test/{id}", &openapi3.PathItem{
				Parameters: openapi3.Parameters{
					{
						Ref: "#/components/parameters/PathId",
					},
				},
				Get: &openapi3.Operation{
					OperationID: "testOperation",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Description: pointer.Get("Success"),
					})),
				},
			})),
			Components: &openapi3.Components{
				Parameters: map[string]*openapi3.ParameterRef{
					"PathId": {
						Value: &openapi3.Parameter{
							Name:     "id",
							In:       "path",
							Required: true,
							Schema: &openapi3.SchemaRef{
								Value: &openapi3.Schema{
									Type: &openapi3.Types{"string"},
								},
							},
						},
					},
				},
			},
		},
	}
}

func mixedParametersScenario() struct {
	name       string
	initSpec   *openapi3.T
	wantedSpec *openapi3.T
} {
	return struct {
		name       string
		initSpec   *openapi3.T
		wantedSpec *openapi3.T
	}{
		name: "Remove only unused parameters, keep used ones",
		initSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperation",
					Parameters: openapi3.Parameters{
						{
							Ref: "#/components/parameters/UsedParam",
						},
					},
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Description: pointer.Get("Success"),
					})),
				},
			})),
			Components: &openapi3.Components{
				Parameters: map[string]*openapi3.ParameterRef{
					"UsedParam": {
						Value: &openapi3.Parameter{
							Name:     "used",
							In:       "query",
							Required: false,
							Schema: &openapi3.SchemaRef{
								Value: &openapi3.Schema{
									Type: &openapi3.Types{"string"},
								},
							},
						},
					},
					"UnusedParam1": {
						Value: &openapi3.Parameter{
							Name:     "unused1",
							In:       "query",
							Required: false,
							Schema: &openapi3.SchemaRef{
								Value: &openapi3.Schema{
									Type: &openapi3.Types{"string"},
								},
							},
						},
					},
					"UnusedParam2": {
						Value: &openapi3.Parameter{
							Name:     "unused2",
							In:       "header",
							Required: false,
							Schema: &openapi3.SchemaRef{
								Value: &openapi3.Schema{
									Type: &openapi3.Types{"integer"},
								},
							},
						},
					},
				},
			},
		},
		wantedSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperation",
					Parameters: openapi3.Parameters{
						{
							Ref: "#/components/parameters/UsedParam",
						},
					},
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Description: pointer.Get("Success"),
					})),
				},
			})),
			Components: &openapi3.Components{
				Parameters: map[string]*openapi3.ParameterRef{
					"UsedParam": {
						Value: &openapi3.Parameter{
							Name:     "used",
							In:       "query",
							Required: false,
							Schema: &openapi3.SchemaRef{
								Value: &openapi3.Schema{
									Type: &openapi3.Types{"string"},
								},
							},
						},
					},
				},
			},
		},
	}
}

func onlyUsedParametersScenario() struct {
	name       string
	initSpec   *openapi3.T
	wantedSpec *openapi3.T
} {
	return struct {
		name       string
		initSpec   *openapi3.T
		wantedSpec *openapi3.T
	}{
		name: "Do not remove any parameters when all are used",
		initSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(
				openapi3.WithPath("/test", &openapi3.PathItem{
					Get: &openapi3.Operation{
						OperationID: "getTest",
						Parameters: openapi3.Parameters{
							{
								Ref: "#/components/parameters/Param1",
							},
						},
						Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
							Description: pointer.Get("Success"),
						})),
					},
					Post: &openapi3.Operation{
						OperationID: "postTest",
						Parameters: openapi3.Parameters{
							{
								Ref: "#/components/parameters/Param2",
							},
						},
						Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
							Description: pointer.Get("Success"),
						})),
					},
				}),
			),
			Components: &openapi3.Components{
				Parameters: map[string]*openapi3.ParameterRef{
					"Param1": {
						Value: &openapi3.Parameter{
							Name:     "param1",
							In:       "query",
							Required: false,
							Schema: &openapi3.SchemaRef{
								Value: &openapi3.Schema{
									Type: &openapi3.Types{"string"},
								},
							},
						},
					},
					"Param2": {
						Value: &openapi3.Parameter{
							Name:     "param2",
							In:       "query",
							Required: false,
							Schema: &openapi3.SchemaRef{
								Value: &openapi3.Schema{
									Type: &openapi3.Types{"integer"},
								},
							},
						},
					},
				},
			},
		},
		wantedSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(
				openapi3.WithPath("/test", &openapi3.PathItem{
					Get: &openapi3.Operation{
						OperationID: "getTest",
						Parameters: openapi3.Parameters{
							{
								Ref: "#/components/parameters/Param1",
							},
						},
						Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
							Description: pointer.Get("Success"),
						})),
					},
					Post: &openapi3.Operation{
						OperationID: "postTest",
						Parameters: openapi3.Parameters{
							{
								Ref: "#/components/parameters/Param2",
							},
						},
						Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
							Description: pointer.Get("Success"),
						})),
					},
				}),
			),
			Components: &openapi3.Components{
				Parameters: map[string]*openapi3.ParameterRef{
					"Param1": {
						Value: &openapi3.Parameter{
							Name:     "param1",
							In:       "query",
							Required: false,
							Schema: &openapi3.SchemaRef{
								Value: &openapi3.Schema{
									Type: &openapi3.Types{"string"},
								},
							},
						},
					},
					"Param2": {
						Value: &openapi3.Parameter{
							Name:     "param2",
							In:       "query",
							Required: false,
							Schema: &openapi3.SchemaRef{
								Value: &openapi3.Schema{
									Type: &openapi3.Types{"integer"},
								},
							},
						},
					},
				},
			},
		},
	}
}

func nilComponentsScenario() struct {
	name       string
	initSpec   *openapi3.T
	wantedSpec *openapi3.T
} {
	return struct {
		name       string
		initSpec   *openapi3.T
		wantedSpec *openapi3.T
	}{
		name: "Handle nil components gracefully",
		initSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperation",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Description: pointer.Get("Success"),
					})),
				},
			})),
			Components: nil,
		},
		wantedSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperation",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Description: pointer.Get("Success"),
					})),
				},
			})),
			Components: nil,
		},
	}
}

func nilParametersScenario() struct {
	name       string
	initSpec   *openapi3.T
	wantedSpec *openapi3.T
} {
	return struct {
		name       string
		initSpec   *openapi3.T
		wantedSpec *openapi3.T
	}{
		name: "Handle nil parameters map gracefully",
		initSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperation",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Description: pointer.Get("Success"),
					})),
				},
			})),
			Components: &openapi3.Components{
				Parameters: nil,
			},
		},
		wantedSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperation",
					Responses: openapi3.NewResponses(openapi3.WithName("200", &openapi3.Response{
						Description: pointer.Get("Success"),
					})),
				},
			})),
			Components: &openapi3.Components{
				Parameters: nil,
			},
		},
	}
}
