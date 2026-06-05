---
name: dry-review
description: Review a focused set of Mattermost code for meaningful redundancy and improve modularity by extracting reusable components, hooks, selectors, utilities, styles, or test helpers. Use when the user asks to DRY up code, find duplicated logic, reduce redundancy, modularize components, or refactor repeated React, TypeScript, SCSS, or test code.
---

# DRY Review

## Instructions

Use this skill when reviewing a focused area of Mattermost code for redundancy and modularity opportunities.

## Review Mindset

Do not extract code just because it looks similar. Extract only when the repeated code represents the same concept, the abstraction has a clear name, and the result reduces future maintenance cost.

Prefer small, behavior-preserving refactors over broad rewrites. Keep ownership boundaries intact and follow nearby patterns.

## Workflow

1. Establish the target scope: files, component folder, PR diff, or user-selected code.
2. Read the target code plus nearby tests, styles, and adjacent components that share the same workflow.
3. Look for repeated JSX structure, prop shaping, Redux selection, hooks logic, formatting code, constants, SCSS blocks, and test setup.
4. Classify each meaningful opportunity as one of:
   - shared component
   - custom hook
   - selector
   - utility function
   - shared test helper
   - shared style or mixin
   - not worth extracting
5. Make only the extractions that clearly improve maintainability.
6. Update call sites, types, imports, tests, and styles together.
7. Run the narrowest relevant lint/type/test checks available for the touched files.
8. Report what was extracted, why it helps, what was intentionally left duplicated, and what validation ran.

## Mattermost Webapp Guidance

- Keep feature components folder-by-feature under `webapp/channels/src/components`.
- Put reusable component logic in named child components or hooks when it reduces component complexity.
- Use `components/common/hooks` for broadly reusable hooks; keep one-off hooks near the feature.
- Use `selectors` for shared Redux-derived data, especially when returning arrays or objects that need memoization.
- Use `utils` for pure formatting, parsing, sorting, or transformation helpers that are not React-specific.
- Keep SCSS co-located with the owning component unless the style is already a shared primitive.
- Keep tests behavior-focused and update existing tests before adding broad snapshots.
- Preserve React Intl usage; do not move user-facing strings into plain constants unless the i18n pattern remains intact.

## Avoid

- Creating generic components with vague names like `CommonItem`, `SharedWrapper`, or `ReusableSection`.
- Extracting code that only looks similar but serves different product concepts.
- Introducing new abstractions that require more props, branching, or indirection than the duplication they replace.
- Moving feature-specific logic into global folders prematurely.
- Refactoring unrelated code while performing the DRY review.

## Report Format

When finished, summarize in this format:

```markdown
## DRY Review Summary

- Extracted: [what changed and where]
- Left duplicated: [intentional non-extractions and why]
- Validation: [commands or checks run]
- Follow-ups: [optional next candidates, only if useful]
```
