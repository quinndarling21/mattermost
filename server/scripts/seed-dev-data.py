#!/usr/bin/env python3
# Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
# See LICENSE.txt for license information.

"""Generate a realistic Mattermost bulk-import (JSONL) file for local development.

The output follows the Mattermost bulk import format (the same format used by
``mmctl import``). It contains a couple of teams, a healthy set of channels,
a roster of named users and a large volume of coherent messages, threaded
replies and reactions spread over the last few weeks. This gives a local dev
server data that "looks real" and is useful for exercising analytics-style
features.

The data is fully deterministic for a given ``--seed`` so re-running the seed
produces the same dataset.

Usage:
    python3 seed-dev-data.py --out import.jsonl
"""

import argparse
import json
import random
import sys
from datetime import datetime, timedelta, timezone

# ---------------------------------------------------------------------------
# Static, curated content pools used to build realistic looking data.
# ---------------------------------------------------------------------------

DEFAULT_PASSWORD = "Sample-Pass1"
ADMIN_USERNAME = "sysadmin"
ADMIN_PASSWORD = "Sys@dmin-sample1"

# (first, last, position, department)
PEOPLE = [
    ("Avery", "Johnson", "Engineering Manager", "engineering"),
    ("Liam", "Chen", "Senior Backend Engineer", "engineering"),
    ("Noah", "Patel", "Backend Engineer", "engineering"),
    ("Sofia", "Garcia", "Frontend Engineer", "engineering"),
    ("Mia", "Nguyen", "Frontend Engineer", "engineering"),
    ("Ethan", "Wright", "Site Reliability Engineer", "devops"),
    ("Olivia", "Brown", "DevOps Engineer", "devops"),
    ("Lucas", "Martin", "Platform Engineer", "devops"),
    ("Emma", "Davis", "Product Manager", "product"),
    ("James", "Wilson", "Senior Product Manager", "product"),
    ("Harper", "Lee", "Product Designer", "design"),
    ("Aria", "Lopez", "Senior Product Designer", "design"),
    ("Mateo", "Rossi", "UX Researcher", "design"),
    ("Isabella", "Moore", "QA Engineer", "qa"),
    ("Benjamin", "Clark", "QA Lead", "qa"),
    ("Charlotte", "Hall", "Customer Success Manager", "success"),
    ("Henry", "Adams", "Support Engineer", "success"),
    ("Amelia", "Scott", "Support Engineer", "success"),
    ("Daniel", "Kim", "Account Executive", "sales"),
    ("Grace", "Turner", "Sales Engineer", "sales"),
    ("Leo", "Schmidt", "Solutions Architect", "sales"),
    ("Chloe", "Walker", "Technical Writer", "product"),
    ("Jack", "Evans", "Data Analyst", "product"),
    ("Zoe", "Baker", "Engineering Manager", "engineering"),
]

# Teams: name -> display name + type ("O" open, "I" invite only)
TEAMS = {
    "core": {"display": "Core Team", "type": "O",
             "description": "Where the product gets built — engineering, product and design."},
    "customer": {"display": "Customer Org", "type": "O",
                 "description": "Customer success, support and sales collaboration."},
}

# Channels per team. Each entry: name -> (display, type, purpose, departments-with-access)
# Department "all" means every member of the team joins it.
CORE_CHANNELS = {
    "town-square": ("Town Square", "O", "Company-wide announcements and watercooler chat.", ["all"]),
    "off-topic": ("Off-Topic", "O", "Non-work banter, memes and random links.", ["all"]),
    "announcements": ("Announcements", "O", "Important company and team announcements.", ["all"]),
    "engineering": ("Engineering", "O", "Backend, frontend and architecture discussions.", ["engineering", "devops", "qa"]),
    "product": ("Product", "O", "Roadmap, requirements and product decisions.", ["product", "design", "engineering"]),
    "design": ("Design", "O", "UX, UI and design system conversations.", ["design", "product"]),
    "qa": ("Quality Assurance", "P", "Test plans, bug triage and release sign-off.", ["qa", "engineering"]),
    "devops": ("DevOps", "O", "Infrastructure, CI/CD and on-call coordination.", ["devops", "engineering"]),
    "incidents": ("Incidents", "P", "Live incident response and post-mortems.", ["devops", "engineering", "qa"]),
    "random": ("Random", "O", "Anything goes.", ["all"]),
}

