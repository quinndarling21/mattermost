# Security advisory: MMSA-2026-0042

> Sample advisory for tone reference. Identifiers, versions, and dates are fictional.

**Severity:** High (CVSS 8.1)
**Affected versions:** Mattermost Server 9.4.0 through 9.6.2
**Fixed in:** 9.6.3, 9.7.0
**Published:** 2026-06-30

## Summary

A flaw in channel permission checks could allow an authenticated member to read messages in private channels they had not joined, under specific role configurations. The issue does not affect deployments using the default permission scheme.

## Impact

An authenticated user with a custom role granting `read_channel` at the system level could access private channel content within their team. The issue requires a non-default role configuration and a valid account; it cannot be triggered anonymously.

## Affected configurations

- Custom permission schemes that grant `read_channel` at the system or team scope.
- Self-hosted deployments on the affected versions. Mattermost Cloud was patched on 2026-06-28.

## Remediation

1. Upgrade to 9.6.3 or 9.7.0.
2. If you cannot upgrade immediately, review custom roles in the System Console and remove system-scoped `read_channel` grants until you can.
3. Review the audit log for unexpected channel access during the affected period.

## Credit

Reported by an external researcher through our responsible disclosure process. We thank them for the report.

## References

- Upgrade notes: see the release documentation for 9.6.3.
- Questions: contact the security team through the disclosure channel listed in `SECURITY.md`.
