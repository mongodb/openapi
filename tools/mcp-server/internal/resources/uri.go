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
