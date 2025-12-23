package queue

type Queue[T any] interface {
	Enqueue(item T)
	Dequeue() T
	IsEmpty() bool
	Len() int
	Clear()
}

type queue[T any] []T

func (q *queue[T]) Enqueue(item T) {
	*q = append(*q, item)
}

func (q *queue[T]) Dequeue() T {
	var zero T
	if len(*q) == 0 {
		return zero
	}
	item := (*q)[0]
	(*q)[0] = zero
	*q = (*q)[1:]
	return item
}

func (q *queue[T]) IsEmpty() bool {
	return len(*q) == 0
}

func (q *queue[T]) Len() int {
	return len(*q)
}

func (q *queue[T]) Clear() {
	for !q.IsEmpty() {
		q.Dequeue()
	}
}

func New[T any](items ...T) Queue[T] {
	q := &queue[T]{}
	for _, item := range items {
		q.Enqueue(item)
	}
	return q
}