CUSTOMER_CHANNELS = {
    "town-square": ("Town Square", "O", "Customer org announcements.", ["all"]),
    "off-topic": ("Off-Topic", "O", "Casual chat for the customer org.", ["all"]),
    "support": ("Customer Support", "O", "Inbound customer support requests.", ["success"]),
    "sales": ("Sales", "O", "Pipeline, deals and demos.", ["sales"]),
    "onboarding": ("Onboarding", "O", "New customer onboarding and rollout.", ["success", "sales"]),
}

# Per-channel message pools. These read like real conversations so the seeded
# app looks believable in screenshots and demos.
CHANNEL_MESSAGES = {
    "town-square": [
        "Morning everyone! :wave: Hope you all had a good weekend.",
        "Reminder: the all-hands is at 10am today, calendar invite is out.",
        "Welcome to the team, {mention}! Excited to have you on board :tada:",
        "Coffee chat sign-ups for this week are open, grab a slot when you can.",
        "Office will be closed next Monday for the public holiday.",
        "Big shout-out to the team for shipping the release on time :rocket:",
        "Lunch is being catered today, comes around noon.",
        "Friendly reminder to submit your timesheets by end of day Friday.",
        "We crossed 10k active workspaces this month, incredible work all!",
        "New starter intro: I'm joining the platform team, looking forward to working with you all.",
    ],
    "off-topic": [
        "Anyone watching the game tonight?",
        "Found a great ramen place near the office, highly recommend :ramen:",
        "What's everyone reading these days? Looking for recommendations.",
        "My cat decided my keyboard was a good nap spot during standup :joy:",
        "Friday vibes :sunglasses: any fun plans for the weekend?",
        "Just tried the new espresso machine, game changer.",
        "Who else is hyped for the new season dropping this week?",
        "Random tip: the keyboard shortcut Ctrl+K is a lifesaver in here.",
        "Sharing my weekend hike photos, the views were unreal.",
        "Hot take: pineapple absolutely belongs on pizza :pizza:",
    ],
    "announcements": [
        "We're rolling out the new onboarding flow to all users starting Thursday.",
        "Heads up: scheduled maintenance window this Saturday 2-4am UTC.",
        "Q3 OKRs have been published, please review with your manager.",
        "The mobile app v2.4 is now live in both app stores :iphone:",
        "Security reminder: please enable MFA on your account if you haven't already.",
        "We've updated the PTO policy, details in the handbook.",
        "New documentation portal is live, bookmark it!",
        "Performance review cycle kicks off next week.",
    ],
    "engineering": [
        "Anyone have context on the flaky test in the channels package? Seeing intermittent failures in CI.",
        "PR is up for the new caching layer, would love a review when you get a chance {mention}.",
        "Reminder to run `make check-style` before pushing, the linter is catching a lot.",
        "The DB migration for the new index is ready, planning to roll it out tomorrow.",
        "We should consider adding a circuit breaker around the search service calls.",
        "Heads up: bumped the Go version in go.mod, you'll need to re-run setup.",
        "Profiling shows the hot path is in the post store, looking into a fix.",
        "Refactored the websocket reconnection logic, please test on your branches.",
        "Can someone double check the API contract for the new endpoint before we freeze it?",
        "The memory leak turned out to be an unclosed ticker, fix is merged :tada:",
        "Switching the queue to Redis-backed for the next release, RFC in the doc.",
        "Nice work on getting build times down by 30%, that's a huge quality of life win.",
    ],
    "product": [
        "Updated the roadmap deck for next quarter, feedback welcome by EOD.",
        "Customer interview takeaways: notifications are still the #1 pain point.",
        "Can we get a rough estimate on the threaded replies improvements?",
        "Spec for the analytics dashboard is ready for review {mention}.",
        "We're seeing strong adoption of the new playbooks feature, retention is up.",
        "Prioritization: I think the export-to-CSV ask should jump ahead of the theming work.",
        "Let's align on success metrics before we kick off the experiment.",
        "Draft PRD is in the drive, would love eng + design eyes on it.",
        "The A/B test results are in and the new flow wins on activation by 12%.",
        "Reminder: roadmap review with leadership is Thursday afternoon.",
    ],
    "design": [
        "Posted the new design system tokens in Figma, take a look.",
        "Iterated on the empty states, I think the new copy is much friendlier.",
        "Should the primary CTA be the brand orange or keep it neutral? Thoughts {mention}?",
        "Usability test recap: users loved the simplified settings screen.",
        "Updated the dark mode palette for better contrast, WCAG AA now passes.",
        "New iconography set is ready for handoff to engineering.",
        "Can we standardize on 8px spacing across the board?",
        "Prototype for the onboarding wizard is clickable, link in thread.",
        "Accessibility audit found a few focus-state issues, logging tickets.",
    ],
    "qa": [
        "Filed 3 new bugs from the regression pass, all linked to the release ticket.",
        "Smoke tests are green on staging :white_check_mark:",
        "Edge case: uploading a 0-byte file crashes the preview, repro steps in thread.",
        "Can eng confirm the fix for the pagination bug landed in this build?",
        "Test plan for the analytics feature is drafted, please review.",
        "Found a race condition when two users edit the same post quickly.",
        "Release candidate looks stable, recommending we ship.",
        "Automated coverage for the new endpoint is in, 92% on the package now.",
    ],
    "devops": [
        "Deploy to staging finished, metrics look healthy.",
        "CPU on the prod cluster spiked around 3pm, autoscaler kicked in fine.",
        "Rotating the TLS certs this week, no expected downtime.",
        "Upgraded the Postgres minor version in staging, watching for regressions.",
        "On-call handoff: nothing major overnight, one noisy alert silenced.",
        "Terraform plan for the new region is ready for review {mention}.",
        "CI runners were slow this morning, scaled up the pool.",
        "Backups verified and restore tested successfully this month.",
    ],
    "incidents": [
        "INC-142: elevated 5xx on the API, investigating now.",
        "Mitigation applied, error rate dropping back to baseline.",
        "Root cause was a bad config push, rolled back. Writing up the post-mortem.",
        "All clear, incident resolved. Thanks everyone for jumping on it :pray:",
        "Post-mortem doc is up for INC-142, action items assigned.",
    ],
    "random": [
        "TIL you can pin messages in a channel, super handy.",
        "Anyone got a good regex for parsing log timestamps?",
        "Sharing a neat article on distributed tracing.",
        "What's your favorite terminal setup? Always looking to optimize.",
        "Poll: tabs or spaces? :eyes:",
        "This GIF perfectly sums up my Monday.",
    ],
    "support": [
        "New ticket from Acme Corp: SSO login redirect loop, escalating to eng.",
        "Customer asking if we support exporting channel analytics to CSV.",
        "Resolved the file upload issue for Globex, was a proxy timeout on their side.",
        "Reminder: response SLA for priority tickets is 2 hours.",
        "Knowledge base article on configuring webhooks is now published.",
        "Customer feedback: they love the new search but want saved filters.",
        "Walked a customer through the migration, went smoothly :white_check_mark:",
    ],
    "sales": [
        "Closed the Initech deal :moneybag: great teamwork everyone!",
        "Demo with a 500-seat prospect went really well, sending follow-up.",
        "Updated the pricing one-pager, latest version in the drive.",
        "Prospect needs confirmation on the data residency options for EU.",
        "Pipeline review is Friday, please update your opportunities.",
        "Won a competitive eval against the incumbent, case study to follow.",
    ],
    "onboarding": [
        "Kicked off onboarding for the new enterprise customer today.",
        "Shared the rollout checklist with the customer admin team.",
        "First training session went great, strong engagement.",
        "Customer is live with 200 users, adoption looking healthy.",
        "Scheduling the 30-day check-in with the customer next week.",
    ],
}

