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

import "fmt"

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
