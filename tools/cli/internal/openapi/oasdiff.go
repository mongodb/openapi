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
	"github.com/mongodb/openapi/tools/cli/internal/openapi/errors"
	"github.com/tufin/oasdiff/diff"
	"github.com/tufin/oasdiff/load"
)

type OasDiff struct {
	base     *load.SpecInfo
	external *load.SpecInfo
	config   *diff.Config
	specDiff *diff.Diff
	parser   Parser
}

func (o OasDiff) mergeSpecIntoBase() error {
	return o.mergePaths()
}

func (o OasDiff) mergePaths() error {
	pathsToMerge := o.external.Spec.Paths
	basePaths := o.base.Spec.Paths
	for k, v := range pathsToMerge.Map() {
		if ok := basePaths.Value(k); ok == nil {
			basePaths.Set(k, v)
		} else {
			return errors.PathConflictError{
				Entry: k,
			}
		}
	}

	o.base.Spec.Paths = basePaths
	return nil
}
