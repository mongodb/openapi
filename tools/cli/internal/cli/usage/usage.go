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
	Output              = "File name where the command will store the output."
	Format              = "Output format. Supported values are 'json' and 'yaml'."
	Versions            = "Boolean flag that defines wether to split the OAS into multiple versions."
	Spec                = "Path to the OAS file."
	Environment         = "Environment to consider when generating the versioned OAS."
	GitSha              = "GitSHA to use as identifier (x-xgen-sha) of the generated specification."
	ExcludePrivatePaths = "Exclude private paths from the generated specification."
)
