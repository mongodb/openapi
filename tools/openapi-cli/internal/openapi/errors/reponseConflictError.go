package errors

import "fmt"

type ResponseConflictError struct {
	Entry string
}

func (e ResponseConflictError) Error() string {
	return fmt.Sprintf("there was a conflict on a the Response component: %s", e.Entry)
}
