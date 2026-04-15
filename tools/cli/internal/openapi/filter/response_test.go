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

func TestResponseFilter_Apply(t *testing.T) {
	testCases := []struct {
		name       string
		initSpec   *openapi3.T
		wantedSpec *openapi3.T
	}{
		unusedResponsesScenario(),
		usedResponsesInOperationScenario(),
		mixedResponsesScenario(),
		onlyUsedResponsesScenario(),
		nilComponentsResponseScenario(),
		nilResponsesScenario(),
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			f := &ResponseFilter{
				oas: tc.initSpec,
			}

			require.NoError(t, f.Apply())
			require.Equal(t, tc.wantedSpec, f.oas)
		})
	}
}

func unusedResponsesScenario() struct {
	name       string
	initSpec   *openapi3.T
	wantedSpec *openapi3.T
} {
	return struct {
		name       string
		initSpec   *openapi3.T
		wantedSpec *openapi3.T
	}{
		name: "Remove unused responses",
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
				Responses: map[string]*openapi3.ResponseRef{
					"UnusedResponse1": {
						Value: &openapi3.Response{
							Description: pointer.Get("Unused response 1"),
						},
					},
					"UnusedResponse2": {
						Value: &openapi3.Response{
							Description: pointer.Get("Unused response 2"),
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
				Responses: map[string]*openapi3.ResponseRef{},
			},
		},
	}
}

func usedResponsesInOperationScenario() struct {
	name       string
	initSpec   *openapi3.T
	wantedSpec *openapi3.T
} {
	initResponses := openapi3.NewResponses()
	initResponses.Set("200", &openapi3.ResponseRef{
		Ref: "#/components/responses/SuccessResponse",
	})
	initResponses.Set("404", &openapi3.ResponseRef{
		Ref: "#/components/responses/NotFoundResponse",
	})

	wantedResponses := openapi3.NewResponses()
	wantedResponses.Set("200", &openapi3.ResponseRef{
		Ref: "#/components/responses/SuccessResponse",
	})
	wantedResponses.Set("404", &openapi3.ResponseRef{
		Ref: "#/components/responses/NotFoundResponse",
	})

	return struct {
		name       string
		initSpec   *openapi3.T
		wantedSpec *openapi3.T
	}{
		name: "Keep responses used in operations",
		initSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperation",
					Responses:   initResponses,
				},
			})),
			Components: &openapi3.Components{
				Responses: map[string]*openapi3.ResponseRef{
					"SuccessResponse": {
						Value: &openapi3.Response{
							Description: pointer.Get("Success"),
						},
					},
					"NotFoundResponse": {
						Value: &openapi3.Response{
							Description: pointer.Get("Not Found"),
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
					Responses:   wantedResponses,
				},
			})),
			Components: &openapi3.Components{
				Responses: map[string]*openapi3.ResponseRef{
					"SuccessResponse": {
						Value: &openapi3.Response{
							Description: pointer.Get("Success"),
						},
					},
					"NotFoundResponse": {
						Value: &openapi3.Response{
							Description: pointer.Get("Not Found"),
						},
					},
				},
			},
		},
	}
}

func mixedResponsesScenario() struct {
	name       string
	initSpec   *openapi3.T
	wantedSpec *openapi3.T
} {
	initResponses := openapi3.NewResponses()
	initResponses.Set("200", &openapi3.ResponseRef{
		Ref: "#/components/responses/UsedResponse",
	})

	wantedResponses := openapi3.NewResponses()
	wantedResponses.Set("200", &openapi3.ResponseRef{
		Ref: "#/components/responses/UsedResponse",
	})

	return struct {
		name       string
		initSpec   *openapi3.T
		wantedSpec *openapi3.T
	}{
		name: "Remove only unused responses, keep used ones",
		initSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(openapi3.WithPath("/test", &openapi3.PathItem{
				Get: &openapi3.Operation{
					OperationID: "testOperation",
					Responses:   initResponses,
				},
			})),
			Components: &openapi3.Components{
				Responses: map[string]*openapi3.ResponseRef{
					"UsedResponse": {
						Value: &openapi3.Response{
							Description: pointer.Get("Used response"),
						},
					},
					"UnusedResponse1": {
						Value: &openapi3.Response{
							Description: pointer.Get("Unused response 1"),
						},
					},
					"UnusedResponse2": {
						Value: &openapi3.Response{
							Description: pointer.Get("Unused response 2"),
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
					Responses:   wantedResponses,
				},
			})),
			Components: &openapi3.Components{
				Responses: map[string]*openapi3.ResponseRef{
					"UsedResponse": {
						Value: &openapi3.Response{
							Description: pointer.Get("Used response"),
						},
					},
				},
			},
		},
	}
}

func onlyUsedResponsesScenario() struct {
	name       string
	initSpec   *openapi3.T
	wantedSpec *openapi3.T
} {
	initGetResponses := openapi3.NewResponses()
	initGetResponses.Set("200", &openapi3.ResponseRef{
		Ref: "#/components/responses/Response1",
	})

	initPostResponses := openapi3.NewResponses()
	initPostResponses.Set("201", &openapi3.ResponseRef{
		Ref: "#/components/responses/Response2",
	})

	wantedGetResponses := openapi3.NewResponses()
	wantedGetResponses.Set("200", &openapi3.ResponseRef{
		Ref: "#/components/responses/Response1",
	})

	wantedPostResponses := openapi3.NewResponses()
	wantedPostResponses.Set("201", &openapi3.ResponseRef{
		Ref: "#/components/responses/Response2",
	})

	return struct {
		name       string
		initSpec   *openapi3.T
		wantedSpec *openapi3.T
	}{
		name: "Do not remove any responses when all are used",
		initSpec: &openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Version: "1.0",
			},
			Paths: openapi3.NewPaths(
				openapi3.WithPath("/test", &openapi3.PathItem{
					Get: &openapi3.Operation{
						OperationID: "getTest",
						Responses:   initGetResponses,
					},
					Post: &openapi3.Operation{
						OperationID: "postTest",
						Responses:   initPostResponses,
					},
				}),
			),
			Components: &openapi3.Components{
				Responses: map[string]*openapi3.ResponseRef{
					"Response1": {
						Value: &openapi3.Response{
							Description: pointer.Get("Response 1"),
						},
					},
					"Response2": {
						Value: &openapi3.Response{
							Description: pointer.Get("Response 2"),
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
						Responses:   wantedGetResponses,
					},
					Post: &openapi3.Operation{
						OperationID: "postTest",
						Responses:   wantedPostResponses,
					},
				}),
			),
			Components: &openapi3.Components{
				Responses: map[string]*openapi3.ResponseRef{
					"Response1": {
						Value: &openapi3.Response{
							Description: pointer.Get("Response 1"),
						},
					},
					"Response2": {
						Value: &openapi3.Response{
							Description: pointer.Get("Response 2"),
						},
					},
				},
			},
		},
	}
}

func nilComponentsResponseScenario() struct {
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

func nilResponsesScenario() struct {
	name       string
	initSpec   *openapi3.T
	wantedSpec *openapi3.T
} {
	return struct {
		name       string
		initSpec   *openapi3.T
		wantedSpec *openapi3.T
	}{
		name: "Handle nil responses map gracefully",
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
				Responses: nil,
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
				Responses: nil,
			},
		},
	}
}
