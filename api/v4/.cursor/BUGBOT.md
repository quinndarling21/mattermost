# API v4 Bugbot rules

When reviewing changes under `api/v4/`:

- Pay special attention to validation, pagination, permissions, and error
  response consistency.
- Flag endpoint changes that can break existing clients even when the code
  change is small.
- Expect accompanying coverage when routes, params, or payloads change.