GENERIC_MESSAGES = [
    "Sounds good to me :+1:",
    "Thanks for the heads up!",
    "Can you share a bit more context?",
    "I'll take a look this afternoon.",
    "Great point, hadn't considered that.",
    "Let's discuss in the next sync.",
    "Done and merged :white_check_mark:",
    "+1 to this approach.",
    "Following up here so we don't lose track.",
    "Nice work everyone!",
]

REPLY_MESSAGES = [
    "Good catch, on it.",
    "Agreed, let's go with that.",
    "I can pick this up.",
    "Thanks, that clears it up!",
    "Pushed a fix, mind taking another look?",
    "Works on my end now.",
    "Let me dig in and report back.",
    "Adding this to the agenda.",
    "Makes sense :+1:",
    "Could you link the doc?",
]

REACTIONS = ["+1", "tada", "rocket", "heart", "eyes", "white_check_mark", "fire", "clap", "raised_hands", "joy"]


def slugify_name(first, last):
    return f"{first.lower()}.{last.lower()}"


def build_users():
    """Return list of user dicts with team/channel memberships resolved."""
    users = []

    # Admin user first so it's easy to log in.
    admin = {
        "first": "System", "last": "Admin", "username": ADMIN_USERNAME,
        "email": f"{ADMIN_USERNAME}@example.com", "password": ADMIN_PASSWORD,
        "position": "System Administrator", "department": "engineering",
        "roles": "system_admin system_user",
    }
    users.append(admin)

    for first, last, position, dept in PEOPLE:
        users.append({
            "first": first, "last": last, "username": slugify_name(first, last),
            "email": f"{slugify_name(first, last)}@example.com", "password": DEFAULT_PASSWORD,
            "position": position, "department": dept, "roles": "system_user",
        })
    return users


