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

	openapi3 "github.com/getkin/kin-openapi/openapi3"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/require"
)

func TestFile_ScapeHtml(t *testing.T) {
	oasWithHtml := &openapi3.T{
		Info: &openapi3.Info{
			Description: `"<html><body><h1>Test</h1></body></html>`,
		},
	}

	fs := afero.NewMemMapFs()
	path := "test.json"
	err := Save(path, oasWithHtml, "json", fs)
	require.NoError(t, err)

	_, err = afero.ReadFile(fs, path)
	require.NoError(t, err)
	// require.Contains(t, string(output), "<html><body><h1>Test</h1></body></html>")
}
