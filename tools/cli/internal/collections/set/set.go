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
type set[T comparable] map[T]struct{}

// NewMapSet creates a new MapSet.
func New[T comparable](items ...T) Set[T] {
	s := &set[T]{}
	for _, item := range items {
		s.Add(item)
	}
	return s
}

func (s *set[T]) Add(item T) bool {
	if _, exists := (*s)[item]; exists {
		return false
	}
	(*s)[item] = struct{}{}
	return true
}

func (s *set[T]) Has(item T) bool {
	_, exists := (*s)[item]
	return exists
}

func (s *set[T]) Remove(item T) bool {
	if _, exists := (*s)[item]; !exists {
		return false
	}
	delete(*s, item)
	return true
}

func (s *set[T]) Len() int {
	return len(*s)
}

func (s *set[T]) Iter() iter.Seq[T] {
	return func(yield func(T) bool) {
		for item := range *s {
			if !yield(item) {
				return
			}
		}
	}
}

func (s *set[T]) Clear() {
	clear(*s)
}
