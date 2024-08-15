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
	"strings"
	"time"

	"github.com/spf13/afero"
	"gopkg.in/yaml.v3"
)

type Exemption struct {
	BreakingChangeDescription string `yaml:"breaking_change_description"`
	ExemptUntil               string `yaml:"exempt_until"`
	Reason                    string `yaml:"reason"`
	HideFromChangelog         string `yaml:"hide_from_changelog,omitempty"`
}

func (e *Exemption) isHidden() bool {
	return e.HideFromChangelog == "true"
}

func getDuplicatedV1Entries(exemption string) []string {
	if strings.Contains(exemption, "api/atlas/v2") {
		return []string{
			strings.ReplaceAll(exemption, "api/atlas/v2", "api/atlas/v1.0"),
			strings.ReplaceAll(exemption, "api/atlas/v2", "api/atlas/v1.5"),
		}
	}
	return []string{}
}

func isWithinExpirationDate(exemption Exemption) bool {
	exemptUntil, err := time.Parse("2006-01-02", exemption.ExemptUntil)
	if err != nil {
		log.Printf("Error parsing date: %v", err)
		return false
	}
	date := time.Now().AddDate(0, 0, -1)
	return exemptUntil.After(date) || exemptUntil.Equal(date)
}

func transformComponentEntry(breakingChangeDescription string) string {
	if strings.Contains(breakingChangeDescription, "api-schema-removed") && !strings.Contains(breakingChangeDescription, "in components") {
		return fmt.Sprintf("in components %s", breakingChangeDescription)
	}
	return breakingChangeDescription
}

// GetValidExemptionsList returns a list of exemptions. If ignoreExpiration is set to true, it will return all exemptions.
func GetValidExemptionsList(exemptionsPath string, ignoreExpiration bool, fs afero.Fs) ([]Exemption, error) {
	if exemptionsPath == "" {
		return nil, fmt.Errorf("could not find exemptions file path")
	}

	log.Printf("Generating exemptions from file in %s", exemptionsPath)
	exemptionsFile, err := fs.Open(exemptionsPath)
	if err != nil {
		return nil, fmt.Errorf("could not open exemptions file: %v", err)
	}
	defer exemptionsFile.Close()
	data, err := afero.ReadAll(exemptionsFile)
	if err != nil {
		return nil, fmt.Errorf("could not read exemptions file: %v", err)
	}

	var exemptions []Exemption
	if err := yaml.Unmarshal(data, &exemptions); err != nil {
		return nil, fmt.Errorf("could not unmarshal exemptions: %v", err)
	}

	var validExemptions []Exemption
	for _, exemption := range exemptions {
		if ignoreExpiration || isWithinExpirationDate(exemption) {
			validExemptions = append(validExemptions, exemption)
		}
	}
	return validExemptions, nil
}

// CreateExemptionsFile generates a file with the exemptions in the oasdiff breaking changes format.
func CreateExemptionsFile(outputPath, exemptionsPath string, ignoreExpiration bool, fs afero.Fs) error {
	validExemptions, err := GetValidExemptionsList(exemptionsPath, ignoreExpiration, fs)
	if err != nil {
		return fmt.Errorf("could not get valid exemptions list: %v", err)
	}

	var transformedExemptions = []string{}
	for _, validExemption := range validExemptions {
		exemptionLine := transformComponentEntry(validExemption.BreakingChangeDescription)
		transformedExemptions = append(transformedExemptions, exemptionLine)
		transformedExemptions = append(transformedExemptions, getDuplicatedV1Entries(exemptionLine)...)
	}

	file, err := fs.Create(outputPath)
	if err != nil {
		return fmt.Errorf("could not create exemptions file: %v", err)
	}
	defer file.Close()

	for _, exemption := range transformedExemptions {
		if _, err := fmt.Fprintf(file, "%s\n", exemption); err != nil {
			return fmt.Errorf("could not write to exemptions file: %v", err)
		}
	}
	log.Printf("Exemptions file generated in %s\n", outputPath)
	return nil
}

// GetHiddenExemptions returns a list of exemptions that have 'HideFromChangelog' set to true.
func GetHiddenExemptions(exemptions []Exemption) []Exemption {
	// Get only exemptions that have 'HideFromChangelog' set to true
	exemptionsMarkedHidden := []Exemption{}
	for _, exemption := range exemptions {
		if exemption.isHidden() {
			exemptionsMarkedHidden = append(exemptionsMarkedHidden, exemption)
		}
	}
	return exemptionsMarkedHidden
}
