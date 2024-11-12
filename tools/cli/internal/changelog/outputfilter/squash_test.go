package outputfilter

import (
	"reflect"
	"sort"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNewEntriesMapPerIDAndOperationID(t *testing.T) {
	testCases := []struct {
		name       string
		entries    []*OasDiffEntry
		want       map[string]map[string][]*OasDiffEntry
		wantHidden map[string]map[string][]*OasDiffEntry
	}{
		{
			name:       "Empty entries",
			entries:    []*OasDiffEntry{},
			want:       map[string]map[string][]*OasDiffEntry{},
			wantHidden: map[string]map[string][]*OasDiffEntry{},
		},
		{
			name: "Single entry",
			entries: []*OasDiffEntry{
				{ID: "response-write-only-property-enum-value-added", OperationID: "op1"},
			},
			want: map[string]map[string][]*OasDiffEntry{
				"response-write-only-property-enum-value-added": {
					"op1": []*OasDiffEntry{
						{ID: "response-write-only-property-enum-value-added", OperationID: "op1"},
					},
				},
			},
			wantHidden: map[string]map[string][]*OasDiffEntry{
				"response-write-only-property-enum-value-added": {}},
		},
		{
			name: "Multiple entries with same ID",
			entries: []*OasDiffEntry{
				{ID: "response-write-only-property-enum-value-added", OperationID: "op1"},
				{ID: "response-write-only-property-enum-value-added", OperationID: "op2"},
			},
			want: map[string]map[string][]*OasDiffEntry{
				"response-write-only-property-enum-value-added": {
					"op1": []*OasDiffEntry{
						{ID: "response-write-only-property-enum-value-added", OperationID: "op1"},
					},
					"op2": []*OasDiffEntry{
						{ID: "response-write-only-property-enum-value-added", OperationID: "op2"},
					},
				},
			},
			wantHidden: map[string]map[string][]*OasDiffEntry{
				"response-write-only-property-enum-value-added": {}},
		},
		{
			name: "Multiple entries with same ID and OperationID",
			entries: []*OasDiffEntry{
				{ID: "response-write-only-property-enum-value-added", OperationID: "op1"},
				{ID: "response-write-only-property-enum-value-added", OperationID: "op1"},
			},
			want: map[string]map[string][]*OasDiffEntry{
				"response-write-only-property-enum-value-added": {
					"op1": []*OasDiffEntry{
						{ID: "response-write-only-property-enum-value-added", OperationID: "op1"},
						{ID: "response-write-only-property-enum-value-added", OperationID: "op1"},
					},
				},
			},
			wantHidden: map[string]map[string][]*OasDiffEntry{
				"response-write-only-property-enum-value-added": {}},
		},
		{
			name: "Multiple entries with different IDs",
			entries: []*OasDiffEntry{
				{ID: "response-write-only-property-enum-value-added", OperationID: "op1"},
				{ID: "request-write-only-property-enum-value-added", OperationID: "op2"},
				{ID: "response-write-only-property-enum-value-added", OperationID: "op3"},
				{ID: "request-write-only-property-enum-value-added", OperationID: "op4"},
			},
			want: map[string]map[string][]*OasDiffEntry{
				"response-write-only-property-enum-value-added": {
					"op1": []*OasDiffEntry{
						{ID: "response-write-only-property-enum-value-added", OperationID: "op1"},
					},
					"op3": []*OasDiffEntry{
						{ID: "response-write-only-property-enum-value-added", OperationID: "op3"},
					},
				},
				"request-write-only-property-enum-value-added": {
					"op2": []*OasDiffEntry{
						{ID: "request-write-only-property-enum-value-added", OperationID: "op2"},
					},
					"op4": []*OasDiffEntry{
						{ID: "request-write-only-property-enum-value-added", OperationID: "op4"},
					},
				},
			},
			wantHidden: map[string]map[string][]*OasDiffEntry{
				"response-write-only-property-enum-value-added": {},
				"request-write-only-property-enum-value-added":  {},
			},
		},
		{
			name: "Hidden entries",
			entries: []*OasDiffEntry{
				{ID: "response-write-only-property-enum-value-added", OperationID: "op1", HideFromChangelog: true},
				{ID: "response-write-only-property-enum-value-added", OperationID: "op2", HideFromChangelog: true},
			},
			want: map[string]map[string][]*OasDiffEntry{
				"response-write-only-property-enum-value-added": {}},
			wantHidden: map[string]map[string][]*OasDiffEntry{
				"response-write-only-property-enum-value-added": {
					"op1": []*OasDiffEntry{
						{ID: "response-write-only-property-enum-value-added", OperationID: "op1", HideFromChangelog: true},
					},
					"op2": []*OasDiffEntry{
						{ID: "response-write-only-property-enum-value-added", OperationID: "op2", HideFromChangelog: true},
					},
				},
			},
		},
		{
			name: "Mixed hidden and non-hidden entries",
			entries: []*OasDiffEntry{
				{ID: "response-write-only-property-enum-value-added", OperationID: "op1"},
				{ID: "response-write-only-property-enum-value-added", OperationID: "op2", HideFromChangelog: true},
				{ID: "response-write-only-property-enum-value-added", OperationID: "op3"},
				{ID: "response-write-only-property-enum-value-added", OperationID: "op4", HideFromChangelog: true},
			},
			want: map[string]map[string][]*OasDiffEntry{
				"response-write-only-property-enum-value-added": {
					"op1": []*OasDiffEntry{
						{ID: "response-write-only-property-enum-value-added", OperationID: "op1"},
					},
					"op3": []*OasDiffEntry{
						{ID: "response-write-only-property-enum-value-added", OperationID: "op3"},
					},
				},
			},
			wantHidden: map[string]map[string][]*OasDiffEntry{
				"response-write-only-property-enum-value-added": {
					"op2": []*OasDiffEntry{
						{ID: "response-write-only-property-enum-value-added", OperationID: "op2", HideFromChangelog: true},
					},
					"op4": []*OasDiffEntry{
						{ID: "response-write-only-property-enum-value-added", OperationID: "op4", HideFromChangelog: true},
					},
				},
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			got, gotHidden := newEntriesMapPerIDAndOperationID(tc.entries)
			if !reflect.DeepEqual(got, tc.want) {
				t.Errorf("got %v, want %v", got, tc.want)
			}
			if !reflect.DeepEqual(gotHidden, tc.wantHidden) {
				t.Errorf("gotHidden %v, wantHidden %v", gotHidden, tc.wantHidden)
			}
		})
	}
}

func TestExtractExactValuesOrFail(t *testing.T) {
	testCases := []struct {
		name                   string
		operation              string
		entry                  *OasDiffEntry
		expectedNumberOfValues int
		want                   []string
		wantErr                require.ErrorAssertionFunc
	}{
		{
			name:                   "No values",
			operation:              "test",
			entry:                  &OasDiffEntry{ID: "response-write-only-property-enum-value-added", OperationID: "op1", Text: "No values"},
			expectedNumberOfValues: 0,
			want:                   []string{},
			wantErr:                require.NoError,
		},
		{
			name:                   "Single value",
			operation:              "test",
			entry:                  &OasDiffEntry{ID: "response-write-only-property-enum-value-added", OperationID: "op1", Text: "Value: 'test'"},
			expectedNumberOfValues: 1,
			want:                   []string{"test"},
			wantErr:                require.NoError,
		},
		{
			name:      "Multiple values",
			operation: "test",
			entry: &OasDiffEntry{
				ID:          "response-write-only-property-enum-value-added",
				OperationID: "op1",
				Text:        "added the new 'GROUP_USER_ADMIN' enum value to the request property '/items/roles/items/'"},
			expectedNumberOfValues: 2,
			want:                   []string{"GROUP_USER_ADMIN", "/items/roles/items/"},
			wantErr:                require.NoError,
		},
		{
			name:      "Multiple values with empty entries",
			operation: "test",
			entry: &OasDiffEntry{
				ID:          "response-write-only-property-enum-value-added",
				OperationID: "op1",
				Text:        "added the new '' enum value to the request property '/items/roles/items/'"},
			expectedNumberOfValues: 2,
			want:                   []string{"", "/items/roles/items/"},
			wantErr:                require.NoError,
		},
		{
			name:                   "Incorrect number of values",
			operation:              "test",
			entry:                  &OasDiffEntry{ID: "response-write-only-property-enum-value-added", OperationID: "op1", Text: "Values: 'test1', 'test2'"},
			expectedNumberOfValues: 3,
			want:                   nil,
			wantErr:                require.Error,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := extractExactValuesOrFail(tc.operation, tc.entry, tc.expectedNumberOfValues)
			tc.wantErr(t, err)

			if !reflect.DeepEqual(got, tc.want) {
				t.Errorf("got %v, want %v", got, tc.want)
			}
		})
	}
}

