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

package merge

import (
	"encoding/json"
	"fmt"

	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/mongodb/openapi/tools/foas/openapi"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
)

// legacyLongRunningOperationIDs lists the operations that return HTTP 202 but predate IPA-132:
// they do not follow the long-running operation contract (no Location header, no /operations
// polling endpoint), so downstream tooling must not treat them as standard long-running operations.
// This hardcoded denylist is an intentional short-term solution until tagging can be derived from
// the IPA-132 prerequisites themselves.
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

type Opts struct {
	Merger              openapi.Merger
	fs                  afero.Fs
	excludePrivatePaths bool
	basePath            string
	outputPath          string
	format              string
	gitSha              string
	externalPaths       []string
}

func (o *Opts) Run() error {
	federated, err := o.Merger.MergeOpenAPISpecs(o.externalPaths)
	if err != nil {
		return err
	}

	for _, pathItem := range federated.Paths.Map() {
		for _, operation := range pathItem.Operations() {
			_, isLegacy := legacyLongRunningOperationIDs[operation.OperationID]
			if isLegacy || operation.Responses.Value("202") == nil {
				continue
			}
			if operation.Extensions == nil {
				operation.Extensions = map[string]any{}
			}
			operation.Extensions["x-xgen-long-running-operation"] = true
		}
	}

	if o.gitSha != "" {
		federated.Info.Extensions = map[string]any{
			"x-xgen-sha": o.gitSha,
		}
	}

	federatedBytes, err := json.MarshalIndent(*federated, "", "  ")
	if err != nil {
		return err
	}

	if o.outputPath == "" {
		fmt.Println(string(federatedBytes))
		return nil
	}

	return openapi.SaveToFile(o.outputPath, o.format, federated, o.fs)
}

func (o *Opts) PreRunE(_ []string) error {
	if o.basePath == "" {
		return fmt.Errorf("no base OAS detected. Please, use the flag %s to include the base OAS", flag.Base)
	}

	if o.externalPaths == nil {
		return fmt.Errorf("no external OAS detected. Please, use the flag %s to include at least one OAS", flag.External)
	}

	if err := openapi.ValidateFormatAndOutput(o.format, o.outputPath); err != nil {
		return err
	}

	m, err := openapi.NewOasDiff(o.basePath, o.excludePrivatePaths)
	o.Merger = m
	return err
}

// Builder builds the merge command with the following signature:
// merge -b base-oas -e external-oas-1 -e external-oas-2.
func Builder() *cobra.Command {
	opts := &Opts{
		fs: afero.NewOsFs(),
	}

	cmd := &cobra.Command{
		Use:   "merge -b base-spec [-e spec]...",
		Short: "Merge Open API specifications into a base spec.",
		Args:  cobra.NoArgs,
		PreRunE: func(_ *cobra.Command, args []string) error {
			return opts.PreRunE(args)
		},
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.basePath, flag.Base, flag.BaseShort, "", usage.Base)
	cmd.Flags().StringArrayVarP(&opts.externalPaths, flag.External, flag.ExternalShort, nil, usage.External)
	cmd.Flags().StringVar(&opts.gitSha, flag.GitSha, "", usage.GitSha)
	cmd.Flags().BoolVarP(&opts.excludePrivatePaths, flag.ExcludePrivatePaths, flag.ExcludePrivatePathsShort, false, usage.ExcludePrivatePaths)
	cmd.Flags().StringVarP(&opts.outputPath, flag.Output, flag.OutputShort, "", usage.Output)
	cmd.Flags().StringVarP(&opts.format, flag.Format, flag.FormatShort, openapi.JSON, usage.Format)

	_ = cmd.MarkFlagRequired(flag.Base)
	_ = cmd.MarkFlagRequired(flag.External)

	return cmd
}
