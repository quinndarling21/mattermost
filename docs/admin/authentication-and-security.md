# Authentication and security

Authentication settings control who can create accounts, how users sign in, and which security checks apply to sessions and clients.

## Signup and invitations

Admins can control whether account creation is open, invitation-only, or restricted by email domain. Email invitations expire and can be invalidated. Guest access has separate controls, including domain allowlists and guest tag visibility.

## Login methods

Supported login areas include:

- Email and username login.
- GitLab login.
- OpenID Connect.
- OAuth with providers such as Google and Office 365.
- SAML 2.0.
- AD/LDAP.

## Passwords and MFA

Password policy settings live in System Console. MFA can be optional or enforced for supported login methods when the licensed feature is available.

## Sessions and mobile security

Admins can configure session lengths and maximum login attempts. Enterprise mobile security settings cover biometrics, screen capture blocking, jailbreak or root detection, secure file preview, and Microsoft Intune MAM.

## Security reporting

Use `SECURITY.md` for the vulnerability reporting process. Do not include undisclosed vulnerability details in product docs or automation output.
