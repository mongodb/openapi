#!/bin/bash  
set -eou pipefail
  
current_version=$(jq -r '.version' tools/spectral/ipa/package.json)  

previous_version=$(git show origin/${BASE_BRANCH}:tools/spectral/ipa/package.json | jq -r '.version')  
  
if [[ -z "$previous_version" || "$previous_version" == "null" ]]; then  
  previous_version="none"  
fi  
  
if [[ "$previous_version" == "$current_version" ]]; then  
  echo "false"  
else  
  echo "true"  
fi  
