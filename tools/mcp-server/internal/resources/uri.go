package resources

import (
	"fmt"
	"net/url"
	"strings"
)

// aliasFromURI extracts the alias from openapi://specs/{alias}.
func aliasFromURI(uri string) (string, error) {
	u, err := url.Parse(uri)
	if err != nil {
		return "", fmt.Errorf("invalid resource URI %q: expected openapi://specs/{alias}", uri)
	}
	alias := strings.TrimPrefix(u.Path, "/")
	if alias == "" {
		return "", fmt.Errorf("invalid resource URI %q: expected openapi://specs/{alias}", uri)
	}
	return alias, nil
}

// aliasAndTagFromURI extracts the alias and tag name from openapi://specs/{alias}/tags/{tagName}.
// The tag name is percent-decoded to handle names with spaces or special characters.
func aliasAndTagFromURI(uri string) (alias, tagName string, err error) {
	u, parseErr := url.Parse(uri)
	if parseErr != nil {
		return "", "", fmt.Errorf("invalid resource URI %q: expected openapi://specs/{alias}/tags/{tagName}", uri)
	}

	// path: /{alias}/tags/{tagName}
	parts := strings.SplitN(strings.TrimPrefix(u.Path, "/"), "/", 3)
	if len(parts) != 3 || parts[0] == "" || parts[1] != "tags" || parts[2] == "" {
		return "", "", fmt.Errorf("invalid resource URI %q: expected openapi://specs/{alias}/tags/{tagName}", uri)
	}

	tagName, err = url.PathUnescape(parts[2])
	if err != nil {
		return "", "", fmt.Errorf("invalid tag name in URI %q: %w", uri, err)
	}
	return parts[0], tagName, nil
}
