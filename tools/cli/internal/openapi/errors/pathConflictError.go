package errors

import "fmt"

type PathConflictError struct {
	Entry string
}

func (e PathConflictError) Error() string {
	return fmt.Sprintf("there was a conflict with the Path: %s", e.Entry)
}
