package errors

import "fmt"

type TagConflictError struct {
	Entry       string
	Description string
}

func (e TagConflictError) Error() string {
	return fmt.Sprintf("there was a conflict with the Tag '%s' with the description: '%s'", e.Entry, e.Description)
}
