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
	"encoding/json"
	"fmt"
	"sort"
	"strconv"

	"github.com/mongodb/openapi/tools/cli/internal/changelog"
	"github.com/mongodb/openapi/tools/cli/internal/cli/flag"
	"github.com/mongodb/openapi/tools/cli/internal/cli/usage"
	"github.com/spf13/cobra"
)

const (
	backwardCompatibleColor    = "#47a249"
	notBackwardCompatibleColor = "#b51818"
	specCorrectionColor        = "#ffa500"
	parseFull                  = "full"
	attachmentTypeDefault      = "default"
	batchSize                  = 100
)

// Message represents the overall structure of the SLACK message JSON.
type Message struct {
	Channel     string        `json:"channel"`
	ThreadTS    string        `json:"thread_ts,omitempty"`
	Parse       string        `json:"parse"`
	Attachments []*Attachment `json:"attachments"`
}

// Attachment represents the structure of each attachment in the JSON.
type Attachment struct {
	Text           string `json:"text"`
	Color          string `json:"color"`
	AttachmentType string `json:"attachment_type"`
}

type SlackOpts struct {
	path      string
	messageID string
	channelID string
}

func (o *SlackOpts) Run() error {
	entries, err := changelog.NewEntriesFromPath(o.path)
	if err != nil {
		return err
	}

	message := o.generateMessage(entries)
	metadataBytes, err := json.MarshalIndent(message, "", "  ")
	if err != nil {
		return err
	}

	fmt.Println(string(metadataBytes))
	return nil
}

func (o *SlackOpts) generateMessage(entries []*changelog.Entry) []*Message {
	attachments := make([]*Attachment, 0)
	for _, entry := range entries {
		for _, path := range entry.Paths {
			for _, version := range path.Versions {
				attachments = append(attachments, newAttachmentFromVersion(path, version)...)
			}
		}
	}

	return newMessagesFromAttachments(orderAttachments(attachments), o.channelID, o.messageID, batchSize)
}

// newMessagesFromAttachments creates a slice of messages from the attachments.
// Slack API has a limit of 100 attachments per message, so we need to split the attachments into multiple messages.
func newMessagesFromAttachments(attachments []*Attachment, channelID, messageID string, batchSize int) []*Message {
	numAttachments := len(attachments)
	if numAttachments <= batchSize {
		return []*Message{
			{
				Channel:     channelID,
				ThreadTS:    messageID,
				Parse:       parseFull,
				Attachments: attachments,
			},
		}
	}

	numBatches := (numAttachments + batchSize - 1) / batchSize
	messages := make([]*Message, 0)
	for i := 0; i < numBatches; i++ {
		start := i * batchSize
		end := (i + 1) * batchSize
		if end > numAttachments {
			end = numAttachments
		}

		batchAttachments := attachments[start:end]
		message := &Message{
			Channel:     channelID,
			ThreadTS:    messageID,
			Parse:       parseFull,
			Attachments: batchAttachments,
		}
		messages = append(messages, message)
	}

	return messages
}

// orderAttachments orders the attachments by backward compatibility.
// The attachments that are not backward compatible are shown first.
func orderAttachments(attachments []*Attachment) []*Attachment {
	sort.Slice(attachments, func(i, j int) bool {
		return attachments[i].Color == notBackwardCompatibleColor && attachments[j].Color != notBackwardCompatibleColor
	})
	return attachments
}

func newAttachmentFromVersion(path *changelog.Path, version *changelog.Version) []*Attachment {
	attachments := make([]*Attachment, 0)
	for _, change := range version.Changes {
		attachments = append(attachments, newAttachmentFromChange(version.Version, path.HTTPMethod, path.URI, version.ChangeType, change))
	}

	return attachments
}

func newAttachmentFromChange(version, method, path, changeType string, change *changelog.Change) *Attachment {
	return &Attachment{
		Text: newAttachmentText(version, method, path, changeType, change.Code, change.Description,
			strconv.FormatBool(change.HideFromChangelog)),
		Color:          newColorFromBackwardCompatible(change.BackwardCompatible, change.HideFromChangelog),
		AttachmentType: attachmentTypeDefault,
	}
}

func newAttachmentText(version, method, path, changeType, changeCode, change, hiddenFromChangelog string) string {
	return fmt.Sprintf(
		"\n• *Version*: `%s` | *Hidden from Changelog*: `%s`\n• *Path*: `%s %s`\n• *Change Type*: `%s` | *Change Code*: `%s`\n• *Change*: `%s`",
		version, hiddenFromChangelog, method, path, changeType, changeCode, change)
}

func newColorFromBackwardCompatible(backwardCompatible, hideFromChangelog bool) string {
	if hideFromChangelog {
		return specCorrectionColor
	}

	if backwardCompatible {
		return backwardCompatibleColor
	}
	return notBackwardCompatibleColor
}

// SlackBuilder constructs the command for converting the changelog entries into a format that can be used with Slack APIs.
// changelog convert slack -p path_to_changelog -m message_id 1503435956.000247 -c channel_id C061EG9SL
func SlackBuilder() *cobra.Command {
	opts := &SlackOpts{}

	cmd := &cobra.Command{
		Use:     "slack -b path_to_changelo -m message_id -c channel_id",
		Aliases: []string{"generate"},
		Short:   "Convert the changelog entries into a format that can be used with Slack APIs.",
		Args:    cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.path, flag.Path, flag.PathShort, "", usage.Path)
	cmd.Flags().StringVarP(&opts.channelID, flag.ChannelID, flag.ChannelIDShort, "", usage.SlackChannelID)
	cmd.Flags().StringVar(&opts.messageID, flag.MessageID, "", usage.MessageID)
	_ = cmd.MarkFlagRequired(flag.Path)
	_ = cmd.MarkFlagRequired(flag.ChannelID)
	return cmd
}
