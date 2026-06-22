# Teams and channels

Teams and channels define where conversations happen and who can join them.

## Teams

Teams are either open or invite-only. Open teams can allow discovery and joining without an invitation. Invite-only teams require an invitation, membership sync, or an admin action.

Admins can configure:

- Maximum users per team.
- Whether users may create teams.
- Whether users may join teams by email domain.
- Whether users may send direct messages to any user on the server or only users on shared teams.
- Whether team membership is managed by LDAP or AD groups.

## Channels

Channels can be public, private, direct messages, or group direct messages. Boards also define board-specific channel types for integration with the Boards plugin.

Admins and channel managers can configure:

- Public or private visibility.
- Membership modes, including group sync for managed channels.
- Channel moderation rules for posting, reactions, mentions, bookmarks, and member management.
- Default channel behavior for channels such as Town Square.

## Practical admin guidance

Use team and channel modes when the membership model matters more than per-channel permissions. Use permission schemes and channel moderation when the same membership should have different capabilities in different channels.
