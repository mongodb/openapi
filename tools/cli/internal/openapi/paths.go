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
	"fmt"
	"log"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/tufin/oasdiff/diff"
)

//go:generate mockgen -destination=../openapi/mock_paths.go -package=openapi github.com/mongodb/openapi/tools/cli/internal/openapi NoExtensionDiff

const (
	xgenSoaMigration = "x-xgen-soa-migration"
	allowDocsDiff    = "allowDocsDiff"
)

// allOperationsHaveExtension checks if all the operations in the base path have the given extension name.
func allOperationsHaveExtension(basePath *openapi3.PathItem, basePathName, extensionName string) bool {
	if basePath.Operations() == nil || len(basePath.Operations()) == 0 {
		return false
	}

	if basePath.Get != nil {
		if result := getOperationExtensionWithName(basePath.Get, extensionName); result == nil {
			return false
		}
	}

	if basePath.Put != nil {
		if result := getOperationExtensionWithName(basePath.Put, extensionName); result == nil {
			return false
		}
	}

	if basePath.Post != nil {
		if result := getOperationExtensionWithName(basePath.Post, extensionName); result == nil {
			return false
		}
	}

	if basePath.Patch != nil {
		if result := getOperationExtensionWithName(basePath.Patch, extensionName); result == nil {
			return false
		}
	}

	if basePath.Delete != nil {
		if result := getOperationExtensionWithName(basePath.Delete, extensionName); result == nil {
			return false
		}
	}

	log.Printf("Detected %s annotation in all operations for path: %s\n", extensionName, basePathName)
	return true
}

func getOperationExtensionWithName(operation *openapi3.Operation, extensionName string) interface{} {
	if operation.Extensions == nil || operation.Extensions[extensionName] == nil {
		log.Printf("Operation %s does not have extension %q", operation.OperationID, extensionName)
		return nil
	}

	return operation.Extensions[extensionName]
}

func allOperationsAllowDocsDiff(basePath *openapi3.PathItem) bool {
	if basePath.Operations() == nil || len(basePath.Operations()) == 0 {
		return false
	}

	if basePath.Get != nil {
		prop := getOperationExtensionProperty(basePath.Get, xgenSoaMigration, allowDocsDiff)
		if prop != "true" {
			return false
		}
	}

	if basePath.Put != nil {
		prop := getOperationExtensionProperty(basePath.Put, xgenSoaMigration, allowDocsDiff)
		if prop != "true" {
			return false
		}
	}

	if basePath.Post != nil {
		prop := getOperationExtensionProperty(basePath.Post, xgenSoaMigration, allowDocsDiff)
		if prop != "true" {
			return false
		}
	}

	if basePath.Patch != nil {
		prop := getOperationExtensionProperty(basePath.Patch, xgenSoaMigration, allowDocsDiff)
		if prop != "true" {
			return false
		}
	}

	if basePath.Delete != nil {
		prop := getOperationExtensionProperty(basePath.Delete, xgenSoaMigration, allowDocsDiff)
		if prop != "true" {
			return false
		}
	}

	return true
}

func getOperationExtensionProperty(operation *openapi3.Operation, extensionName, extensionProperty string) string {
	if operation.Extensions == nil || operation.Extensions[extensionName] == nil {
		return ""
	}

	extension := operation.Extensions[extensionName]
	if extension == nil {
		return ""
	}

	value, ok := extension.(map[string]interface{})[extensionProperty].(string)
	if ok {
		return value
	}
	return ""
}

type NoExtensionDiff interface {
	GetPathDiffWithoutExtensions(base, external *openapi3.T) (*diff.Diff, error)
}

func GetPathDiffWithoutExtensions(base, external *openapi3.T) (*diff.Diff, error) {
	exclude := []string{"extensions"}
	customConfig := diff.NewConfig().WithExcludeElements(exclude)
	if base == nil || external == nil {
		return nil, fmt.Errorf("base or external spec is nil")
	}

	return diff.Get(customConfig, base, external)
}
