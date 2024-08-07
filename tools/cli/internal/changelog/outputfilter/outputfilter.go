package outputfilter

import (
	"encoding/json"

	"github.com/tufin/oasdiff/checker"
	"github.com/tufin/oasdiff/formatters"
	"github.com/tufin/oasdiff/load"
)

const lan = "en" // language for localized output

type Entry struct {
	ID          string `json:"id"`
	Text        string `json:"text"`
	Level       int    `json:"level"`
	Operation   string `json:"operation"`
	OperationID string `json:"operationId"`
	Path        string `json:"path"`
	Source      string `json:"source"`
	Section     string `json:"section"`
}

func NewChangelogEntries(checkers checker.Changes, specInfoPair *load.SpecInfoPair) ([]*Entry, error) {
	formatter, err := formatters.Lookup("json", formatters.FormatterOpts{
		Language: lan,
	})
	if err != nil {
		return nil, err
	}

	bytes, err := formatter.RenderChangelog(checkers, formatters.RenderOpts{ColorMode: checker.ColorAuto}, specInfoPair)
	if err != nil {
		return nil, err
	}

	var entries []*Entry
	err = json.Unmarshal(bytes, &entries)
	if err != nil {
		return nil, err
	}

	return transformEntries(entries), nil
}

func transformEntries(entries []*Entry) []*Entry {
	for _, entry := range entries {
		transformMessage(entry)
	}

	return entries
}
