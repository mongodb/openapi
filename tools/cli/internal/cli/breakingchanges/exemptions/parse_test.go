package exemptions

import (
	"testing"

	"github.com/spf13/afero"
	"github.com/stretchr/testify/require"
)

func TestSuccessfulParse_Run(t *testing.T) {
	fs := afero.NewOsFs()
	opts := &Opts{
		exemptionsPaths: "../../../../test/data/exemptions/valid_exemptions.yaml",
		outputPath:      "../../../../test/data/exemptions/exemptions.txt",
		fs:              fs,
	}

	if err := opts.Run(); err != nil {
		t.Fatalf("Run() unexpected error: %v", err)
	}

	b, err := afero.ReadFile(fs, opts.outputPath)
	require.NoError(t, err)
	require.NotEmpty(t, b)
}

func TestOpts_PreRunE(t *testing.T) {
	testCases := []struct {
		wantErr        require.ErrorAssertionFunc
		exemptionsPath string
		name           string
	}{
		{
			wantErr: require.Error,
			name:    "NoExemptionsPath",
		},
		{
			wantErr:        require.NoError,
			exemptionsPath: "../../../../test/data/exemptions/valid_exemptions.yaml",
			name:           "Successful",
		},
		{
			wantErr:        require.Error,
			exemptionsPath: "",
			name:           "Empty path",
		},
	}

	for _, tt := range testCases {
		fs := afero.NewOsFs()
		t.Run(tt.name, func(t *testing.T) {
			o := &Opts{
				exemptionsPaths: tt.exemptionsPath,
				fs:              fs,
			}
			tt.wantErr(t, o.PreRunE(nil))
		})
	}
}

func TestInvalidPath_PreRun(t *testing.T) {
	opts := &Opts{
		exemptionsPaths: "invalid/path/to/exemptions.yaml",
		fs:              afero.NewMemMapFs(),
	}

	err := opts.PreRunE(nil)
	require.Error(t, err)
	require.ErrorContains(t, err, "file does not exist")
}
