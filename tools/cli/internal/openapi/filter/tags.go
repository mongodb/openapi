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
	"slices"

	"github.com/getkin/kin-openapi/openapi3"
)

// Filter: TagsFilter removes tags that are not used in the operations.
type TagsFilter struct {
	oas *openapi3.T
}

func (f *TagsFilter) Apply() error {
	if f.oas.Tags == nil {
		return nil
	}

	usedTags, err := f.getUsedTagNames()
	if err != nil {
		return err
	}

	newTags := []*openapi3.Tag{}
	for _, tag := range f.oas.Tags {
		if slices.Contains(usedTags, tag.Name) {
			newTags = append(newTags, tag)
		}
	}
	f.oas.Tags = newTags

	return nil
}

func (f *TagsFilter) getUsedTagNames() ([]string, error) {
	usedTags := []string{}
	for _, pathItem := range f.oas.Paths.Map() {
		for _, operation := range pathItem.Operations() {
			usedTags = append(usedTags, operation.Tags...)
		}
	}
	return usedTags, nil
}
