package resources

import (
	"fmt"
	"net/url"
	"strings"
)

// aliasFromURI extracts the alias from openapi://specs/{alias}.
// Returns an error if the scheme, host, or path structure does not match exactly.
func aliasFromURI(uri string) (string, error) {
	u, err := url.Parse(uri)
	if err != nil || u.Scheme != "openapi" || u.Host != "specs" {
		return "", fmt.Errorf("invalid resource URI %q: expected openapi://specs/{alias}", uri)
	}
	parts := strings.Split(strings.TrimPrefix(u.Path, "/"), "/")
	if len(parts) != 1 || parts[0] == "" {
		return "", fmt.Errorf("invalid resource URI %q: expected openapi://specs/{alias}", uri)
	}
	return parts[0], nil
}
