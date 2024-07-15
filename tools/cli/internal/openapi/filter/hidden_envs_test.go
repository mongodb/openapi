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

package filter

import (
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
)

func TestIsOperationHiddenForEnv(t *testing.T) {
	tests := []struct {
		name       string
		operation  *openapi3.Operation
		metadata   *Metadata
		wantHidden bool
	}{
		{
			name: "Hidden environment matches target environment",
			operation: &openapi3.Operation{
				Extensions: map[string]interface{}{
					hiddenEnvsExtensionName: map[string]interface{}{
						"envs": "prod",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: true,
		},
		{
			name: "Hidden environment matches target environment, multiple environments",
			operation: &openapi3.Operation{
				Extensions: map[string]interface{}{
					hiddenEnvsExtensionName: map[string]interface{}{
						"envs": "prod,dev,staging,prod",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "dev",
			},
			wantHidden: true,
		},
		{
			name: "Hidden environment does not match target environment",
			operation: &openapi3.Operation{
				Extensions: map[string]interface{}{
					hiddenEnvsExtensionName: map[string]interface{}{
						"envs": "staging",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
		{
			name: "Hidden environment does not match target environment, empty envs",
			operation: &openapi3.Operation{
				Extensions: map[string]interface{}{
					hiddenEnvsExtensionName: map[string]interface{}{
						"envs": "",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
		{
			name: "No hidden environment extension",
			operation: &openapi3.Operation{
				Extensions: map[string]interface{}{
					"other-extension": map[string]interface{}{
						"envs": "no",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filter := &HiddenEnvsFilter{}
			got := filter.isOperationHiddenForEnv(tt.operation, tt.metadata)
			if got != tt.wantHidden {
				t.Errorf("isOperationHiddenForEnv() = %v, want %v", got, tt.wantHidden)
			}
		})
	}
}

func TestIsRequestBodyHiddenForEnv(t *testing.T) {
	tests := []struct {
		name        string
		requestBody *openapi3.RequestBodyRef
		metadata    *Metadata
		wantHidden  bool
	}{
		{
			name: "Hidden environment matches target environment",
			requestBody: &openapi3.RequestBodyRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtensionName: map[string]interface{}{
						"envs": "prod",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: true,
		},
		{
			name: "Hidden environment matches target environment, multiple environments",
			requestBody: &openapi3.RequestBodyRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtensionName: map[string]interface{}{
						"envs": "prod,dev,staging,prod",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "dev",
			},
			wantHidden: true,
		},
		{
			name: "Hidden environment does not match target environment",
			requestBody: &openapi3.RequestBodyRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtensionName: map[string]interface{}{
						"envs": "staging",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
		{
			name: "Hidden environment does not match target environment, empty envs",
			requestBody: &openapi3.RequestBodyRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtensionName: map[string]interface{}{
						"envs": "",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
		{
			name: "No hidden environment extension",
			requestBody: &openapi3.RequestBodyRef{
				Extensions: map[string]interface{}{
					"other-extension": map[string]interface{}{
						"envs": "no",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filter := &HiddenEnvsFilter{}
			got := filter.isRequestBodyHiddenForEnv(tt.requestBody, tt.metadata)
			if got != tt.wantHidden {
				t.Errorf("isRequestBodyHiddenForEnv() = %v, want %v", got, tt.wantHidden)
			}
		})
	}
}

func TestIsResponseHiddenForEnv(t *testing.T) {
	tests := []struct {
		name       string
		response   *openapi3.ResponseRef
		metadata   *Metadata
		wantHidden bool
	}{
		{
			name: "Hidden environment matches target environment",
			response: &openapi3.ResponseRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtensionName: map[string]interface{}{
						"envs": "prod",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: true,
		},
		{
			name: "Hidden environment matches target environment, multiple environments",
			response: &openapi3.ResponseRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtensionName: map[string]interface{}{
						"envs": "prod,dev,staging,prod",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "dev",
			},
			wantHidden: true,
		},
		{
			name: "Hidden environment does not match target environment",
			response: &openapi3.ResponseRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtensionName: map[string]interface{}{
						"envs": "staging",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
		{
			name: "Hidden environment does not match target environment, empty envs",
			response: &openapi3.ResponseRef{
				Extensions: map[string]interface{}{
					hiddenEnvsExtensionName: map[string]interface{}{
						"envs": "",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
		{
			name: "No hidden environment extension",
			response: &openapi3.ResponseRef{
				Extensions: map[string]interface{}{
					"other-extension": map[string]interface{}{
						"envs": "no",
					},
				},
			},
			metadata: &Metadata{
				targetEnv: "prod",
			},
			wantHidden: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filter := &HiddenEnvsFilter{}
			got := filter.isResponseHiddenForEnv(tt.response, tt.metadata)
			if got != tt.wantHidden {
				t.Errorf("isResponseHiddenForEnv() = %v, want %v", got, tt.wantHidden)
			}
		})
	}
}
