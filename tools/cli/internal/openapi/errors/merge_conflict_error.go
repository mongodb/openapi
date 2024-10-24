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

package errors

import (
	"encoding/json"
	"fmt"

	"github.com/tufin/oasdiff/diff"
)

type ParamConflictError struct {
	Entry string
}

func (e ParamConflictError) Error() string {
	return fmt.Sprintf("there was a conflict with the Param component: %q", e.Entry)
}

type PathConflictError struct {
	Entry string
}

func (e PathConflictError) Error() string {
	return fmt.Sprintf("there was a conflict with the path: %q", e.Entry)
}

type ResponseConflictError struct {
	Entry string
}

func (e ResponseConflictError) Error() string {
	return fmt.Sprintf("there was a conflict on a the Response component: %q", e.Entry)
}

type SchemaConflictError struct {
	Entry string
}

func (e SchemaConflictError) Error() string {
	return fmt.Sprintf("there was a conflict on a Schema component: %q", e.Entry)
}

type TagConflictError struct {
	Entry       string
	Description string
}

func (e TagConflictError) Error() string {
	return fmt.Sprintf("there was a conflict with the Tag %q with the description: %q", e.Entry, e.Description)
}

type PathDocsDiffConflictError struct {
	Entry string
	Diff  *diff.Diff
}

func (e PathDocsDiffConflictError) Error() string {
	var pathDiff []byte
	_, ok := e.Diff.PathsDiff.Modified[e.Entry]
	if ok {
		pathDiff, _ = json.MarshalIndent(e.Diff.PathsDiff.Modified[e.Entry], "", "  ")
	}

	return fmt.Sprintf("the path: %q is enabled for merge but it has a diff between the base and external spec. See the diff:\n%s", e.Entry, pathDiff)
}

type AllowDocsDiffNotSupportedError struct {
	Entry string
}

func (e AllowDocsDiffNotSupportedError) Error() string {
	return fmt.Sprintf("the path: %q is enabled for merge but the flag to allow docs diff is not supported", e.Entry)
}
