package resources

import (
	"fmt"
	"net/url"
	"strings"
)

// parseSpecURI parses a resource URI and validates that it uses the openapi://specs/ base.
// It is the shared entry point for all URI parsing in this package.
func parseSpecURI(uri string) (*url.URL, error) {
	u, err := url.Parse(uri)
	if err != nil || u.Scheme != "openapi" || u.Host != "specs" {
		return nil, fmt.Errorf("invalid resource URI %q: must use openapi://specs/ scheme", uri)
	}
	return u, nil
}

// aliasFromURI extracts the alias from openapi://specs/{alias}.
// Returns an error if the path has extra segments or the alias is empty.
func aliasFromURI(uri string) (string, error) {
	u, err := parseSpecURI(uri)
	if err != nil {
		return "", fmt.Errorf("invalid resource URI %q: expected openapi://specs/{alias}", uri)
	}
	parts := strings.Split(strings.TrimPrefix(u.Path, "/"), "/")
	if len(parts) != 1 || parts[0] == "" {
		return "", fmt.Errorf("invalid resource URI %q: expected openapi://specs/{alias}", uri)
	}
	return parts[0], nil
}

// aliasAndTagFromURI extracts the alias and tag name from openapi://specs/{alias}/tags/{tagName}.
// The tag name is percent-decoded so agents can use tag names as they appear in the spec.
func aliasAndTagFromURI(uri string) (alias, tagName string, err error) {
	u, err := parseSpecURI(uri)
	if err != nil {
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
