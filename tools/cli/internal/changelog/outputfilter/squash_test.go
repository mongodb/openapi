package outputfilter

import (
	"reflect"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNewEntriesMapPerIDAndOperationID(t *testing.T) {
	testCases := []struct {
		name    string
		entries []*Entry
		want    map[string]map[string][]*Entry
	}{
		{
			name:    "Empty entries",
			entries: []*Entry{},
			want:    map[string]map[string][]*Entry{},
		},
		{
			name: "Single entry",
			entries: []*Entry{
				{ID: "1", OperationID: "op1"},
			},
			want: map[string]map[string][]*Entry{
				"1": {
					"op1": []*Entry{
						{ID: "1", OperationID: "op1"},
					},
				},
			},
		},
		{
			name: "Multiple entries with same ID",
			entries: []*Entry{
				{ID: "1", OperationID: "op1"},
				{ID: "1", OperationID: "op2"},
			},
			want: map[string]map[string][]*Entry{
				"1": {
					"op1": []*Entry{
						{ID: "1", OperationID: "op1"},
					},
					"op2": []*Entry{
						{ID: "1", OperationID: "op2"},
					},
				},
			},
		},

		{
			name: "Multiple entries with same ID and OperationID",
			entries: []*Entry{
				{ID: "1", OperationID: "op1"},
				{ID: "1", OperationID: "op1"},
			},
			want: map[string]map[string][]*Entry{
				"1": {
					"op1": []*Entry{
						{ID: "1", OperationID: "op1"},
						{ID: "1", OperationID: "op1"},
					},
				},
			},
		},
		{
			name: "Multiple entries with different IDs",
			entries: []*Entry{
				{ID: "1", OperationID: "op1"},
				{ID: "2", OperationID: "op2"},
				{ID: "1", OperationID: "op3"},
				{ID: "2", OperationID: "op4"},
			},
			want: map[string]map[string][]*Entry{
				"1": {
					"op1": []*Entry{
						{ID: "1", OperationID: "op1"},
					},
					"op3": []*Entry{
						{ID: "1", OperationID: "op3"},
					},
				},
				"2": {
					"op2": []*Entry{
						{ID: "2", OperationID: "op2"},
					},
					"op4": []*Entry{
						{ID: "2", OperationID: "op4"},
					},
				},
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			got := newEntriesMapPerIDAndOperationID(tc.entries)
			if !reflect.DeepEqual(got, tc.want) {
				t.Errorf("got %v, want %v", got, tc.want)
			}
		})
	}
}

func TestExtractExactValuesOrFail(t *testing.T) {
	testCases := []struct {
		name                   string
		operation              string
		entry                  *Entry
		expectedNumberOfValues int
		want                   []string
		wantErr                require.ErrorAssertionFunc
	}{
		{
			name:                   "No values",
			operation:              "test",
			entry:                  &Entry{ID: "1", OperationID: "op1", Text: "No values"},
			expectedNumberOfValues: 0,
			want:                   []string{},
			wantErr:                require.NoError,
		},
		{
			name:                   "Single value",
			operation:              "test",
			entry:                  &Entry{ID: "1", OperationID: "op1", Text: "Value: 'test'"},
			expectedNumberOfValues: 1,
			want:                   []string{"test"},
			wantErr:                require.NoError,
		},
		{
			name:      "Multiple values",
			operation: "test",
			entry: &Entry{
				ID:          "1",
				OperationID: "op1",
				Text:        "added the new 'GROUP_USER_ADMIN' enum value to the request property '/items/roles/items/'"},
			expectedNumberOfValues: 2,
			want:                   []string{"GROUP_USER_ADMIN", "/items/roles/items/"},
			wantErr:                require.NoError,
		},
		{
			name:                   "Incorrect number of values",
			operation:              "test",
			entry:                  &Entry{ID: "1", OperationID: "op1", Text: "Values: 'test1', 'test2'"},
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
		entries                []*Entry
		expectedNumberOfValues int
		squashIdx              int
		want                   map[string]squashedEntries
		wantErr                require.ErrorAssertionFunc
	}{
		{
			name:                   "Empty entries",
			operation:              "test",
			entries:                []*Entry{},
			expectedNumberOfValues: 0,
			squashIdx:              0,
			want:                   map[string]squashedEntries{},
			wantErr:                require.NoError,
		},
		{
			name:      "Single entry",
			operation: "test",
			entries: []*Entry{
				{ID: "1", OperationID: "op1", Text: "Value: 'test'"},
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
			entries: []*Entry{
				{ID: "1", OperationID: "op1", Text: "Value: 'test1'"},
				{ID: "1", OperationID: "op1", Text: "Value: 'test2'"},
				{ID: "1", OperationID: "op1", Text: "Value: 'test3'"},
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
