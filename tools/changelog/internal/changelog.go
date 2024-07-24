package internal

import (
	"log"

	"github.com/getkin/kin-openapi/openapi3"
)

type Changelog struct {
	base        *openapi3.T
	revision       *openapi3.T
	exceptions *ExceptionConfig
	env        string
}

func NewAtlasChangelog(oasFilePath, exceptionsFilePath, env string) (*Changelog, error) {
	exceptions, err := NewExceptionConfig(exceptionsFilePath)
	if err != nil {
		log.Fatalf("Error creating exception config: %v", err)
		return nil, err
	}

	return &Changelog{
		base:        nil,
		revision:    nil,
		exceptions: exceptions,
		env:        env,
	}, nil
}

func (c *Changelog) Generate() error {
	return nil
}
