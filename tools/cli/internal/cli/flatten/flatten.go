package flatten

import (
	"fmt"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/spf13/cobra"
	"github.com/tufin/oasdiff/flatten/allof"
	"gopkg.in/yaml.v3"
)

func Builder() *cobra.Command {
	var spec string

	cmd := &cobra.Command{
		Use:   "flatten -s <spec>",
		Short: "Flatten the spec.",
		Args:  cobra.NoArgs,

		RunE: func(_ *cobra.Command, _ []string) error {
			loader := openapi3.NewLoader()
			loader.IsExternalRefsAllowed = true
			specInfo, err := loader.LoadFromFile(spec)
			//spec, err := load.NewSpecInfo(loader, spec, load.WithFlattenAllOf())
			//loader := openapi.NewOpenAPI3()
			//specInfo, err := loader.CreateOpenAPISpecFromPath(spec)
			//if err != nil {
			//	return err
			//}
			result, err := allof.MergeSpec(specInfo)
			if err != nil {
				return err
			}
			yamlData, err := yaml.Marshal(result)
			fmt.Print(string(yamlData))
			return nil
		},
	}

	cmd.Flags().StringVarP(&spec, flag.Spec, flag.SpecShort, "-", usage.Spec)

	_ = cmd.MarkFlagRequired(flag.Spec)

	return cmd
}
