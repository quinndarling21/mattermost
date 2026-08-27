# Webapp approval policy

Applies to files under `webapp/`. This policy is closer than the repo root default for Channels UI work.

## Auto-approve when all of these hold

- The PR is limited to low-risk UI copy, styles, or presentation-only tweaks (for example i18n string fixes, Sass under `webapp/channels/src/sass`, or non-behavioral component markup).
- The change does not alter auth, payments, permissions, or session handling UI listed below.
- Bugbot and Security review context (when enabled) report no findings that need human follow-up.
- Webapp CI is green (`webapp-ci` and related checks).

## Require human review

- Login, authorize, OAuth, and desktop auth UI (`webapp/channels/src/components/login`, `authorize`, `external_login_button`, and related auth components).
- Permission gates and permission scheme admin UI (`webapp/channels/src/components/permissions_gates`, `webapp/channels/src/components/admin_console/permission_schemes_settings`).
- Payment and cloud billing UI (`webapp/channels/src/components/payment_form`, payment announcement bars, and related admin console billing surfaces).
- Redux store or client session wiring that affects auth state (for example changes near `webapp/channels/src/packages/mattermost-redux/src/store/configureStore.ts`, owned in CODEOWNERS by `@hmhealey`).
- Design-token or shared CSS variable changes that owners treat as high impact (for example `webapp/channels/src/sass/base/_css_variables.scss`, owned in CODEOWNERS by `@quinn-darling`) when the diff is more than a localized tweak.
- Any edit to an `APPROVAL_POLICY.md`, `.cursor/approval-policies/ROUTING.md`, or a routed policy file.

## Conflict rule

Ancestor policies still apply unless they conflict with this file. If specificity is unclear, follow the stricter instruction and do not auto-approve.