def channel_has_dept(channel_meta, dept):
    depts = channel_meta[3]
    return "all" in depts or dept in depts


def assign_memberships(users, rng):
    """Compute which teams/channels each user belongs to.

    Returns the team membership structure attached to each user, plus a
    mapping of (team, channel) -> [usernames] for post authorship.
    """
    channel_members = {}

    # Decide team membership: engineering/product/design/qa/devops -> core team.
    # success/sales -> customer team. Admin + a few cross-over members are in both.
    for u in users:
        dept = u["department"]
        teams = []
        in_core = dept in ("engineering", "product", "design", "qa", "devops") or u["username"] == ADMIN_USERNAME
        in_customer = dept in ("success", "sales") or u["username"] == ADMIN_USERNAME
        # A couple of product folks also hang out in the customer org.
        if dept == "product" and rng.random() < 0.5:
            in_customer = True

        if in_core:
            teams.append(build_team_membership(u, "core", CORE_CHANNELS, rng, channel_members))
        if in_customer:
            teams.append(build_team_membership(u, "customer", CUSTOMER_CHANNELS, rng, channel_members))
        u["teams"] = teams
    return channel_members


def build_team_membership(user, team_name, channels, rng, channel_members):
    dept = user["department"]
    team_admin = user["username"] == ADMIN_USERNAME or rng.random() < 0.15
    chan_list = []
    for cname, meta in channels.items():
        join = channel_has_dept(meta, dept)
        # Even if not department-aligned, sometimes join optional public channels.
        if not join and meta[1] == "O" and rng.random() < 0.35:
            join = True
        if user["username"] == ADMIN_USERNAME:
            join = True
        if not join:
            continue
        roles = "channel_user"
        if rng.random() < 0.15:
            roles = "channel_user channel_admin"
        chan_list.append({"name": cname, "roles": roles, "favorite": rng.random() < 0.2})
        channel_members.setdefault((team_name, cname), []).append(user["username"])

    return {
        "name": team_name,
        "roles": "team_user team_admin" if team_admin else "team_user",
        "channels": chan_list,
    }


def random_timestamp_ms(rng, days_back):
    """Return an epoch-ms timestamp within the last ``days_back`` days, weighted
    toward weekday business hours so activity charts look realistic."""
    now = datetime.now(timezone.utc)
    day_offset = rng.randint(0, days_back)
    day = now - timedelta(days=day_offset)
    # Re-roll weekends toward weekdays to concentrate activity.
    if day.weekday() >= 5 and rng.random() < 0.7:
        day = day - timedelta(days=2)
    # Business hours weighting (UTC) with some spread.
    hour = int(min(23, max(0, rng.gauss(13, 3))))
    minute = rng.randint(0, 59)
    second = rng.randint(0, 59)
    ts = day.replace(hour=hour, minute=minute, second=second, microsecond=0)
    if ts > now:
        ts = now - timedelta(minutes=rng.randint(1, 120))
    return int(ts.timestamp() * 1000)


def make_message(rng, channel_base, members):
    pool = CHANNEL_MESSAGES.get(channel_base, []) + GENERIC_MESSAGES
    msg = rng.choice(pool)
    if "{mention}" in msg:
        mention = rng.choice(members) if members else "here"
        msg = msg.replace("{mention}", "@" + mention)
    return msg


