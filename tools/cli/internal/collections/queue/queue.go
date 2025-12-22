package queue

type Queue[T any] interface {
	Enqueue(item T)
	Dequeue() T
	IsEmpty() bool
	Len() int
	Clear()
}

// linkedQueue is the wrapper that satisfies the interface.
type node[T any] struct {
	value T
	next  *node[T]
}

type linkedQueue[T any] struct {
	head *node[T]
	tail *node[T]
	size int
}

func New[T any](items ...T) Queue[T] {
	q := &linkedQueue[T]{}
	for _, item := range items {
		q.Enqueue(item)
	}
	return q
}

func (q *linkedQueue[T]) IsEmpty() bool {
	return q.size == 0
}

func (q *linkedQueue[T]) Len() int {
	return q.size
}

func (q *linkedQueue[T]) Enqueue(item T) {
	n := &node[T]{value: item}
	if q.head == nil {
		q.head = n
		q.tail = n
	} else {
		q.tail.next = n
		q.tail = n
	}
	q.size++
}

func (q *linkedQueue[T]) Dequeue() T {
	if q.head == nil {
		var zero T
		return zero
	}

	item := q.head.value

	q.head = q.head.next
	q.size--

	if q.head == nil {
		q.tail = nil
	}

	return item
}

func (q *linkedQueue[T]) Clear() {
	q.head = nil
	q.tail = nil
	q.size = 0
}