func TestNewSquashMap(t *testing.T) {
	testCases := []struct {
		name                   string
		operation              string
		entries                []*OasDiffEntry
		expectedNumberOfValues int
		squashIdx              int
		want                   map[string]squashedEntries
		wantErr                require.ErrorAssertionFunc
	}{
		{
			name:                   "Empty entries",
			operation:              "test",
			entries:                []*OasDiffEntry{},
			expectedNumberOfValues: 0,
			squashIdx:              0,
			want:                   map[string]squashedEntries{},
			wantErr:                require.NoError,
		},
		{
			name:      "Single entry",
			operation: "test",
			entries: []*OasDiffEntry{
				{ID: "response-write-only-property-enum-value-added", OperationID: "op1", Text: "Value: 'test'"},
			},
			expectedNumberOfValues: 1,
			squashIdx:              0,
			want: map[string]squashedEntries{
				"": {
					valuesNotSquashed: []string{""},
					valuesToSquash:    map[string]struct{}{"test": {}},
				},
			},
			wantErr: require.NoError,
		},
		{
			name:      "Multiple entries",
			operation: "test",
			entries: []*OasDiffEntry{
				{ID: "response-write-only-property-enum-value-added", OperationID: "op1", Text: "Value: 'test1'"},
				{ID: "response-write-only-property-enum-value-added", OperationID: "op1", Text: "Value: 'test2'"},
				{ID: "response-write-only-property-enum-value-added", OperationID: "op1", Text: "Value: 'test3'"},
			},
			expectedNumberOfValues: 1,
			squashIdx:              0,
			want: map[string]squashedEntries{
				"": {
					valuesNotSquashed: []string{""},
					valuesToSquash:    map[string]struct{}{"test1": {}, "test2": {}, "test3": {}},
				},
			},
			wantErr: require.NoError,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := newSquashMap(tc.operation, tc.entries, tc.expectedNumberOfValues, tc.squashIdx)
			tc.wantErr(t, err)

			if !reflect.DeepEqual(got, tc.want) {
				t.Errorf("got %v, want %v", got, tc.want)
			}
		})
	}
}

