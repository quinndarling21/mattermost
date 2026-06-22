---
name: pm-roadmap-insights
description: Analyze PM roadmap input data from realistic account, user activity, feedback, and roadmap CSVs. Use when the user asks to prioritize roadmap work from user activity data, generate product insights, identify adoption or retention drivers, compare feature opportunities, or prepare a PM decision brief.
---

# PM roadmap insights

## Workflow

Use this skill from the repository root.

1. Read the source data from:

   ```text
   .cursor/insights/pm-roadmap/data/
   ```

   Required files:

   ```text
   accounts.csv
   users.csv
   activity_events.csv
   feature_feedback.csv
   roadmap_candidates.csv
   ```

2. Treat the CSVs as realistic synthetic product telemetry. Write as if preparing an internal PM analysis packet from sampled customer data.

3. Join the data by stable IDs:

   - `accounts.account_id` joins to `users.account_id`, `activity_events.account_id`, and `feature_feedback.account_id`.
   - `users.user_id` joins to `activity_events.user_id` and `feature_feedback.user_id`.
   - `roadmap_candidates.candidate_id` maps to the feature opportunity being evaluated.

4. Calculate the decision metrics before writing recommendations:

   - Reach: distinct active users per feature area divided by total users.
   - Repeat usage: events per active user per feature area.
   - Friction: unsuccessful activity events plus negative or high-severity feedback.
   - Segment concentration: share of activity and feedback from enterprise, mid-market, and SMB accounts.
   - Business impact: account-weighted activity using `arr_band` and lifecycle stage.
   - Effort-adjusted priority: combine reach, friction, business impact, confidence, and `effort_weeks`.

5. Produce a PM decision brief, not a generic metrics dump:

   - Lead with the recommended roadmap bet and the reason.
   - Compare the top opportunities in a scorecard.
   - Call out which customer segment and persona benefit most.
   - Include a small number of representative feedback quotes.
   - State which option should be deferred and why.

6. Create or update this Cursor Canvas for the visual brief:

   ```text
   pm-roadmap-insights.canvas.tsx
   ```

   Keep all canvas data inline. Use titles, axis labels, legends, and source captions so the canvas can stand alone beside the chat.

7. End with concrete PM follow-ups:

   - A one-paragraph roadmap-review summary.
   - Suggested next analysis questions.
   - Optional Linear issue drafts for the Mattermost Factory `MAT` project if the user asks to turn recommendations into tracked work.

## Scoring guidance

Prefer a simple model the PM can explain in a roadmap meeting:

```text
priority_score =
  0.30 * reach_score +
  0.30 * friction_score +
  0.25 * business_impact_score +
  0.15 * confidence_score -
  effort_penalty
```

Normalize scores to a 0-100 range where possible. The exact formula can change if the user asks for a different prioritization framework, but keep the recommendation tied to observable behavior and customer feedback.
