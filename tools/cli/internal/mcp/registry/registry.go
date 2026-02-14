// Copyright 2025 MongoDB Inc
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

// Package registry provides an in-memory store for loaded OpenAPI specifications.
package registry

import (
	"encoding/json"
	"errors"
	"fmt"
	"sync"

	"github.com/getkin/kin-openapi/openapi3"
)

// MaxSpecs is the maximum number of specs that can be loaded at once.
const MaxSpecs = 50

var (
	ErrNotFound     = errors.New("spec not found")
	ErrRegistryFull = errors.New("registry full: please unload specs before adding new ones")
	ErrAliasExists  = errors.New("alias already exists")
)

// SpecEntry represents a loaded OpenAPI specification with metadata.
type SpecEntry struct {
	Spec       *openapi3.T
	SourcePath string // Original file path (empty for virtual specs)
	IsVirtual  bool   // True if this is a filtered/derived spec
}

// Registry is a thread-safe in-memory store for OpenAPI specifications.
type Registry struct {
	mu    sync.RWMutex
	specs map[string]*SpecEntry
}

// New creates a new empty Registry.
func New() *Registry {
	return &Registry{
		specs: make(map[string]*SpecEntry),
	}
}

// Load adds a spec to the registry under the given alias.
func (r *Registry) Load(alias string, spec *openapi3.T, sourcePath string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.specs[alias]; exists {
		return fmt.Errorf("%w: %s", ErrAliasExists, alias)
	}

	if len(r.specs) >= MaxSpecs {
		return ErrRegistryFull
	}

	r.specs[alias] = &SpecEntry{
		Spec:       spec,
		SourcePath: sourcePath,
		IsVirtual:  false,
	}
	return nil
}

// LoadVirtual adds a virtual (filtered) spec to the registry.
func (r *Registry) LoadVirtual(alias string, spec *openapi3.T) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.specs[alias]; exists {
		return fmt.Errorf("%w: %s", ErrAliasExists, alias)
	}

	if len(r.specs) >= MaxSpecs {
		return ErrRegistryFull
	}

	r.specs[alias] = &SpecEntry{
		Spec:      spec,
		IsVirtual: true,
	}
	return nil
}

// Get retrieves a spec by alias.
func (r *Registry) Get(alias string) (*SpecEntry, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	entry, exists := r.specs[alias]
	if !exists {
		return nil, fmt.Errorf("%w: %s", ErrNotFound, alias)
	}
	return entry, nil
}

// Unload removes a spec from the registry.
func (r *Registry) Unload(alias string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.specs[alias]; !exists {
		return fmt.Errorf("%w: %s", ErrNotFound, alias)
	}
	delete(r.specs, alias)
	return nil
}

// List returns all loaded spec aliases.
func (r *Registry) List() []string {
	r.mu.RLock()
	defer r.mu.RUnlock()

	aliases := make([]string, 0, len(r.specs))
	for alias := range r.specs {
		aliases = append(aliases, alias)
	}
	return aliases
}

// Count returns the number of loaded specs.
func (r *Registry) Count() int {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return len(r.specs)
}

// Duplicate creates a deep copy of a spec.
func Duplicate(spec *openapi3.T) (*openapi3.T, error) {
	data, err := json.Marshal(spec)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal spec: %w", err)
	}

	var copy openapi3.T
	if err := json.Unmarshal(data, &copy); err != nil {
		return nil, fmt.Errorf("failed to unmarshal spec: %w", err)
	}
	return &copy, nil
}

