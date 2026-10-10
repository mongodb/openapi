// Copyright 2026 MongoDB Inc
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

package diff

import "strings"

func classifyChange(id string) (Component, ChangeType) {
	return componentFromID(id), changeTypeFromID(id)
}

func componentFromID(id string) Component {
	switch {
	case strings.Contains(id, "parameter"):
		return ComponentParameter
	case strings.Contains(id, "request-body"), strings.Contains(id, "request-property"):
		return ComponentRequestBody
	case strings.Contains(id, "response"):
		return ComponentResponse
	case strings.Contains(id, "schema"):
		return ComponentSchema
	default:
		return ComponentEndpoint
	}
}

func changeTypeFromID(id string) ChangeType {
	switch {
	case strings.Contains(id, "removed"):
		return ChangeTypeDeleted
	case strings.Contains(id, "added"):
		return ChangeTypeAdded
	default:
		return ChangeTypeModified
	}
}
