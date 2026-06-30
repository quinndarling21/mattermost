---
name: content-review
description: Review marketing copy, landing pages, release notes, security bulletins, or any Mattermost-facing text against the repository's brand and voice guidelines. Use when the user asks to review content, check copy, evaluate marketing text, run a brand/voice/content review, or runs /content-review against a file, glob, or pasted copy.
---

# Content review

Evaluate copy against Mattermost's brand and style guidelines and return specific, actionable findings. This is an agent-driven review: you read the guidelines and reason about the copy. There is no script or linter to run.

## Inputs

Accept any one of these:

- A file path (e.g., `brand-guidelines/marketing-samples/off-brand-landing.md`).
- A glob (e.g., `brand-guidelines/marketing-samples/*.md`).
- Copy pasted directly into the chat.

If no input is given, ask which file or text to review.

## Step 1: Load the guidelines (always, every run)

Read these files from the repository root so the review reflects the current rules:

- `brand-guidelines/brand.md` - brand attributes and the anti-brand list.
- `brand-guidelines/voice-and-tone.md` - voice, tone by context, formatting/mechanics.
- `brand-guidelines/lexicon.md` - product names, use/avoid words, forbidden patterns.
- `brand-guidelines/examples.md` - before/after references for suggested rewrites.

Never review from memory alone. The markdown is the source of truth and may have changed.

## Step 2: Determine the context

Identify what kind of copy this is (marketing/website, docs, in-product microcopy, security bulletin, release notes, community). Apply the matching tone row from `voice-and-tone.md`. A security bulletin is held to the sober, zero-hype standard; marketing may be benefit-led but still concrete.

## Step 3: Evaluate

Check the copy against each area. For every issue, capture the exact offending text and a one-line reason tied to a guideline.

1. **Brand alignment** - Does it reflect the brand attributes (Open, Secure, Trustworthy, Technical, Clear, In control)? Does it hit any anti-brand item?
2. **Voice and tone** - Right tone for the context? Direct, precise, calm? Active voice and second person?
3. **Lexicon** - Product names spelled and capitalized correctly ("Mattermost," "Channels," "Playbooks," "System Console"). Any use/avoid violations.
4. **Forbidden patterns** - Hype stacking, fear-based security marketing, absolute security claims, unsourced numbers, undefined jargon, false scarcity/pressure, lock-in framing, misnaming the product.
5. **Mechanics** - Capitalization, exclamation points, ALL CAPS, emoji, "click here" links, unexpanded acronyms.

## Step 4: Report findings

Group findings by severity, most severe first:

- **Blocker** - factually risky or clearly off-brand: absolute security claims, unsourced stats, fear-based framing, wrong product name.
- **Should-fix** - hype words, undefined jargon, wrong tone, use/avoid violations.
- **Polish** - mechanics: punctuation, capitalization, link text, minor wording.

Format each finding on one line:

```
[Severity] "exact quoted text" - problem (guideline) -> suggested rewrite
```

Example:

```
[Blocker] "100% secure and completely unhackable" - absolute security claim (lexicon: forbidden patterns) -> "run it on infrastructure you control, with granular access control"
```

After the list, give a short verdict: the count by severity and whether the copy is shippable as-is, needs fixes, or should be rewritten.

If the copy is already on-brand, say so plainly and name the 2-3 things it does well (referencing the guidelines). Do not invent problems.

## Step 5: Offer rewrites

Offer to apply the suggested rewrites, or to produce a full on-brand rewrite of the piece. If the user accepts and the copy is in a file, edit the file; if it was pasted, return the rewritten text in the chat. Keep rewrites faithful to the original intent and grounded in `examples.md`.

## Principles

- Be specific. Quote the exact text; never give vague feedback like "too salesy."
- Tie every finding to a guideline so it's defensible.
- Don't over-flag. One clear instance per pattern is enough; note if it repeats.
- Respect intent. Improve the copy; don't replace the message.
