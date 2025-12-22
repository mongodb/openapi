package set

import "iter"

type Set[T comparable] interface {
	Add(item T) bool
	AddAll(items ...T) bool
	Has(item T) bool
	HasAll(items ...T) bool
	HasAny(items ...T) bool
	Remove(item T) bool
	RemoveAll(items ...T) bool
	Len() int
	Items() iter.Seq[T]
	Clear()
}

// Base provides default implementations of convenience methods
// that build on top of the core Set interface methods.
// Embed this in your concrete Set implementation to inherit these methods.
type baseSet[T comparable] struct {
	Set[T]
}

func (b *baseSet[T]) AddAll(items ...T) bool {
	for _, item := range items {
		if !b.Add(item) {
			return false
		}
	}
	return true
}

func (b *baseSet[T]) RemoveAll(items ...T) bool {
	changed := false
	for _, item := range items {
		if b.Remove(item) {
			changed = true
		}
	}
	return changed
}

func (b *baseSet[T]) HasAll(items ...T) bool {
	for _, item := range items {
		if !b.Has(item) {
			return false
		}
	}
	return true
}

func (b *baseSet[T]) HasAny(items ...T) bool {
	for _, item := range items {
		if b.Has(item) {
			return true
		}
	}
	return false
}
