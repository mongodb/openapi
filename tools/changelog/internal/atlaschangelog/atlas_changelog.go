package atlaschangelog

import (
	"log"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/changelog/internal/exceptions"
)

type AtlasChangelog struct {
	oas        *openapi3.T
	exceptions *exceptions.ExceptionConfig
	env        string
}

func NewAtlasChangelog(oasFilePath, exceptionsFilePath, env string) (*AtlasChangelog, error) {
	exceptions, err := exceptions.NewExceptionConfig(exceptionsFilePath)
	if err != nil {
		log.Fatalf("Error creating exception config: %v", err)
		return nil, err
	}

	return &AtlasChangelog{
		oas:        nil,
		exceptions: exceptions,
		env:        env,
	}, nil
}

func (c *AtlasChangelog) Generate() error {
	return nil
}
