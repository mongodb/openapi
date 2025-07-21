#!/bin/bash
# set -eou pipefail

# foascli versions -s v2.json --env "${target_env:?}" -o versions.json

# branch_name=${target_env:?}
# if [[ "$branch_name" == "prod" ]]; then
#     branch_name="main"
# fi

branch_name="main"

# Load versions from versions.json
versions=()

# Read versions from versions.json into an array
while IFS= read -r version; do
    versions+=("$version")
# done < <(jq -r '.[]' versions.json)
done < <(jq -r '.[]' ../../openapi/v2/versions.json)

all_urls=()

# Fetch and append file URLs from each version
for version in "${versions[@]}"; do
    if [[ "${version}" == *"private"* ]]; then
        all_urls+=("https://raw.githubusercontent.com/mongodb/openapi/${branch_name:?}/openapi/v2/private/openapi-${version}.json")
        all_urls+=("https://raw.githubusercontent.com/mongodb/openapi/${branch_name:?}/openapi/v2/private/openapi-${version}.yaml")
        continue
    fi

    all_urls+=("https://raw.githubusercontent.com/mongodb/openapi/${branch_name:?}/openapi/v2/openapi-${version}.json")
    all_urls+=("https://raw.githubusercontent.com/mongodb/openapi/${branch_name:?}/openapi/v2/openapi-${version}.yaml")
done

links=""
for url in "${all_urls[@]}"; do
    URL_COUNT=$((URL_COUNT + 1))
    filename=$(basename "$url")
    echo "$url"
    links="${links}<div class='url-container'><button onclick=\"generateLink('preview-url-$URL_COUNT', '$url')\">Generate preview link for ${filename}</button><span class='preview-span' id='preview-url-$URL_COUNT'></span></div>"
done

# Uses a proxied endpoint for creating preview links to prevent CORS issues
cat << EOF > branded-preview.html
<!DOCTYPE html>
<html lang="en">
    <head>
        <style>
            .url-container {
                margin: 16px 0;
            }

            .preview-span {
                margin-left: 8px;
            }
        </style>
    </head>
    <body>
        <h2>Preview docs for:</h2>
        ${links}
        <script>
            async function generateLink(elId, url) {
                const previewSpan = document.getElementById(elId);
                if (!previewSpan) {
                    return;
                }

                previewSpan.innerHTML = 'Loading...';

                try {
                    const buildPreviewEndpoint = 'https://populate-data-ext-rr.netlify.app/.netlify/functions/create-bump-preview';
                    const res = await fetch(buildPreviewEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url }),
                    });

                    if (res.status === 201) {
                        const { public_url: previewUrl } = await res.json();
                        previewSpan.innerHTML = '';
                        const link = document.createElement('a');
                        link.href = previewUrl;
                        link.textContent = previewUrl;
                        link.target = '_blank';
                        previewSpan.appendChild(link);
                    }

                    if (res.status === 422) {
                        const resText = await res.text();
                        previewSpan.innerHTML = resText;
                    }
                } catch (err) {
                    console.error(err);
                    previewSpan.innerHTML = 'Error!';
                }
            }
        </script>
    </body>
</html>
EOF

# rm -f versions.json
