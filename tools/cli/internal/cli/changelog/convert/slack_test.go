// Copyright 2024 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package convert

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewAttachmentText(t *testing.T) {
	tests := []struct {
		name                string
		version             string
		method              string
		path                string
		changeCode          string
		change              string
		backwardCompatible  string
		hiddenFromChangelog string
		expected            string
	}{
		{
			name:                "Backward Compatible Change",
			version:             "2024-08-05",
			method:              "GET",
			path:                "/api/atlas/v2/groups/{groupId}/clusters",
			changeCode:          "response-property-enum-value-added",
			change:              "added the new DUBLIN_IRL, FRANKFURT_DEU, LONDON_GBR enum values",
			backwardCompatible:  "true",
			hiddenFromChangelog: "false",
			expected:            "\n• *Version*: `2024-08-05`\n• *Path*: `GET /api/atlas/v2/groups/{groupId}/clusters`\n• *Hidden from Changelog*: `false`\n• *Change Code*: `response-property-enum-value-added`\n• *Change*: `added the new DUBLIN_IRL, FRANKFURT_DEU, LONDON_GBR enum values`\n• *Backward Compatible*: `true`", //nolint:lll //Test string
		},
		{
			name:                "Non-Backward Compatible Change",
			version:             "2024-08-05",
			method:              "POST",
			path:                "/api/atlas/v2/groups/{groupId}/clusters",
			changeCode:          "new-optional-request-property",
			change:              "added the new optional request property replicaSetScalingStrategy",
			hiddenFromChangelog: "true",
			backwardCompatible:  "false",
			expected:            "\n• *Version*: `2024-08-05`\n• *Path*: `POST /api/atlas/v2/groups/{groupId}/clusters`\n• *Hidden from Changelog*: `true`\n• *Change Code*: `new-optional-request-property`\n• *Change*: `added the new optional request property replicaSetScalingStrategy`\n• *Backward Compatible*: `false`", //nolint:lll //Test string
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			actual := newAttachmentText(tt.version, tt.method, tt.path, tt.changeCode, tt.change, tt.backwardCompatible, tt.hiddenFromChangelog)
			assert.Equal(t, tt.expected, actual)
		})
	}
}
func TestNewMessagesFromAttachments(t *testing.T) {
	tests := []struct {
		name        string
		attachments []*Attachment
		channelID   string
		messageID   string
		batchSize   int
		expected    []*Message
	}{
		{
			name: "Single Batch",
			attachments: []*Attachment{
				{
					Text:           "Attachment 1",
					Color:          "#47a249",
					AttachmentType: "default",
				},
				{
					Text:           "Attachment 2",
					Color:          "#b51818",
					AttachmentType: "default",
				},
			},
			channelID: "channel1",
			messageID: "message1",
			batchSize: 100,
			expected: []*Message{
				{
					Channel:  "channel1",
					ThreadTS: "message1",
					Parse:    parseFull,
					Attachments: []*Attachment{
						{
							Text:           "Attachment 1",
							Color:          "#47a249",
							AttachmentType: "default",
						},
						{
							Text:           "Attachment 2",
							Color:          "#b51818",
							AttachmentType: "default",
						},
					},
				},
			},
		},
		{
			name: "Multiple Batches",
			attachments: []*Attachment{
				{
					Text:           "Attachment 1",
					Color:          "#47a249",
					AttachmentType: "default",
				},
				{
					Text:           "Attachment 2",
					Color:          "#b51818",
					AttachmentType: "default",
				},
				{
					Text:           "Attachment 3",
					Color:          "#47a249",
					AttachmentType: "default",
				},
				{
					Text:           "Attachment 4",
					Color:          "#b51818",
					AttachmentType: "default",
				},
			},
			channelID: "channel2",
			messageID: "message2",
			batchSize: 2,
			expected: []*Message{
				{
					Channel:  "channel2",
					ThreadTS: "message2",
					Parse:    parseFull,
					Attachments: []*Attachment{
						{
							Text:           "Attachment 1",
							Color:          "#47a249",
							AttachmentType: "default",
						},
						{
							Text:           "Attachment 2",
							Color:          "#b51818",
							AttachmentType: "default",
						},
					},
				},
				{
					Channel:  "channel2",
					ThreadTS: "message2",
					Parse:    parseFull,
					Attachments: []*Attachment{
						{
							Text:           "Attachment 3",
							Color:          "#47a249",
							AttachmentType: "default",
						},
						{
							Text:           "Attachment 4",
							Color:          "#b51818",
							AttachmentType: "default",
						},
					},
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			actual := newMessagesFromAttachments(tt.attachments, tt.channelID, tt.messageID, tt.batchSize)
			assert.Equal(t, tt.expected, actual)
		})
	}
}
func TestNewColorFromBackwardCompatible(t *testing.T) {
	tests := []struct {
		name               string
		backwardCompatible bool
		expectedColor      string
	}{
		{
			name:               "Backward Compatible True",
			backwardCompatible: true,
			expectedColor:      "#47a249",
		},
		{
			name:               "Backward Compatible False",
			backwardCompatible: false,
			expectedColor:      "#b51818",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			actual := newColorFromBackwardCompatible(tt.backwardCompatible)
			assert.Equal(t, tt.expectedColor, actual)
		})
	}
}
