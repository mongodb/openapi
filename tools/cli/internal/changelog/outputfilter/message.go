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
package outputfilter

import (
	"regexp"
)

func transformMessage(entry *Entry) *Entry {
	text := entry.Text
	text = removeResponseStatusCodes(text)
	text = setValueSet(text)
	text = setValueRemoved(text)
	text = removeInlineSchemaIndex(text)
	text = removeRedundantOneOfAllOf(text)
	entry.Text = text

	return entry
}

func removeRedundantOneOfAllOf(text string) string {
	// /oneOf/components/schemas/<ViewName>/
	re := regexp.MustCompile(`/oneOf/components/schemas/[^/]+/`)
	text = re.ReplaceAllString(text, "")

	re = regexp.MustCompile(`/allOf/components/schemas/[^/]+/`)
	text = re.ReplaceAllString(text, "")

	re = regexp.MustCompile(`oneOf\[#/components/schemas/[^/]+\]/`)
	text = re.ReplaceAllString(text, "")

	re = regexp.MustCompile(`allOf\[#/components/schemas/[^/]+\]/`)
	text = re.ReplaceAllString(text, "")

	return text
}

// removeResponseStatusCodes removes the status codes from the response messages
func removeResponseStatusCodes(text string) string {
	// to the response with the '200' status
	re := regexp.MustCompile(` property for the response status '\d{3}'`)
	text = re.ReplaceAllString(text, " property")

	re = regexp.MustCompile(` to the response with the '\d{3}' status`)
	text = re.ReplaceAllString(text, " to the response")

	re = regexp.MustCompile(` from the response with the '\d{3}' status`)
	text = re.ReplaceAllString(text, " from the response")

	re = regexp.MustCompile(` list for the response status \d{3}`)
	text = re.ReplaceAllString(text, " list for the response")

	re = regexp.MustCompile(` for the status '\d{3}'`)
	text = re.ReplaceAllString(text, "")

	return text
}

func setValueSet(text string) string {
	re := regexp.MustCompile(`default value( was)? changed from 'null' to ('.+')`)
	text = re.ReplaceAllString(text, "default value was set to $2")

	return text
}

func setValueRemoved(text string) string {
	re := regexp.MustCompile(`default value( was)? changed from '.+' to 'null'`)
	text = re.ReplaceAllString(text, "default value was removed")

	return text
}

func removeInlineSchemaIndex(text string) string {
	re := regexp.MustCompile(`BaseSchema\[\d+]:`)
	text = re.ReplaceAllString(text, "")

	re = regexp.MustCompile(`RevisionSchema\[\d+]:`)
	text = re.ReplaceAllString(text, "")

	return text
}
