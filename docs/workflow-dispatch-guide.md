# Manual Workflow Dispatch (Release Override)

This guide explains how to manually dispatch the release workflow to override the
automated pipeline. Additionally we explain how we can force a Bump.sh deployment.

## Triggering the Release Runner

1. Go to the **Actions** tab in the [mongodb/openapi](https://github.com/mongodb/openapi/actions) repository.
2. Select **"Release Runner: Start the Release Process for DEV, QA, STAGING and PROD"** from the workflow list on the left.
3. Click the **"Run workflow"** dropdown.
4. Choose the target environment from the `env_to_release` dropdown
5. Set **`force_bump`** to `true` if the spec change is already committed and the
   original release skipped Bump.sh.
6. Click **"Run workflow"**.

The workflow also runs automatically on a schedule (every 2 hours, Mon-Fri). The
scheduled run always targets `dev` and runs the `retry-handler` on failure for up to
3 attempts.