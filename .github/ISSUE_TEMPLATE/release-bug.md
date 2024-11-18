---
name: Release Bug
about: This template is used by the CD to file bugs during the release process
title: "({{env.TARGET_ENV}}) The {{env.RELEASE_NAME}} Release has failed. :scream_cat:"
labels: failed-release
assignees: ''

---

See https://github.com/mongodb/openapi/actions/runs/{{env.GITHUB_RUN_ID}}
