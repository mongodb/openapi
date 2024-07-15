package cli

import (
	"bytes"
	"os/exec"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSplit(t *testing.T) {
	cliPath := NewBin(t)

	t.Run("Split valid specs", func(t *testing.T) {
		base := NewAtlasYAMLBaseSpecPath(t)

		cmd := exec.Command(cliPath,
			"split",
			"-s",
			base,
			"-o",
			"./output/output.yaml",
		)

		var o, e bytes.Buffer
		cmd.Stdout = &o
		cmd.Stderr = &e
		require.NoError(t, cmd.Run(), e.String())
		ValidateVersionedSpec(t, NewValidAtlas20230101YAMLSpecPath(t), "./output/output-2023-01-01.yaml")
		ValidateVersionedSpec(t, NewValidAtlas20230201YAMLSpecPath(t), "./output/output-2023-02-01.yaml")
		ValidateVersionedSpec(t, NewValidAtlas20231001YAMLSpecPath(t), "./output/output-2023-10-01.yaml")
		ValidateVersionedSpec(t, NewValidAtlas20231115YAMLSpecPath(t), "./output/output-2023-11-15.yaml")
		ValidateVersionedSpec(t, NewValidAtlas20240530YAMLSpecPath(t), "./output/output-2024-05-30.yaml")
	})
}
