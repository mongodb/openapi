module github.com/mongodb/openapi/tools/cli

go 1.26

toolchain go1.26.0

require (
	github.com/getkin/kin-openapi v0.140.0
	github.com/iancoleman/strcase v0.3.0
	github.com/oasdiff/oasdiff v1.18.6
	github.com/spf13/afero v1.15.0
	github.com/spf13/cobra v1.10.2
	github.com/stretchr/testify v1.11.1
	go.uber.org/mock v0.6.0
	golang.org/x/text v0.38.0
	gopkg.in/yaml.v3 v3.0.1
)

require github.com/mongodb/openapi/tools/foas v0.0.0

// foas is developed in this repo; resolved locally via go.work during dev/CI and
// via this replace directive when GOWORK=off (e.g. GoReleaser).
replace github.com/mongodb/openapi/tools/foas => ../foas

require (
	cloud.google.com/go v0.123.0 // indirect
	github.com/TwiN/go-color v1.4.1 // indirect
	github.com/davecgh/go-spew v1.1.2-0.20180830191138-d8f796af33cc // indirect
	github.com/go-openapi/jsonpointer v0.22.5 // indirect
	github.com/go-openapi/swag/jsonname v0.25.5 // indirect
	github.com/inconshreveable/mousetrap v1.1.0 // indirect
	github.com/kr/pretty v0.3.1 // indirect
	github.com/oasdiff/yaml v0.1.0 // indirect
	github.com/oasdiff/yaml3 v0.0.13 // indirect
	github.com/pmezard/go-difflib v1.0.1-0.20181226105442-5d4384ee4fb2 // indirect
	github.com/santhosh-tekuri/jsonschema/v6 v6.0.2 // indirect
	github.com/spf13/pflag v1.0.10 // indirect
	github.com/tidwall/gjson v1.18.0 // indirect
	github.com/tidwall/match v1.2.0 // indirect
	github.com/tidwall/pretty v1.2.1 // indirect
	github.com/tidwall/sjson v1.2.5 // indirect
	github.com/wI2L/jsondiff v0.7.1 // indirect
	github.com/yargevad/filepathx v1.0.0 // indirect
	github.com/yuin/goldmark v1.8.2 // indirect
	go.yaml.in/yaml/v3 v3.0.4 // indirect
)
