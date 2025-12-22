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
	"log"
	"maps"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
)

// SchemasFilter removes unused #/components/schemas/.
type SchemasFilter struct {
	oas *openapi3.T
}

func (*SchemasFilter) ValidateMetadata() error {
	return nil
}

func (f *SchemasFilter) Apply() error {
	if f.oas.Paths == nil {
		return nil
	}

	if f.oas.Components == nil || f.oas.Components.Schemas == nil {
		return nil
	}

	for {
		oasSpecAsBytes, err := f.oas.MarshalJSON()
		if err != nil {
			return err
		}

		spec := string(oasSpecAsBytes)
		schemasToDelete := make([]string, 0)
		for k := range f.oas.Components.Schemas {
			ref := "#/components/schemas/" + k
			if !strings.Contains(spec, ref) {
				schemasToDelete = append(schemasToDelete, k)
			}
		}

		if len(schemasToDelete) == 0 {
			return nil
		}

		for _, schemaToDelete := range schemasToDelete {
			log.Printf("Deleting unused schema: %q", schemaToDelete)
			maps.DeleteFunc(f.oas.Components.Schemas, func(k string, _ *openapi3.SchemaRef) bool {
				return k == schemaToDelete
			})
		}
	}
}
