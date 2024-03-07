package errors

import "fmt"

type ParamConflictError struct {
	Entry string
}

func (e ParamConflictError) Error() string {
	return fmt.Sprintf("there was a conflict with the Param component: %s", e.Entry)
}
