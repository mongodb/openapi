#!/bin/bash
set -eou pipefail

branch_name=${target_env:?}
if [[ "$branch_name" == "prod" ]]; then
    branch_name="main"
fi

foascli versions -s v2.json --env "${branch_name:?}" -o versions.json
# Load versions from versions.json
versions=()

# Read versions from versions.json into an array
while IFS= read -r version; do
    versions+=("$version")
done < <(jq -r '.[]' versions.json)

all_urls=(
   "https://raw.githubusercontent.com/mongodb/openapi/${branch_name:?}/openapi/v2.json"
   "https://raw.githubusercontent.com/mongodb/openapi/${branch_name:?}/openapi/v2.yaml"
)

# Fetch and append file URLs from each version
for version in "${versions[@]}"; do
    all_urls+=("https://raw.githubusercontent.com/mongodb/openapi/${branch_name:?}/openapi/v2/openapi-${version}.json")
    all_urls+=("https://raw.githubusercontent.com/mongodb/openapi/${branch_name:?}/openapi/v2/openapi-${version}.yaml")
done

links=""
for url in "${all_urls[@]}"; do
    filename=$(basename "$url")
    echo "$url"
    link="https://www.mongodb.com/docs/openapi/preview/?src=$url"
    echo "Branded preview: ${link}"
    links="${links}<li><a href='$link' target=\"_blank\">${filename}</a></li>"
done

cat << EOF > branded-preview.html
<!DOCTYPE html>
<html lang="en">
    <body>
        <h2>Preview docs for:</h2>
        <ul>
          ${links}
        </ul>
    </body>
</html>
EOF

rm -f versions.json
