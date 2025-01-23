// Used in .github/workflows/release-IPA-metrics.yml
export default async function getShouldRunMetricsRelease({ github, context }) {
  const response = await github.rest.actions.listWorkflowRuns({
    owner: context.repo.owner,
    repo: context.repo.repo,
    workflow_id: 'release-IPA-metrics.yml',
    per_page: 2,
    page: 1,
  });

  if (!response || !response.data) {
    throw Error('listWorkFlowRuns response is empty');
  }

  const { workflow_runs: runs } = response.data;

  if (runs === undefined || runs.length === 0) {
    throw Error('response.data.workflow_runs is empty');
  }

  const previousResult = runs[1].conclusion;

  const lastRunDate = new Date(runs[1].created_at);
  const today = new Date();

  return previousResult === 'failure' || today.toDateString() !== lastRunDate.toDateString();
}
