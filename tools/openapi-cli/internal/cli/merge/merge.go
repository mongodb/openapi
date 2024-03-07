package merge

import (
	"andreaangiolillo/openapi-cli/internal/openapi"
	"fmt"
	"github.com/spf13/cobra"
	"github.com/tufin/oasdiff/load"
	"os"
	"regexp"
)

type Opts struct {
	Base       *load.SpecInfo
	Merger     openapi.Merger
	outputPath string
}

func (o *Opts) Run(args []string) error {
	federated, err := o.Merger.Merge(args[1:])
	if err != nil {
		return err
	}

	bytes, err := o.removeExternalReferences(args, federated)
	if err != nil {
		return err
	}

	return o.saveFile(bytes)
}

func (o *Opts) removeExternalReferences(paths []string, federated *load.SpecInfo) ([]byte, error) {
	data, err := openapi.MarshalJSON(federated.Spec)
	if err != nil {
		return nil, err
	}

	content := string(data)
	for _, path := range paths {
		escapedPath := regexp.QuoteMeta(path)
		pattern := regexp.MustCompile(escapedPath)
		content = pattern.ReplaceAllString(content, "")
	}

	return []byte(content), nil

}
func (o *Opts) saveFile(data []byte) error {
	if err := os.WriteFile(o.outputPath, data, 0644); err != nil {
		return err
	}
	_, _ = fmt.Printf("\nFederated Spec was saved in '%s'\n", o.outputPath)
	return nil
}

func (o *Opts) PreRunE(args []string) error {
	d, err := openapi.NewSpecInfo(args[0])
	if err != nil {
		return err
	}
	o.Base = d
	o.Merger = openapi.NewOasDiffMerge(d)
	return nil
}

func Builder() *cobra.Command {
	opts := &Opts{}

	cmd := &cobra.Command{
		Use:   "merge [base-spec] [spec-1] [spec-2] [spec-3] ... [spec-n]",
		Short: "Merge Open API specifications into a base spec.",
		Args:  cobra.MinimumNArgs(2),
		PreRunE: func(cmd *cobra.Command, args []string) error {
			return opts.PreRunE(args)
		},
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run(args)
		},
	}

	cmd.Flags().StringVarP(&opts.outputPath, "output", "o", "federated.json", "File name of the merged spec")
	return cmd
}
