// Used in .github/workflows/release-IPA-metrics.yml
export default async function getShouldRunMetricsRelease({ github, context }) {
  const response = await github.rest.actions.listWorkflowRuns({
    owner: context.repo.owner,
    repo: context.repo.repo,
    workflow_id: 'release-IPA-metrics.yml',
    per_page: 2,
    page: 1,
  });

  console.log('Response:', response);

  if (response === undefined) {
    return true;
  }

  const { data: runs } = response;

  console.log('Runs:', runs);

  if (runs === undefined || runs.length === 0) {
    return true;
  }

  console.log('Last run:', runs[1]);

  const previousStatus = runs[1].status;

  const lastRunDate = new Date(runs[1].created_at);
  const today = new Date();

  return previousStatus === 'failure' || today.toDateString() !== lastRunDate.toDateString();
}
