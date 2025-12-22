package set

import "testing"

func TestMapSetInheritedMethods(t *testing.T) {
	s := NewMapSet[string]()

	// Test AddAll (inherited from Base)
	if !s.AddAll("a", "b", "c") {
		t.Error("AddAll should return true when adding new items")
	}

	if s.Len() != 3 {
		t.Errorf("Expected length 3, got %d", s.Len())
	}

	// Test HasAll (inherited from Base)
	if !s.HasAll("a", "b", "c") {
		t.Error("HasAll should return true for all added items")
	}

	if s.HasAll("a", "b", "d") {
		t.Error("HasAll should return false when one item is missing")
	}

	// Test HasAny (inherited from Base)
	if !s.HasAny("a", "d", "e") {
		t.Error("HasAny should return true when at least one item exists")
	}

	if s.HasAny("x", "y", "z") {
		t.Error("HasAny should return false when no items exist")
	}

	// Test RemoveAll (inherited from Base)
	if !s.RemoveAll("a", "b") {
		t.Error("RemoveAll should return true when items were removed")
	}

	if s.Len() != 1 {
		t.Errorf("Expected length 1 after removing 2 items, got %d", s.Len())
	}

	if !s.Has("c") {
		t.Error("Item 'c' should still exist")
	}
}

