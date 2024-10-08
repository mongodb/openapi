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

package openapi

import (
	"log"

	"github.com/getkin/kin-openapi/openapi3"
)

const (
	xgenSoaMigration = "x-xgen-soa-migration"
)

// shouldSkipConflict checks if the conflict should be skipped.
// The method goes through each path operation and performs the following checks:
// 1. Validates if both paths have same operations, if not, then it returns false.
// 2. If both paths have the same operations, then it checks if there is an x-xgen-soa-migration annotation.
// If there is no annotation, then it returns false.
func shouldSkipPathConflict(basePath, externalPath *openapi3.PathItem, basePathName string) bool {
	if basePath.Get != nil && externalPath.Get == nil || basePath.Get == nil && externalPath.Get != nil {
		return false
	}

	if basePath.Put != nil && externalPath.Put == nil || basePath.Put == nil && externalPath.Put != nil {
		return false
	}

	if basePath.Post != nil && externalPath.Post == nil || basePath.Post == nil && externalPath.Post != nil {
		return false
	}

	if basePath.Patch != nil && externalPath.Patch == nil || basePath.Patch == nil && externalPath.Patch != nil {
		return false
	}

	if basePath.Delete != nil && externalPath.Delete == nil || basePath.Delete == nil && externalPath.Delete != nil {
		return false
	}

	// now check if there is an x-xgen-soa-migration annotation in any of the operations, but if any of the operations
	// doesn't have, then we should not skip the conflict
	return allOperationsHaveExtension(basePath, basePathName, xgenSoaMigration)
}

// allMethodsHaveExtension checks if all the operations in the base pat have the given extension name.
func allOperationsHaveExtension(basePath *openapi3.PathItem, basePathName, extensionName string) bool {
	if basePath.Get != nil {
		if basePath.Get.Extensions == nil || basePath.Get.Extensions[extensionName] == nil {
			return false
		}
	}

	if basePath.Put != nil {
		if basePath.Put.Extensions == nil || basePath.Put.Extensions[extensionName] == nil {
			return false
		}
	}

	if basePath.Post != nil {
		if basePath.Post.Extensions == nil || basePath.Post.Extensions[extensionName] == nil {
			return false
		}
	}

	if basePath.Patch != nil {
		if basePath.Patch.Extensions == nil || basePath.Patch.Extensions[extensionName] == nil {
			return false
		}
	}

	if basePath.Delete != nil {
		if basePath.Delete.Extensions == nil || basePath.Delete.Extensions[extensionName] == nil {
			return false
		}
	}

	log.Println("Detected x-xgen-soa-migration annotation in all operations for path: ", basePathName)
	return true
}
