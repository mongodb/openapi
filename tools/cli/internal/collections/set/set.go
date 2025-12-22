// Copyright 2025 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package set

import (
	"iter"
)

type Set[T comparable] interface {
	Add(item T) bool
	Has(item T) bool
	Remove(item T) bool
	Len() int
	Iter() iter.Seq[T]
	Clear()
}

// MapSet is a concrete implementation of Set using a map.
type mapSet[T comparable] struct {
	data map[T]struct{}
}

// NewMapSet creates a new MapSet.
func New[T comparable](items ...T) Set[T] {
	s := &mapSet[T]{
		data: make(map[T]struct{}, len(items)),
	}
	for _, item := range items {
		s.Add(item)
	}
	return s
}

func (s *mapSet[T]) Add(item T) bool {
	if _, exists := s.data[item]; exists {
		return false
	}
	s.data[item] = struct{}{}
	return true
}

func (s *mapSet[T]) Has(item T) bool {
	_, exists := s.data[item]
	return exists
}

func (s *mapSet[T]) Remove(item T) bool {
	if _, exists := s.data[item]; !exists {
		return false
	}
	delete(s.data, item)
	return true
}

func (s *mapSet[T]) Len() int {
	return len(s.data)
}

func (s *mapSet[T]) Iter() iter.Seq[T] {
	return func(yield func(T) bool) {
		for item := range s.data {
			if !yield(item) {
				return
			}
		}
	}
}

func (s *mapSet[T]) Clear() {
	clear(s.data)
}
