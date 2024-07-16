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
package apiversion

import (
	"fmt"
	"regexp"
	"time"
)

type APIVersion struct {
	version     string
	versionDate time.Time
}

const (
	dateFormat = "2006-01-02"
)

var ContentPattern = regexp.MustCompile(`application/vnd\.atlas\.(\d{4})-(\d{2})-(\d{2})\+(.+)`)

// Option is a function that sets a value on the APIVersion.
type Option func(v *APIVersion) error

// New creates a new API version.
func New(opts ...Option) (*APIVersion, error) {
	version := &APIVersion{}
	for _, opt := range opts {
		if err := opt(version); err != nil {
			return nil, err
		}
	}
	return version, nil
}

// WithVersion sets the version on the APIVersion.
func WithVersion(version string) Option {
	return func(v *APIVersion) error {
		versionDate, err := DateFromVersion(version)
		if err != nil {
			return err
		}

		v.version = version
		v.versionDate = versionDate
		return nil
	}
}

// WithDate sets the version on the APIVersion.
func WithDate(date time.Time) Option {
	return func(v *APIVersion) error {
		v.version = date.Format(dateFormat)
		v.versionDate = date
		return nil
	}
}

func WithContent(contentType string) Option {
	return func(v *APIVersion) error {
		version, err := Parse(contentType)
		if err != nil {
			return err
		}

		v.version = version
		v.versionDate, err = DateFromVersion(version)
		if err != nil {
			return err
		}
		return nil
	}
}

func DateFromVersion(version string) (time.Time, error) {
	return time.Parse(dateFormat, version)
}

func (v *APIVersion) Equal(v2 *APIVersion) bool {
	return v.version == v2.version
}

func (v *APIVersion) GreaterThan(v2 *APIVersion) bool {
	return v.versionDate.After(v2.versionDate)
}

func (v *APIVersion) LessThan(v2 *APIVersion) bool {
	return v.versionDate.Before(v2.versionDate)
}

func (v *APIVersion) IsZero() bool {
	if v == nil {
		return true
	}

	return v.versionDate.IsZero()
}

func (v *APIVersion) String() string {
	return v.version
}

// Parse extracts the version date from the content type.
func Parse(contentType string) (string, error) {
	matches := ContentPattern.FindStringSubmatch(contentType)
	if matches == nil {
		return "", fmt.Errorf("invalid content type: %s", contentType)
	}
	return fmt.Sprintf("%s-%s-%s", matches[1], matches[2], matches[3]), nil
}
