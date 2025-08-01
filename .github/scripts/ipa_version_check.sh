#!/bin/bash      
set -eou pipefail    
    
current_version=$(jq -r '.version' tools/spectral/ipa/package.json)    
  
previous_version=$(git show HEAD~1:tools/spectral/ipa/package.json | jq -r '.version' || echo "none")    
  
if [[ "${previous_version}" == "${current_version}" ]]; then    
  echo "false"    
else    
  echo "true"    
fi  
