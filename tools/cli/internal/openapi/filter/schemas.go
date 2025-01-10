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
	"encoding/json"
	"fmt"
	"github.com/getkin/kin-openapi/openapi3"
	"strings"
)

// SchemasFilter removes tags that are not used in the operations.
type SchemasFilter struct {
	oas *openapi3.T
}

func (f *SchemasFilter) Apply() error {
	if f.oas.Paths == nil {
		return nil
	}

	usedRefs := map[string]bool{}
	allRefs := findRefs(f.oas)

	// Extract unique references used in the OpenAPI document
	for ref := range allRefs {
		refParts := strings.Split(ref, "/")
		if len(refParts) >= 4 && refParts[1] == "components" && refParts[2] == "schemas" {
			usedRefs[refParts[3]] = true
		}
	}

	res2B, _ := json.Marshal(usedRefs)
	fmt.Println("ANDREA:")
	fmt.Println(string(res2B))

	filterComponentSchemasInRefs(f.oas, usedRefs)
	return nil
}

// findRefs returns all the ref included in an openapi spec
func findRefs(oas *openapi3.T) map[string]bool {
	if oas == nil {
		return nil
	}

	refs := map[string]bool{}
	for _, v := range oas.Paths.Map() {
		refs[v.Ref] = true
		for _, op := range v.Operations() {
			for _, param := range op.Parameters {
				refs[param.Ref] = true
			}

			if op.RequestBody != nil {
				refs[op.RequestBody.Ref] = true
			}

			for _, resp := range op.Responses.Map() {
				refs[resp.Ref] = true

				for _, content := range resp.Value.Content {
					if content.Schema != nil {
						refs[content.Schema.Ref] = true
					}
				}
			}
		}

	}

	return refs
}

func filterComponentSchemasInRefs(oas *openapi3.T, usedRefs map[string]bool) {
	schemasToDelete := make([]string, 0)
	for k, v := range oas.Components.Schemas {
		fmt.Printf("k: %s, v: %v", k, v)
		if ok := usedRefs[k]; !ok {
			schemasToDelete = append(schemasToDelete, k)
		}
	}

	for _, schemaToDelete := range schemasToDelete {
		delete(oas.Components.Schemas, schemaToDelete)
	}
}
