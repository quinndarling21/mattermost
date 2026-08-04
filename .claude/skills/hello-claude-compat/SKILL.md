---
name: hello-claude-compat
description: >-
  Demo skill that proves Cursor discovers Claude Code skills from
  `.claude/skills/`. Use when the user invokes /hello-claude-compat, asks to
  verify Claude Code skill loading, or mentions Claude Code skill compatibility.
disable-model-invocation: true
---

# Hello Claude Compat

This skill lives under `.claude/skills/` (Claude Code's project skill path).
Cursor loads it automatically for compatibility — no copy into `.cursor/skills/`
required.

## Instructions

When this skill is invoked:

1. Open your reply with this exact first line:

   `Claude Code skill loaded from .claude/skills/hello-claude-compat`

2. Then briefly confirm:
   - Skill name: `hello-claude-compat`
   - Source path: `.claude/skills/hello-claude-compat/SKILL.md`
   - That Cursor discovered it via Claude Code compatibility (alongside
     `.cursor/skills/` and `.agents/skills/`)

3. Keep the rest of the reply to 2–3 short sentences. Do not modify repo files
   unless the user asks for a follow-up change.

## Demo tip

In Agent chat, type `/` and select **hello-claude-compat**, or open
**Customize → Skills** and confirm it appears under project skills.
