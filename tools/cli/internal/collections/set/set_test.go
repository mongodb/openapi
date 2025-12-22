package set

import (
	"slices"
	"testing"
)

func TestSet(t *testing.T) {
	RunSetComplianceSuite(t, New[string])
}

// RunSetComplianceSuite is a reusable test suite for ANY implementation of Set[string].
func RunSetComplianceSuite(t *testing.T, createSet func(...string) Set[string]) {
	t.Helper() // Marks this function as a test helper so logs point to the caller

	t.Run("Initialization", func(t *testing.T) {
		s := createSet("a", "b", "a") // "a" is duplicate
		if s.Len() != 2 {
			t.Errorf("expected len 2, got %d", s.Len())
		}
		if !s.Has("a") || !s.Has("b") {
			t.Error("set missing initialized items")
		}
	})

	t.Run("Add and Uniqueness", func(t *testing.T) {
		s := createSet()

		// 1. Add new item
		if added := s.Add("foo"); !added {
			t.Error("expected Add to return true for new item")
		}
		if s.Len() != 1 {
			t.Errorf("expected len 1, got %d", s.Len())
		}

		// 2. Add duplicate
		if added := s.Add("foo"); added {
			t.Error("expected Add to return false for duplicate item")
		}
		if s.Len() != 1 {
			t.Errorf("expected len to remain 1 after duplicate add")
		}
	})

	t.Run("Has Check", func(t *testing.T) {
		s := createSet("x")
		if !s.Has("x") {
			t.Error("Has() returned false for existing item")
		}
		if s.Has("y") {
			t.Error("Has() returned true for missing item")
		}
	})

	t.Run("Removal", func(t *testing.T) {
		s := createSet("A", "B")

		// 1. Remove existing
		if removed := s.Remove("A"); !removed {
			t.Error("expected Remove to return true for existing item")
		}
		if s.Has("A") {
			t.Error("item 'A' should be gone")
		}
		if s.Len() != 1 {
			t.Errorf("expected len 1, got %d", s.Len())
		}

		// 2. Remove non-existing
		if removed := s.Remove("Z"); removed {
			t.Error("expected Remove to return false for non-existing item")
		}
		if s.Len() != 1 {
			t.Error("length changed after failed removal")
		}
	})

	t.Run("Clear", func(t *testing.T) {
		s := createSet("1", "2", "3")
		s.Clear()

		if s.Len() != 0 {
			t.Errorf("expected empty set after Clear(), got len %d", s.Len())
		}
		if s.Has("1") {
			t.Error("set still has items after Clear()")
		}

		// Ensure we can reuse the set after clearing
		s.Add("4")
		if s.Len() != 1 {
			t.Error("set unusable after Clear()")
		}
	})

	t.Run("Iteration", func(t *testing.T) {
		inputs := []string{"apple", "banana", "cherry"}
		s := createSet(inputs...)

		// Use Go 1.23 slices.Collect to consume the iterator
		got := slices.Collect(s.Iter())

		// Maps are unordered, so we must sort before comparing slices
		slices.Sort(got)
		slices.Sort(inputs) // inputs was already sorted, but good practice to be explicit

		if !slices.Equal(got, inputs) {
			t.Errorf("iterator mismatch.\nGot: %v\nWant: %v", got, inputs)
		}
	})
}
