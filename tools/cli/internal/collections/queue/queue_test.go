package queue

import (
	"testing"
)

// 1. Test the Slice Implementation
func TestQueue(t *testing.T) {
	factory := func(items ...string) Queue[string] {
		return New(items...)
	}
	RunQueueComplianceSuite(t, factory)
}

// RunQueueComplianceSuite asserts that ANY implementation of Queue[T] behaves correctly.
func RunQueueComplianceSuite(t *testing.T, createQueue func(...string) Queue[string]) {
	t.Helper()

	t.Run("Initialization", func(t *testing.T) {
		q := createQueue("A", "B", "C")

		if q.Len() != 3 {
			t.Errorf("expected len 3, got %d", q.Len())
		}
		if q.IsEmpty() {
			t.Error("newly initialized queue should not be empty")
		}

		// Verify FIFO order immediately
		if got := q.Dequeue(); got != "A" {
			t.Errorf("expected first item 'A', got %q", got)
		}
	})

	t.Run("FIFO Behavior (First-In-First-Out)", func(t *testing.T) {
		q := createQueue()

		q.Enqueue("1")
		q.Enqueue("2")
		q.Enqueue("3")

		if got := q.Dequeue(); got != "1" {
			t.Errorf("expected '1', got %q", got)
		}
		if got := q.Dequeue(); got != "2" {
			t.Errorf("expected '2', got %q", got)
		}
		if got := q.Dequeue(); got != "3" {
			t.Errorf("expected '3', got %q", got)
		}
	})

	t.Run("Empty State Handling", func(t *testing.T) {
		q := createQueue()

		if !q.IsEmpty() {
			t.Error("new queue should be empty")
		}
		if q.Len() != 0 {
			t.Errorf("expected len 0, got %d", q.Len())
		}

		// Dequeue on empty should return zero value (empty string) and not panic
		if got := q.Dequeue(); got != "" {
			t.Errorf("expected empty string from empty queue, got %q", got)
		}
	})

	t.Run("Interleaved Enqueue and Dequeue", func(t *testing.T) {
		q := createQueue()

		q.Enqueue("A")
		q.Enqueue("B")

		// Remove A
		if got := q.Dequeue(); got != "A" {
			t.Errorf("want A, got %s", got)
		}

		// Add C (Queue is now [B, C])
		q.Enqueue("C")

		if got := q.Dequeue(); got != "B" {
			t.Errorf("want B, got %s", got)
		}
		if got := q.Dequeue(); got != "C" {
			t.Errorf("want C, got %s", got)
		}

		if !q.IsEmpty() {
			t.Error("queue should be empty after removing all items")
		}
	})

	t.Run("Clear", func(t *testing.T) {
		q := createQueue("X", "Y", "Z")
		q.Clear()

		if q.Len() != 0 {
			t.Errorf("expected len 0 after Clear, got %d", q.Len())
		}
		if !q.IsEmpty() {
			t.Error("expected IsEmpty() to be true after Clear")
		}

		// Ensure queue is still usable after Clear
		q.Enqueue("New")
		if q.Dequeue() != "New" {
			t.Error("queue failed to work correctly after being cleared")
		}
	})
}
