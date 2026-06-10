# Server Bugbot rules

When reviewing changes under `server/`:

- Focus on auth, permissions, data integrity, migrations, and backward
  compatibility.
- Flag new handlers, jobs, or service logic that change behavior without test
  coverage.
- Prefer findings about real runtime risk, not optional refactors.
