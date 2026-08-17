/**
 * The operations returning HTTP 202 that predate IPA-132 and do not follow the long-running
 * operation contract. This module is the single source of truth: the IPA-132 rules import it
 * directly, and the foascli merge tagger compiles a Go copy generated from it. After editing,
 * run go generate ./... in tools/cli to update the Go copy.
 */
export const legacyLroOperationIds = [
  'acceptGroupStreamVpcPeeringConnection',
  'createGroupClusterIndexRollingIndex',
  'createGroupCustomDbRoleRole',
  'createGroupEncryptionAtRestPrivateEndpoint',
  'createOrgBillingCostExplorerUsageProcess',
  'cutoverGroupLiveMigration',
  'deleteGroupCluster',
  'deleteGroupClusterOverloadSimulation',
  'deleteGroupPeer',
  'deleteGroupStreamConnection',
  'deleteGroupStreamPrivateLinkConnection',
  'deleteGroupStreamVpcPeeringConnection',
  'deleteGroupStreamWorkspace',
  'deleteGroupUserSecurityLdapUserToDnMapping',
  'disableGroupUserSecurityCustomerX509',
  'rejectGroupStreamVpcPeeringConnection',
  'updateGroupUserSecurity',
];
