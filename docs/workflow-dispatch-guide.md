# Manual Workflow Dispatch (Release Override)

When a spec change has been committed to a target branch but the automated release
pipeline skips the Bump.sh deployment (e.g., because the diff is a single-line enum
removal that does not exceed the `changed_lines -gt 1` threshold), you can manually
trigger the release via `workflow_dispatch`.

## Triggering the Release Runner

1. Go to the **Actions** tab in the [mongodb/openapi](https://github.com/mongodb/openapi/actions) repository.
2. Select **"Release Runner: Start the Release Process for DEV, QA, STAGING and PROD"** from the workflow list on the left.
3. Click the **"Run workflow"** dropdown.
4. Choose the target environment from the `env_to_release` dropdown:
5. Click **"Run workflow"**.

The workflow also runs automatically on a schedule (every 2 hours, Mon-Fri). The
scheduled run always targets `dev` and runs the `retry-handler` on failure for up to
3 attempts.
