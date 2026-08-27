- product: Docs and changelog
  boundary: Documentation and top-level narrative files that are not all under docs/ (docs/**, README.md, CHANGELOG.md, CONTRIBUTING.md, SECURITY.md)
  policies:
    - .cursor/approval-policies/docs-and-changelog.md
- product: CI workflows
  boundary: .github/workflows/** and .github/actions/**
  policies:
    - .cursor/approval-policies/ci-workflows.md
