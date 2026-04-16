package registry

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sort"
	"sync"
	"time"

	"github.com/getkin/kin-openapi/openapi3"
)

// SourceType represents the origin of a spec entry.
type SourceType string

const (
	// SourceTypeFile represents a spec loaded from a file.
	SourceTypeFile SourceType = "file"
	// SourceTypeVirtual represents a spec created by transformations.
	SourceTypeVirtual SourceType = "virtual"
)

// Entry represents a single OpenAPI specification in the registry.
type Entry struct {
	Alias      string            // Primary key - unique identifier
	SourceType SourceType        // Origin: "file" or "virtual"
	FilePath   string            // Source file path (empty for virtual specs)
	Checksum   string            // SHA256 hash of spec content
	Spec       *openapi3.T       // The actual spec
	Metadata   map[string]string // Custom metadata
	LoadedAt   time.Time         // When the spec was loaded
}

// Registry manages a collection of OpenAPI specifications in memory.
type Registry struct {
	mu    sync.RWMutex
	specs map[string]*Entry // Key = alias (unique)
}

// New creates a new empty registry.
func New() *Registry {
	return &Registry{
		specs: make(map[string]*Entry),
	}
}

// Add adds or updates a spec entry in the registry.
// FilePath should be empty string for virtual specs.
//
// Collision detection logic:
// - Alias must be globally unique (regardless of source type)
// - File + File with same alias but different path: collision error
// - File + File with same alias, same path, same checksum: idempotent no-op
// - File + File with same alias, same path, different checksum: update
// - Virtual + Virtual with same alias, different checksum: update
// - Virtual + Virtual with same alias, same checksum: idempotent no-op
// - File + Virtual or Virtual + File with same alias: collision error.
func (r *Registry) Add(alias, filePath string, spec *openapi3.T, metadata map[string]string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	sourceType := SourceTypeFile
	if filePath == "" {
		sourceType = SourceTypeVirtual
	}

	checksum, err := calculateChecksum(spec)
	if err != nil {
		return fmt.Errorf("failed to calculate checksum: %w", err)
	}

	if existing, exists := r.specs[alias]; exists {
		if existing.SourceType != sourceType {
			return fmt.Errorf("alias '%s' is already in use by a %s spec", alias, existing.SourceType)
		}

		// File-based specs: check path collision
		if sourceType == SourceTypeFile {
			if existing.FilePath != filePath {
				return fmt.Errorf("alias '%s' is already in use by '%s'", alias, existing.FilePath)
			}
		}

		// No changes - idempotent no-op
		if existing.Checksum == checksum {
			return nil
		}

		r.specs[alias] = &Entry{
			Alias:      alias,
			SourceType: sourceType,
			FilePath:   filePath,
			Checksum:   checksum,
			Spec:       spec,
			Metadata:   metadata,
			LoadedAt:   time.Now(),
		}
		return nil
	}

	r.specs[alias] = &Entry{
		Alias:      alias,
		SourceType: sourceType,
		FilePath:   filePath,
		Checksum:   checksum,
		Spec:       spec,
		Metadata:   metadata,
		LoadedAt:   time.Now(),
	}
	return nil
}

// GetByAlias retrieves a spec entry by alias.
// Returns an error if the spec doesn't exist.
func (r *Registry) GetByAlias(alias string) (*Entry, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	entry, exists := r.specs[alias]
	if !exists {
		return nil, fmt.Errorf("spec with alias '%s' not found", alias)
	}

	return entry, nil
}

// Remove removes a spec entry from the registry by alias.
// Returns an error if the spec doesn't exist.
func (r *Registry) Remove(alias string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.specs[alias]; !exists {
		return fmt.Errorf("spec with alias '%s' not found", alias)
	}

	delete(r.specs, alias)
	return nil
}

// List returns all spec entries in the registry, sorted by LoadedAt descending (most recent first).
func (r *Registry) List() []*Entry {
	r.mu.RLock()
	defer r.mu.RUnlock()

	entries := make([]*Entry, 0, len(r.specs))
	for _, entry := range r.specs {
		entries = append(entries, entry)
	}

	// Sort by LoadedAt descending (most recent first)
	sort.Slice(entries, func(i, j int) bool {
		return entries[i].LoadedAt.After(entries[j].LoadedAt)
	})

	return entries
}

// Count returns the number of specs in the registry.
func (r *Registry) Count() int {
	r.mu.RLock()
	defer r.mu.RUnlock()

	return len(r.specs)
}

// Clear removes all specs from the registry.
func (r *Registry) Clear() {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.specs = make(map[string]*Entry)
}

// calculateChecksum calculates SHA256 hash of the spec content.
func calculateChecksum(spec *openapi3.T) (string, error) {
	data, err := json.Marshal(spec)
	if err != nil {
		return "", err
	}
	hash := sha256.Sum256(data)
	return hex.EncodeToString(hash[:]), nil
}
