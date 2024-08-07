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
	"github.com/tufin/oasdiff/checker"
	"github.com/tufin/oasdiff/load"
)

const (
	deprecationDaysStable = 365 //  min days required between deprecating a stable resource and removing it
	deprecationDaysBeta   = 365 //  min days required between deprecating a beta resource and removing it
)

var breakingChangesAdditionalCheckers = []string{
	"response-non-success-status-removed",
	"api-operation-id-removed",
	"api-tag-removed",
	"response-property-enum-value-removed",
	"response-mediatype-enum-value-removed",
	"request-body-enum-value-removed",
	"api-schema-removed",
}

type Changelog struct {
	Base              *load.SpecInfo
	Revision          *load.SpecInfo //  the new spec to compare against the base
	Config            *checker.Config
	ExceptionFilePath string
}
