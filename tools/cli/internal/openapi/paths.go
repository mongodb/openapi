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
	allowDocsDiff    = "allowDocsDiff"
)

// allOperationsHaveExtension checks if all the operations in the base path have the given extension name.
func allOperationsHaveExtension(pathData *openapi3.PathItem, path, extensionName string) bool {
	if pathData.Operations() == nil || len(pathData.Operations()) == 0 {
		return false
	}

	if pathData.Get != nil {
		if result := getOperationExtensionWithName(pathData.Get, extensionName); result == nil {
			return false
		}
	}

	if pathData.Put != nil {
		if result := getOperationExtensionWithName(pathData.Put, extensionName); result == nil {
			return false
		}
	}

	if pathData.Post != nil {
		if result := getOperationExtensionWithName(pathData.Post, extensionName); result == nil {
			return false
		}
	}

	if pathData.Patch != nil {
		if result := getOperationExtensionWithName(pathData.Patch, extensionName); result == nil {
			return false
		}
	}

	if pathData.Delete != nil {
		if result := getOperationExtensionWithName(pathData.Delete, extensionName); result == nil {
			return false
		}
	}

	log.Printf("Detected %s annotation in all operations for path: %s\n", extensionName, path)
	return true
}

func getOperationExtensionWithName(operation *openapi3.Operation, extensionName string) interface{} {
	if operation.Extensions == nil || operation.Extensions[extensionName] == nil {
		log.Printf("Operation %s does not have extension %q", operation.OperationID, extensionName)
		return nil
	}

	return operation.Extensions[extensionName]
}

func allOperationsAllowDocsDiff(pathData *openapi3.PathItem) bool {
	if pathData.Operations() == nil || len(pathData.Operations()) == 0 {
		return false
	}

	if pathData.Get != nil {
		prop := getOperationExtensionProperty(pathData.Get, xgenSoaMigration, allowDocsDiff)
		if prop != "true" {
			return false
		}
	}

	if pathData.Put != nil {
		prop := getOperationExtensionProperty(pathData.Put, xgenSoaMigration, allowDocsDiff)
		if prop != "true" {
			return false
		}
	}

	if pathData.Post != nil {
		prop := getOperationExtensionProperty(pathData.Post, xgenSoaMigration, allowDocsDiff)
		if prop != "true" {
			return false
		}
	}

	if pathData.Patch != nil {
		prop := getOperationExtensionProperty(pathData.Patch, xgenSoaMigration, allowDocsDiff)
		if prop != "true" {
			return false
		}
	}

	if pathData.Delete != nil {
		prop := getOperationExtensionProperty(pathData.Delete, xgenSoaMigration, allowDocsDiff)
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
