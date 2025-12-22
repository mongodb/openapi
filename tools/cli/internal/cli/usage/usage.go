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

package usage

const (
	Base                = "Base OAS. The command will merge other OASes into it."
	External            = "OASes that will be merged into the base OAS."
	Output              = "File name or path where the command will store the output."
	Format              = "Output format. Supported values are 'json', 'yaml' or 'all' which will generate one file for each supported format."
	Versions            = "Boolean flag that defines wether to split the OAS into multiple versions."
	VersionsChangelog   = "List of versions to consider when generating the changelog. (Format: YYYY-MM-DD)"
	Spec                = "Path to the OAS file."
	Environment         = "Environment to consider when generating the versioned OAS."
	GitSha              = "GitSHA to use as identifier (x-xgen-sha) of the generated specification."
	GitShaChangelog     = "SHA of the commit of the openapi specification used to generate the changelog."
	ExcludePrivatePaths = "Exclude private paths from the generated specification."
	BaseFolder          = "Base folder where the current changelog files are stored."
	RevisionFolder      = "Folder where the revision files (new Oases) are stored."
	ExemptionFilePath   = "Path to the file containing the exemptions file."
	DryRun              = "Dry run mode. The command will not write any files."
	IgnoreExpiration    = "Ignore expiration date of the exemptions and consider the valid."
	RunDate             = "Date when the changelog was generated. (Format: YYYY-MM-DD)."
	Path                = "Path to the changelog file."
	MessageID           = "Message ID of the slack message. This ID is used to add the message as slack thread."
	SlackChannelID      = "Slack Channel ID."
	From                = "Date in the format YYYY-MM-DD that indicates the start of a date range"
	To                  = "Date in the format YYYY-MM-DD that indicates the end of a date range"
	StabilityLevel      = "Stability level related to the API Version. Valid values: [STABLE, UPCOMING, PUBLIC-PREVIEW, PRIVATE-PREVIEW]"
	Version             = "Version of the API."
	Tags                = "Comma-separated list of tags to extract."
	OperationIDs        = "Comma-separated list of operation IDs to extract."
	Paths               = "Comma-separated list of path patterns to extract."
)
