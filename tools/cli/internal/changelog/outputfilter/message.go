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
