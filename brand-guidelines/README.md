# Brand & style guidelines

The reference for how Mattermost sounds in writing, and a way to check copy against it. These guidelines are grounded in Mattermost's real positioning: a secure, open-source, self-hostable collaboration platform for technical teams.

This folder is paired with a Figma design library (the visual side of the system) so design and content share one source of truth.

## What's here

| File | Purpose |
|---|---|
| [brand.md](brand.md) | What Mattermost is, who it serves, brand attributes, and the anti-brand list. |
| [voice-and-tone.md](voice-and-tone.md) | The constant voice, tone shifts by context, and formatting/mechanics rules. |
| [lexicon.md](lexicon.md) | Exact product names, a use/avoid word table, and forbidden patterns. |
| [examples.md](examples.md) | Before/after rewrites that show the rules in practice. |
| [marketing-samples/](marketing-samples/) | Sample copy to review: one on-brand, one off-brand, one security bulletin. |

## How to run a content review

A Cursor skill, `/content-review`, reads these guidelines and evaluates copy against them.

In Cursor's chat, run:

```
/content-review brand-guidelines/marketing-samples/off-brand-landing.md
```

You can also point it at a glob, or paste copy directly:

```
/content-review here is my draft: "Mattermost is a revolutionary platform that..."
```

The review returns findings as `location - problem -> suggested rewrite`, grouped by severity (Blocker / Should-fix / Polish), then offers to apply rewrites. If the copy is clean, it says so and explains why.

The skill lives at [.cursor/skills/content-review/SKILL.md](../.cursor/skills/content-review/SKILL.md).

## When to use this

- Reviewing marketing copy, landing pages, or campaign text before it ships.
- Drafting release notes, security bulletins, or in-product microcopy.
- Onboarding anyone who writes Mattermost-facing copy.

## Editing the guidelines

These are living documents. When the brand evolves, update the markdown here; the `/content-review` skill always reads the current files, so reviews stay in sync automatically.
