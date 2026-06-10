# API Bugbot rules

When reviewing changes under `api/`:

- Focus on contract changes, generated surface area, and backward compatibility
  for consumers.
- Flag request or response shape changes that are not reflected in tests,
  examples, or related integrations.
- Prefer findings about compatibility and correctness over style.
