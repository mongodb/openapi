// Used in .github/workflows/release-IPA-metrics.yml
// Checks if workflow failed or if job 'Release IPA Validation Metrics' didn't run today

const releaseJobName = 'Release IPA Validation Metrics';

export default async function getShouldRunMetricsRelease({ github, context }) {
  // Get last workflow run
  const workflowRuns = await github.rest.actions.listWorkflowRuns({
    owner: context.repo.owner,
    repo: context.repo.repo,
    workflow_id: 'release-IPA-metrics.yml',
    per_page: 2,
    page: 1,
  });

  if (!workflowRuns || !workflowRuns.data) {
    throw Error('listWorkFlowRuns response is empty');
  }

  const { workflow_runs: runs } = workflowRuns.data;

  if (!runs || runs.length === 0) {
    throw Error('workflowRuns is empty');
  }

  const previousRun = runs[1];

  // Check if job 'Release IPA Validation Metrics' already ran today
  const runJobs = await github.rest.actions.listJobsForWorkflowRun({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: runs[1].id,
    per_page: 2,
    page: 1,
  });

  if (runJobs === undefined || runJobs.length === 0) {
    throw Error('listJobsForWorkflowRun response is empty');
  }

  const previousReleaseJob = runJobs.find((job) => job.name === releaseJobName);

  if (!previousReleaseJob) {
    throw Error('Could not find previous release job with name' + releaseJobName);
  }

  const lastRunDate = new Date(previousReleaseJob.completed_at);
  const today = new Date();

  console.log('Last release job run was', lastRunDate.toDateString(), 'with status', previousReleaseJob.conclusion);

  return previousRun.conclusion === 'failure' || today.toDateString() !== lastRunDate.toDateString();
}
