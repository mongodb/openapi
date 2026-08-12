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

package merge

import (
	"github.com/mongodb/openapi/tools/foas/openapi"
)

const (
	longRunningOperationExtension = "x-xgen-long-running-operation"
	acceptedStatusCode            = "202"
)

// longRunningOperation is the value of the longRunningOperationExtension extension. The YAML
// output is derived from the JSON encoding, so the json tag defines the shape in both formats.
type longRunningOperation struct {
	// Legacy marks a 202 that does not follow the IPA-132 long-running operation contract.
	Legacy bool `json:"legacy"`
}

// legacyLongRunningOperationIDs is a hardcoded list of the operations returning HTTP 202 that
// predate IPA-132 and do not follow the long-running operation contract.
var legacyLongRunningOperationIDs = map[string]struct{}{
	"acceptGroupStreamVpcPeeringConnection":      {},
	"createGroupClusterIndexRollingIndex":        {},
	"createGroupCustomDbRoleRole":                {},
	"createGroupEncryptionAtRestPrivateEndpoint": {},
	"createOrgBillingCostExplorerUsageProcess":   {},
	"cutoverGroupLiveMigration":                  {},
	"deleteGroupCluster":                         {},
	"deleteGroupClusterOverloadSimulation":       {},
	"deleteGroupPeer":                            {},
	"deleteGroupStreamConnection":                {},
	"deleteGroupStreamPrivateLinkConnection":     {},
	"deleteGroupStreamVpcPeeringConnection":      {},
	"deleteGroupStreamWorkspace":                 {},
	"deleteGroupUserSecurityLdapUserToDnMapping": {},
	"disableGroupUserSecurityCustomerX509":       {},
	"rejectGroupStreamVpcPeeringConnection":      {},
	"updateGroupUserSecurity":                    {},
}

func isLegacyLongRunningOperation(operationID string) bool {
	_, legacy := legacyLongRunningOperationIDs[operationID]
	return legacy
}

// tagLongRunningOperations sets longRunningOperationExtension on every operation that returns
// HTTP 202 and removes it from every operation that does not.
func tagLongRunningOperations(spec *openapi.Spec) {
	if spec == nil || spec.Paths == nil {
		return
	}

	for _, pathItem := range spec.Paths.Map() {
		if pathItem == nil {
			continue
		}

		for _, operation := range pathItem.Operations() {
			if operation == nil {
				continue
			}

			if operation.Responses == nil || operation.Responses.Value(acceptedStatusCode) == nil {
				delete(operation.Extensions, longRunningOperationExtension)
				continue
			}

			if operation.Extensions == nil {
				operation.Extensions = map[string]any{}
			}

			operation.Extensions[longRunningOperationExtension] = longRunningOperation{
				Legacy: isLegacyLongRunningOperation(operation.OperationID),
			}
		}
	}
}
