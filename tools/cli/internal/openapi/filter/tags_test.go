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
package filter

import (
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/require"
)

func TestTagsApply_Unused(t *testing.T) {
	f := &TagsFilter{
		oas: &openapi3.T{
			Tags: []*openapi3.Tag{
				{
					Name: "tag1",
				},
				{
					Name: "tag2",
				},
			},
		},
	}

	require.NoError(t, f.Apply())
	require.Empty(t, f.oas.Tags)
}

func TestTagsApply_Used(t *testing.T) {

	path := &openapi3.PathItem{
		Get: &openapi3.Operation{
			Tags: []string{"tag1"},
		},
	}

	paths := openapi3.Paths{}
	paths.Set("/path", path)

	oas := &openapi3.T{
		Paths: &paths,
		Tags: []*openapi3.Tag{
			{
				Name: "tag1",
			},
			{
				Name: "tag2",
			},
		},
	}

	f := &TagsFilter{
		oas: oas,
	}

	require.NoError(t, f.Apply())
	require.Len(t, f.oas.Tags, 1)
	require.Equal(t, "tag1", f.oas.Tags[0].Name)
}