func TestSquashEntries(t *testing.T) {
	testCases := []struct {
		name    string
		entries []*OasDiffEntry
		want    []*OasDiffEntry
	}{
		{
			name:    "Empty entries",
			entries: []*OasDiffEntry{},
			want:    []*OasDiffEntry{},
		},
		{
			name: "Single entry",
			entries: []*OasDiffEntry{
				{
					ID:          "response-write-only-property-enum-value-added",
					OperationID: "op1",
					Text:        "added the new 'ENUM1' enum value to the 'region' response write-only property",
				},
			},
			want: []*OasDiffEntry{
				{
					ID:          "response-write-only-property-enum-value-added",
					OperationID: "op1",
					Text:        "added the new 'ENUM1' enum value to the 'region' response write-only property",
				},
			},
		},
		{
			name: "Multiple entries with same ID and OperationID",
			entries: []*OasDiffEntry{
				{
					ID:          "response-write-only-property-enum-value-added",
					OperationID: "op1",
					Text:        "added the new 'ENUM1' enum value to the 'region' response write-only property",
				},
				{
					ID:          "response-write-only-property-enum-value-added",
					OperationID: "op1",
					Text:        "added the new 'ENUM2' enum value to the 'region' response write-only property",
				},
			},
			want: []*OasDiffEntry{
				{
					ID:          "response-write-only-property-enum-value-added",
					OperationID: "op1",
					Text:        "added the new 'ENUM1, ENUM2' enum values to the 'region' response write-only property",
				},
			},
		},
		{
			name: "Multiple entries with different IDs",
			entries: []*OasDiffEntry{
				{
					ID:          "response-write-only-property-enum-value-added",
					OperationID: "op1",
					Text:        "added the new 'ENUM1' enum value to the 'region' response write-only property",
				},
				{
					ID:          "request-write-only-property-enum-value-added",
					OperationID: "op2",
					Text:        "added the new 'ENUM2' enum value to the 'region' request write-only property",
				},
			},
			want: []*OasDiffEntry{
				{
					ID:          "response-write-only-property-enum-value-added",
					OperationID: "op1",
					Text:        "added the new 'ENUM1' enum value to the 'region' response write-only property",
				},
				{
					ID:          "request-write-only-property-enum-value-added",
					OperationID: "op2",
					Text:        "added the new 'ENUM2' enum value to the 'region' request write-only property",
				},
			},
		},
		{
			name: "Hidden entries",
			entries: []*OasDiffEntry{
				{
					ID:                "response-write-only-property-enum-value-added",
					OperationID:       "op1",
					Text:              "added the new 'ENUM1' enum value to the 'region' response write-only property",
					HideFromChangelog: true,
				},
				{
					ID:                "response-write-only-property-enum-value-added",
					OperationID:       "op1",
					Text:              "added the new 'ENUM2' enum value to the 'region' response write-only property",
					HideFromChangelog: true,
				},
			},
			want: []*OasDiffEntry{
				{
					ID:                "response-write-only-property-enum-value-added",
					OperationID:       "op1",
					Text:              "added the new 'ENUM1, ENUM2' enum values to the 'region' response write-only property",
					HideFromChangelog: true,
				},
			},
		},
		{
			name: "Mixed hidden and non-hidden entries",
			entries: []*OasDiffEntry{
				{
					ID:          "response-write-only-property-enum-value-added",
					OperationID: "op1",
					Text:        "added the new 'ENUM1' enum value to the 'region' response write-only property",
				},
				{
					ID:                "response-write-only-property-enum-value-added",
					OperationID:       "op1",
					Text:              "added the new 'ENUM2' enum value to the 'region' response write-only property",
					HideFromChangelog: true,
				},
				{
					ID:          "response-write-only-property-enum-value-added",
					OperationID: "op1",
					Text:        "added the new 'ENUM3' enum value to the 'region' response write-only property",
				},
				{
					ID:                "response-write-only-property-enum-value-added",
					OperationID:       "op1",
					Text:              "added the new 'ENUM4' enum value to the 'region' response write-only property",
					HideFromChangelog: true,
				},
			},
			want: []*OasDiffEntry{
				{
					ID:          "response-write-only-property-enum-value-added",
					OperationID: "op1",
					Text:        "added the new 'ENUM1, ENUM3' enum values to the 'region' response write-only property",
				},
				{
					ID:                "response-write-only-property-enum-value-added",
					OperationID:       "op1",
					Text:              "added the new 'ENUM2, ENUM4' enum values to the 'region' response write-only property",
					HideFromChangelog: true,
				},
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := squashEntries(tc.entries)
			require.NoError(t, err)
			sortEntries(got)
			sortEntries(tc.want)
			require.Equal(t, tc.want, got)
		})
	}
}

// sortEntries sorts the entries by their ID and OperationID.
func sortEntries(entries []*OasDiffEntry) {
	sort.SliceStable(entries, func(i, j int) bool {
		if entries[i].ID != entries[j].ID {
			return entries[i].ID < entries[j].ID
		}
		return entries[i].OperationID < entries[j].OperationID
	})
}
