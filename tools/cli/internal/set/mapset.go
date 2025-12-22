package set

import "iter"

// MapSet is a concrete implementation of Set using a map.
// It embeds Base to inherit the convenience methods (AddAll, RemoveAll, HasAll, HasAny).
type MapSet[T comparable] struct {
	baseSet[T]
	data map[T]struct{}
}

// NewMapSet creates a new MapSet.
func NewMapSet[T comparable]() *MapSet[T] {
	s := &MapSet[T]{
		data: make(map[T]struct{}),
	}
	// Set the embedded Base's Set field to point to this instance
	s.baseSet.Set = s
	return s
}

func (s *MapSet[T]) Add(item T) bool {
	if _, exists := s.data[item]; exists {
		return false
	}
	s.data[item] = struct{}{}
	return true
}

func (s *MapSet[T]) Has(item T) bool {
	_, exists := s.data[item]
	return exists
}

func (s *MapSet[T]) Remove(item T) bool {
	if _, exists := s.data[item]; !exists {
		return false
	}
	delete(s.data, item)
	return true
}

func (s *MapSet[T]) Len() int {
	return len(s.data)
}

func (s *MapSet[T]) Items() iter.Seq[T] {
	return func(yield func(T) bool) {
		for item := range s.data {
			if !yield(item) {
				return
			}
		}
	}
}

func (s *MapSet[T]) Clear() {
	s.data = make(map[T]struct{})
}
