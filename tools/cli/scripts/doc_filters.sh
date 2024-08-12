#!/bin/sh

echo "# List of filters applied to the OpenAPI specification"
echo "These examples are automatically generated from filters docs."

# Expected format:
# // Filter: InfoFilter is a filter that modifies the Info object in the OpenAPI spec.

echo "# OpenAPI Filters"

echo "## Why filtering OpenAPI?"

echo "The Atlas Admin API OpenAPI specifications are used not only to document REST endpoints, but also to capture extra functionality such as Versioning information, team ownership, and more. This extra information is used to then correctly generate the OpenAPI respective to each version of the API."

echo "## What is the general filter purpose?"
echo " - Filtering per environment, so that only the endpoints that are available in that environment are shown."
echo " - Filtering per version, so that only the endpoints that are available in that version are shown."

echo "## What filters are available?"

echo "### List of filters"
grep -n '// Filter:' internal/openapi/filter/*.go | sort -u -k2 | sed -n "s/\([^0-9]*\):\([0-9]*\):\/\/ Filter: \(.*\)/[\3](\.\.\/\1?plain=1#L\2)  /p" | sort

