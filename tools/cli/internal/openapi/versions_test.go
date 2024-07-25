// Copyright 2024 MongoDB Inc
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
package openapi

import (
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestVersions(t *testing.T) {
	versions, err := ExtractVersionsWithEnv(NewVersionedResponses(t), "prod")
	require.NoError(t, err)
	assert.Equal(t, []string{"2023-01-01", "2023-02-01"}, versions)
}

func NewVersionedResponses(t *testing.T) *openapi3.T {
	t.Helper()
	inputPath := &openapi3.Paths{}

	extension := map[string]interface{}{
		"x-xgen-version": "2023-01-01",
	}
	response := &openapi3.ResponseRef{
		Value: &openapi3.Response{
			Extensions: extension,
			Content: map[string]*openapi3.MediaType{
				"application/vnd.atlas.2023-01-01+json": {},
			},
		},
	}

	responses := &openapi3.Responses{}
	responses.Set("200", response)

	inputPath.Set("pathBase1", &openapi3.PathItem{
		Extensions:  nil,
		Ref:         "",
		Summary:     "pathBase1",
		Description: "pathBase1Description",
		Get: &openapi3.Operation{
			Tags:      []string{"tag1"},
			Responses: responses,
		},
	})

	extensionTwo := map[string]interface{}{
		"x-xgen-version": "2023-02-01",
	}

	responseTwo := &openapi3.ResponseRef{
		Value: &openapi3.Response{
			Extensions: extensionTwo,
			Content: map[string]*openapi3.MediaType{
				"application/vnd.atlas.2023-02-01+json": {},
			},
		},
	}
	responsesTwo := &openapi3.Responses{}
	responsesTwo.Set("200", responseTwo)

	inputPath.Set("pathBase2", &openapi3.PathItem{
		Extensions:  nil,
		Ref:         "",
		Summary:     "pathBase2",
		Description: "pathBase2Description",
		Put: &openapi3.Operation{
			Tags:      []string{"tag1"},
			Responses: responsesTwo,
		},
	})

	oas := &openapi3.T{
		Paths: inputPath,
	}

	return oas
}
