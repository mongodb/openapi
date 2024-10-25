// Checks for overlapping paths with path parameters that may shadow each other.
// Example:
// Given the endpoints cluster/index/{indexName} and another cluster/index/compound,
// the versioning engine won’t be able to match a request like cluster/index/compound since it won’t be able to understand
// if compound is a path param or a resource name.


//
// 30827:7    error  no-overlapping-paths      Paths /api/atlas/v2/groups/{groupId}/clusters/{clusterName} and /api/atlas/v2/groups/{groupId}/clusters/tenantUpgrade may overlap.                                                                 paths
// 30827:7    error  no-overlapping-paths      Paths /api/atlas/v2/groups/{groupId}/clusters/{clusterName} and /api/atlas/v2/groups/{groupId}/clusters/tenantUpgradeToServerless may overlap.                                                     paths
// 30827:7    error  no-overlapping-paths      Paths /api/atlas/v2/groups/{groupId}/clusters/{clusterName}/backup/snapshots/{snapshotId} and /api/atlas/v2/groups/{groupId}/clusters/{clusterName}/backup/snapshots/shardedClusters may overlap.  paths
// 30827:7    error  no-overlapping-paths      Paths /api/atlas/v2/groups/{groupId}/containers/{containerId} and /api/atlas/v2/groups/{groupId}/containers/all may overlap.                                                                       paths
// 30827:7    error  no-overlapping-paths      Paths /api/atlas/v2/groups/{groupId}/liveMigrations/{liveMigrationId} and /api/atlas/v2/groups/{groupId}/liveMigrations/validate may overlap.                                                      paths
// 30827:7    error  no-overlapping-paths      Paths /api/atlas/v2/orgs/{orgId}/invoices/{invoiceId} and /api/atlas/v2/orgs/{orgId}/invoices/pending may overlap.                                                                                 paths
// 30827:7    error  no-overlapping-paths      Paths /api/atlas/v2/users/byName/{userName} and /api/atlas/v2/users/byName/test may overlap.





// `given` is the paths object
module.exports = (paths) => {
    if (paths === null || typeof paths !== 'object') {
        return [];
    }
    const pathKeys = Object.keys(paths);
    const errors = [];
    let regexToMatch = [{
        regex: RegExp,
        path: String
    }]

    // Get all paths that end with a path parameter
    const pathsEndingWithPathParam = getPathsThatEndWithParam(pathKeys);

    for (let i = 0; i < pathsEndingWithPathParam.length; i++) {
       // console.log(pathsEndingWithPathParam[i]);

       const regex = getPathConflictRegex(pathsEndingWithPathParam[i]);
       // console.log("Regex: " + regex);
       regexToMatch.push({
              regex: regex,
              path: pathsEndingWithPathParam[i]
       });
    }

    for (let i = 0; i < regexToMatch.length; i++) {
        const regex = regexToMatch[i].regex;
        // console.log("Checking Regex: " + regex);
        for (let j = 0; j < pathKeys.length; j++) {
            let matches = pathKeys[j].match(regex);
            // console.log("Matches: " + matches);
            if (matches && matches.length > 0) {
                errors.push({
                    message: `Paths ${regexToMatch[i].path} and ${pathKeys[j]} may overlap.`,
                })
            }
        }
    }

    return errors
};

// Function to get the regex for paths that may conflict. Given a path with a path parameter at the end
// (example: /api/atlas/v2/users/byName/{userName}), the output is a regex that match paths that may conflict
// (example: /^\/api\/atlas\/v2\/users\/byName\/[a-zA-Z0-9]+(:[a-zA-Z0-9]+)?$/)
//
// Example of strings that match the regex in the example:
// /api/atlas/v2/users/byName/username
// /api/atlas/v2/users/byName/username:details
// /api/atlas/v2/users/byName/user123:info
//
// Example of strings that do not match the regex in the example:
// /api/atlas/v2/users/byName/{username} (contains {})
// /api/atlas/v2/users/byName/username/details (contains /)
// /api/atlas/v2/users/byName/username:details/extra (contains /)
// /api/atlas/v2/users/byName/ (missing string after last /)

function getPathConflictRegex(path) {
    let pathWithoutLastPathParam = path.replace(/\/\{[^\/]*\}$/, '');
    return new RegExp(`^${pathWithoutLastPathParam}/[a-zA-Z0-9]+(:[a-zA-Z0-9]+)?$`);
}

function getPathsThatEndWithParam(pathKeys) {
    return pathKeys.filter((path) => path.endsWith('}'));
}