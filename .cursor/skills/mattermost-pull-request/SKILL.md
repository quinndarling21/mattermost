---
name: mattermost-pull-request
description: Create pull requests for the quinndarling21/mattermost fork using the repository template. Use when creating a pull request, drafting a PR body, or preparing a PR for this Mattermost fork.
---

# Mattermost Pull Request

## Instructions

When creating or drafting a pull request for this repository:

1. Treat `quinndarling21/mattermost` as the source repository and `master` as the default base branch.
2. Create PRs against the fork, not against upstream `mattermost/mattermost`, unless the user explicitly asks for an upstream Mattermost PR.
3. Use `gh pr create --repo quinndarling21/mattermost --base master --head <branch-name>` for fork PRs.
4. Use `.github/PULL_REQUEST_TEMPLATE.md` exactly as the source template.
5. Remove all `<!-- -->` comments.
6. Omit sections that are not applicable, including `Ticket Link` and `Screenshots`; do not write `N/A`, just remove the header.
7. Always include the `#### Release Note` header and its fenced `release-note` code block without escaping the backticks.
8. Write `NONE` in the release-note block if the change has no API, schema, UI, or breaking changes.
