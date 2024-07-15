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
	"github.com/mongodb/openapi/tools/cli/internal/apiversion"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestInfoFilter(t *testing.T) {
	targetVersion, err := apiversion.New(apiversion.WithVersion("2023-01-01"))
	require.NoError(t, err)

	filter := &InfoFilter{}
	metadata := NewMetadata(targetVersion, "test")

	oas := &openapi3.T{
		Info: &openapi3.Info{
			Description: "to manage all components in MongoDB Atlas.\n\n" +
				"The Atlas Administration API uses HTTP Digest Authentication to authenticate requests. " +
				"Provide a programmatic API public key and corresponding private key as the username and password " +
				"when constructing the HTTP request. For example, to [return database access history]" +
				"(#tag/Access-Tracking/operation/listAccessLogsByClusterName) with [cURL](https://en.wikipedia.org/wiki/CURL), " +
				"run the following command in the terminal:\n\n```\ncurl --user \"{PUBLIC-KEY}:{PRIVATE-KEY}\" \\\n" +
				"  --digest \\\n  --header \"Accept: application/vnd.atlas.2025-30-05+json\" ",
		},
	}

	expectedDescription := "to manage all components in MongoDB Atlas.\n\n" +
		"The Atlas Administration API uses HTTP Digest Authentication to authenticate requests. " +
		"Provide a programmatic API public key and corresponding private key as the username and password " +
		"when constructing the HTTP request. For example, to [return database access history]" +
		"(#tag/Access-Tracking/operation/listAccessLogsByClusterName) with [cURL](https://en.wikipedia.org/wiki/CURL), " +
		"run the following command in the terminal:\n\n```\ncurl --user \"{PUBLIC-KEY}:{PRIVATE-KEY}\" \\\n" +
		"  --digest \\\n  --header \"Accept: application/vnd.atlas.2023-01-01+json\" "

	require.NoError(t, filter.Apply(oas, metadata))
	assert.Contains(t, oas.Info.Description, expectedDescription)
}
