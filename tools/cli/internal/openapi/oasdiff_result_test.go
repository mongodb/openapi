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
	"errors"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/require"
	"github.com/tufin/oasdiff/diff"
	"github.com/tufin/oasdiff/load"
	gomock "go.uber.org/mock/gomock"
)

func TestGetSimpleDiff(t *testing.T) {
	// Mock diff.Get function
	ctrl := gomock.NewController(t)
	mockDiffGet := NewMockDiffGetter(ctrl)

	testCases := []struct {
		name           string
		base           *load.SpecInfo
		revision       *load.SpecInfo
		expectedError  error
		expectedResult *OasDiffResult
	}{
		{
			name: "Simple Diff Success",
			base: &load.SpecInfo{
				Spec: &openapi3.T{},
			},
			revision: &load.SpecInfo{
				Spec: &openapi3.T{},
			},
			expectedError: nil,
			expectedResult: &OasDiffResult{
				Report:    &diff.Diff{},
				SourceMap: nil,
				SpecInfoPair: load.NewSpecInfoPair(&load.SpecInfo{
					Spec: &openapi3.T{},
				}, &load.SpecInfo{
					Spec: &openapi3.T{},
				}),
				Config: &diff.Config{},
			},
		},
		{
			name: "Simple Diff Error",
			base: &load.SpecInfo{
				Spec: &openapi3.T{},
			},
			revision: &load.SpecInfo{
				Spec: &openapi3.T{},
			},
			expectedError:  errors.New("diff error"),
			expectedResult: nil,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			o := OasDiff{
				config:     &diff.Config{},
				diffGetter: mockDiffGet,
			}

			var returnDiff *diff.Diff
			if tc.expectedResult != nil {
				returnDiff = tc.expectedResult.Report
			}

			mockDiffGet.
				EXPECT().
				Get(o.config, tc.base.Spec, tc.revision.Spec).
				Return(returnDiff, tc.expectedError)

			result, err := o.GetSimpleDiff(tc.base, tc.revision)

			// assert
			require.ErrorIs(t, err, tc.expectedError)
			require.Equal(t, tc.expectedResult, result)
		})
	}
}

func TestGetDiffWithConfig(t *testing.T) {
	// Mock diff.Get function
	ctrl := gomock.NewController(t)
	mockDiffGet := NewMockDiffGetter(ctrl)

	exclude := []string{"extensions"}
	customConfig := diff.NewConfig().WithExcludeElements(exclude)

	testCases := []struct {
		name           string
		base           *load.SpecInfo
		revision       *load.SpecInfo
		config         *diff.Config
		expectedError  error
		expectedResult *OasDiffResult
	}{
		{
			name: "Diff With Custom Config Success",
			base: &load.SpecInfo{
				Spec: &openapi3.T{},
			},
			revision: &load.SpecInfo{
				Spec: &openapi3.T{},
			},
			config:        customConfig,
			expectedError: nil,
			expectedResult: &OasDiffResult{
				Report:    &diff.Diff{},
				SourceMap: nil,
				SpecInfoPair: load.NewSpecInfoPair(&load.SpecInfo{
					Spec: &openapi3.T{},
				}, &load.SpecInfo{
					Spec: &openapi3.T{},
				}),
				Config: customConfig,
			},
		},
		{
			name: "Diff With Config Error",
			base: &load.SpecInfo{
				Spec: &openapi3.T{},
			},
			revision: &load.SpecInfo{
				Spec: &openapi3.T{},
			},
			config:         &diff.Config{},
			expectedError:  errors.New("diff error"),
			expectedResult: nil,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			o := OasDiff{
				config:     &diff.Config{},
				diffGetter: mockDiffGet,
			}

			var returnDiff *diff.Diff
			if tc.expectedResult != nil {
				returnDiff = tc.expectedResult.Report
			}

			mockDiffGet.
				EXPECT().
				Get(tc.config, tc.base.Spec, tc.revision.Spec).
				Return(returnDiff, tc.expectedError)

			result, err := o.GetDiffWithConfig(tc.base, tc.revision, tc.config)

			// assert
			require.ErrorIs(t, err, tc.expectedError)
			require.Equal(t, tc.expectedResult, result)
		})
	}
}