def make_reactions(rng, members, parent_ts):
    reactions = []
    if rng.random() < 0.25:
        n = rng.randint(1, min(4, len(members)))
        reactors = rng.sample(members, min(n, len(members)))
        for r in reactors:
            reactions.append({
                "user": r,
                "emoji_name": rng.choice(REACTIONS),
                "create_at": parent_ts + rng.randint(30_000, 600_000),
            })
    return reactions


def make_replies(rng, members, parent_ts):
    replies = []
    if rng.random() < 0.3 and len(members) > 1:
        n = rng.randint(1, 4)
        last = parent_ts
        for _ in range(n):
            last = last + rng.randint(60_000, 1_800_000)
            replies.append({
                "user": rng.choice(members),
                "message": rng.choice(REPLY_MESSAGES),
                "create_at": last,
            })
    return replies


def generate(args):
    rng = random.Random(args.seed)
    # Timestamps are anchored to "now" and consume a variable number of random
    # draws (e.g. weekend re-rolls), so keep them on a separate stream to keep
    # the content/structure (counts, authors, replies, reactions) deterministic.
    time_rng = random.Random(args.seed)
    users = build_users()
    channel_members = assign_memberships(users, rng)

    lines = []
    lines.append({"type": "version", "version": 1})

    # Teams
    for tname, meta in TEAMS.items():
        lines.append({"type": "team", "team": {
            "name": tname,
            "display_name": meta["display"],
            "type": meta["type"],
            "description": meta["description"],
            "allow_open_invite": meta["type"] == "O",
        }})

    # Channels
    for tname, channels in (("core", CORE_CHANNELS), ("customer", CUSTOMER_CHANNELS)):
        for cname, meta in channels.items():
            lines.append({"type": "channel", "channel": {
                "team": tname,
                "name": cname,
                "display_name": meta[0],
                "type": meta[1],
                "purpose": meta[2],
                "header": meta[2],
            }})

    # Users
    for u in users:
        lines.append({"type": "user", "user": {
            "username": u["username"],
            "email": u["email"],
            "password": u["password"],
            "nickname": "",
            "first_name": u["first"],
            "last_name": u["last"],
            "position": u["position"],
            "roles": u["roles"],
            "teams": u["teams"],
        }})

    # Posts per channel
    total_posts = 0
    for (tname, cname), members in sorted(channel_members.items()):
        if not members:
            continue
        base = cname
        # Busier channels get more posts; town-square/engineering/product are lively.
        scale = {
            "town-square": 1.4, "engineering": 1.6, "product": 1.3,
            "off-topic": 1.2, "design": 1.1, "support": 1.2, "sales": 1.0,
        }.get(base, 1.0)
        count = int(args.posts_per_channel * scale)
        # Pre-generate sorted timestamps so the channel reads chronologically.
        timestamps = sorted(random_timestamp_ms(time_rng, args.days) for _ in range(count))
        for ts in timestamps:
            author = rng.choice(members)
            post = {
                "team": tname,
                "channel": cname,
                "user": author,
                "message": make_message(rng, base, members),
                "create_at": ts,
            }
            reactions = make_reactions(rng, members, ts)
            if reactions:
                post["reactions"] = reactions
            replies = make_replies(rng, members, ts)
            if replies:
                post["replies"] = replies
            lines.append({"type": "post", "post": post})
            total_posts += 1

    # Write out
    out = sys.stdout if args.out == "-" else open(args.out, "w", encoding="utf-8")
    try:
        for line in lines:
            out.write(json.dumps(line, ensure_ascii=False) + "\n")
    finally:
        if out is not sys.stdout:
            out.close()

    n_users = len(users)
    n_channels = len(CORE_CHANNELS) + len(CUSTOMER_CHANNELS)
    sys.stderr.write(
        f"Generated seed data: {len(TEAMS)} teams, {n_channels} channels, "
        f"{n_users} users, {total_posts} posts.\n"
    )


def main():
    parser = argparse.ArgumentParser(description="Generate Mattermost dev seed data (JSONL bulk import).")
    parser.add_argument("--out", "-o", default="-", help="Output file path, or - for stdout (default).")
    parser.add_argument("--seed", "-s", type=int, default=1, help="Random seed for deterministic output.")
    parser.add_argument("--posts-per-channel", "-p", type=int, default=60,
                        help="Base number of posts per channel (busy channels get more).")
    parser.add_argument("--days", "-d", type=int, default=30,
                        help="Spread message history over the last N days.")
    args = parser.parse_args()
    generate(args)


if __name__ == "__main__":
    main()
