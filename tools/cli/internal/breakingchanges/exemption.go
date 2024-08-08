// Copyright 2024 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package breakingchanges

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
)

type Exemption struct {
	BreakingChangeDescription string `yaml:"breaking_change_description"`
	ExemptUntil               string `yaml:"exempt_until"`
	Reason                    string `yaml:"reason"`
	HideFromChangelog         string `yaml:"hide_from_changelog"`
}

func _getDuplicatedV1Entries(exemption string) []string {
	if strings.Contains(exemption, "api/atlas/v2") {
		return []string{
			strings.Replace(exemption, "api/atlas/v2", "api/atlas/v1.0", -1),
			strings.Replace(exemption, "api/atlas/v2", "api/atlas/v1.5", -1),
		}
	}
	return []string{}
}

func _isWithinExpirationDate(exemption Exemption) bool {
	exemptUntil, err := time.Parse("2006-01-02", exemption.ExemptUntil)
	if err != nil {
		log.Printf("Error parsing date: %v", err)
		return false
	}
	date := time.Now().AddDate(0, 0, -1)
	return exemptUntil.After(date) || exemptUntil.Equal(date)
}

func _transformComponentEntry(breakingChangeDescription string) string {
	if strings.Contains(breakingChangeDescription, "api-schema-removed") && !strings.Contains(breakingChangeDescription, "in components") {
		return fmt.Sprintf("in components %s", breakingChangeDescription)
	}
	return breakingChangeDescription
}

func GenerateExemptionsFile(sourceDir string, exemptionsPath string, ignoreExpiration bool) error {
	var validExemptions []string
	if exemptionsPath == "" {
		return fmt.Errorf("could not find exemptions file path")
	}

	log.Printf("Generating exemptions from file in %s", exemptionsPath)
	data, err := os.ReadFile(exemptionsPath)
	if err != nil {
		return fmt.Errorf("could not read exemptions file: %v", err)
	}

	var exemptions []Exemption
	if err := yaml.Unmarshal(data, &exemptions); err != nil {
		return fmt.Errorf("could not unmarshal exemptions: %v", err)
	}

	for _, exemption := range exemptions {
		exemptionLine := _transformComponentEntry(exemption.BreakingChangeDescription)
		if ignoreExpiration || _isWithinExpirationDate(exemption) {
			validExemptions = append(validExemptions, exemptionLine)
			validExemptions = append(validExemptions, _getDuplicatedV1Entries(exemptionLine)...)
		}
	}

	outputPath := filepath.Join(sourceDir, "exemptions.txt")
	file, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("could not create exemptions file: %v", err)
	}
	defer file.Close()

	for _, validExemption := range validExemptions {
		if _, err := file.WriteString(fmt.Sprintf("%s\n", validExemption)); err != nil {
			return fmt.Errorf("could not write to exemptions file: %v", err)
		}
	}

	return nil
}
