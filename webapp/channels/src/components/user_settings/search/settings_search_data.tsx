// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {IntlShape, MessageDescriptor} from 'react-intl';
import {defineMessages} from 'react-intl';

// A single searchable settings entry. `tab` and `section` map directly onto the
// modal's active_tab / active_section state so a result can deep-link the user
// straight to the relevant collapsible section.
export type SettingsSearchEntry = {
    tab: string;
    section: string;
    title: MessageDescriptor;
    description: MessageDescriptor;

    // Space-separated synonyms/aliases that should also match this entry (e.g.
    // "dark mode" for Theme, "2fa" for multi-factor auth). Kept translatable so
    // localized queries keep working.
    keywords: MessageDescriptor;
};

export type SettingsSearchResult = SettingsSearchEntry & {
    score: number;
};

// Human-readable category label per tab, reused from the sidebar tab names.
const categoryMessages = defineMessages({
    notifications: {id: 'user.settings.modal.notifications', defaultMessage: 'Notifications'},
    display: {id: 'user.settings.modal.display', defaultMessage: 'Display'},
    sidebar: {id: 'user.settings.modal.sidebar', defaultMessage: 'Sidebar'},
    advanced: {id: 'user.settings.modal.advanced', defaultMessage: 'Advanced'},
    profile: {id: 'user.settings.modal.profile', defaultMessage: 'Profile Settings'},
    security: {id: 'user.settings.modal.security', defaultMessage: 'Security'},
});

export function getCategoryLabel(tab: string): MessageDescriptor | undefined {
    return (categoryMessages as Record<string, MessageDescriptor>)[tab];
}

const messages = defineMessages({
    notificationsDesktopTitle: {id: 'user.settings.search.notifications.desktop.title', defaultMessage: 'Desktop and mobile notifications'},
    notificationsDesktopDesc: {id: 'user.settings.search.notifications.desktop.description', defaultMessage: 'Choose when and how you are notified on desktop and mobile.'},
    notificationsDesktopKeywords: {id: 'user.settings.search.notifications.desktop.keywords', defaultMessage: 'push alerts sound banner badge mobile desktop notify'},

    notificationsEmailTitle: {id: 'user.settings.search.notifications.email.title', defaultMessage: 'Email notifications'},
    notificationsEmailDesc: {id: 'user.settings.search.notifications.email.description', defaultMessage: 'Control how often you receive email notifications.'},
    notificationsEmailKeywords: {id: 'user.settings.search.notifications.email.keywords', defaultMessage: 'email inbox digest frequency'},

    notificationsMentionsTitle: {id: 'user.settings.search.notifications.mentions.title', defaultMessage: 'Keywords that trigger mentions'},
    notificationsMentionsDesc: {id: 'user.settings.search.notifications.mentions.description', defaultMessage: 'Choose which words notify you like an @mention.'},
    notificationsMentionsKeywords: {id: 'user.settings.search.notifications.mentions.keywords', defaultMessage: 'mention at name username case sensitive channel wide here all'},

    notificationsHighlightTitle: {id: 'user.settings.search.notifications.highlight.title', defaultMessage: 'Keywords that get highlighted'},
    notificationsHighlightDesc: {id: 'user.settings.search.notifications.highlight.description', defaultMessage: 'Highlight words without triggering a notification.'},
    notificationsHighlightKeywords: {id: 'user.settings.search.notifications.highlight.keywords', defaultMessage: 'highlight keyword emphasize color'},

    notificationsReplyTitle: {id: 'user.settings.search.notifications.reply.title', defaultMessage: 'Reply notifications'},
    notificationsReplyDesc: {id: 'user.settings.search.notifications.reply.description', defaultMessage: 'Get notified about replies to threads you participate in.'},
    notificationsReplyKeywords: {id: 'user.settings.search.notifications.reply.keywords', defaultMessage: 'reply thread root comment'},

    notificationsAutoResponderTitle: {id: 'user.settings.search.notifications.autoResponder.title', defaultMessage: 'Automatic replies'},
    notificationsAutoResponderDesc: {id: 'user.settings.search.notifications.autoResponder.description', defaultMessage: 'Set an out-of-office message sent automatically to others.'},
    notificationsAutoResponderKeywords: {id: 'user.settings.search.notifications.autoResponder.keywords', defaultMessage: 'out of office away vacation auto responder ooo'},

    // Display
    displayThemeTitle: {id: 'user.settings.search.display.theme.title', defaultMessage: 'Theme'},
    displayThemeDesc: {id: 'user.settings.search.display.theme.description', defaultMessage: 'Change the color scheme of the interface.'},
    displayThemeKeywords: {id: 'user.settings.search.display.theme.keywords', defaultMessage: 'dark mode light mode color colours colors custom theme appearance'},

    displayMessageTitle: {id: 'user.settings.search.display.message.title', defaultMessage: 'Message Display'},
    displayMessageDesc: {id: 'user.settings.search.display.message.description', defaultMessage: 'Show messages in standard or compact view.'},
    displayMessageKeywords: {id: 'user.settings.search.display.message.keywords', defaultMessage: 'compact standard density colorize usernames'},

    displayChannelTitle: {id: 'user.settings.search.display.channel.title', defaultMessage: 'Channel Display'},
    displayChannelDesc: {id: 'user.settings.search.display.channel.description', defaultMessage: 'Set the width of the center channel.'},
    displayChannelKeywords: {id: 'user.settings.search.display.channel.keywords', defaultMessage: 'full width fixed centered layout'},

    displayClockTitle: {id: 'user.settings.search.display.clock.title', defaultMessage: 'Clock Display'},
    displayClockDesc: {id: 'user.settings.search.display.clock.description', defaultMessage: 'Show time in a 12-hour or 24-hour format.'},
    displayClockKeywords: {id: 'user.settings.search.display.clock.keywords', defaultMessage: '12 24 hour military time am pm format'},

    displayNameTitle: {id: 'user.settings.search.display.teammate.title', defaultMessage: 'Teammate Name Display'},
    displayNameDesc: {id: 'user.settings.search.display.teammate.description', defaultMessage: 'Choose how other people\u2019s names appear.'},
    displayNameKeywords: {id: 'user.settings.search.display.teammate.keywords', defaultMessage: 'username nickname full name display teammate'},

    displayThreadsTitle: {id: 'user.settings.search.display.threads.title', defaultMessage: 'Threaded Discussions'},
    displayThreadsDesc: {id: 'user.settings.search.display.threads.description', defaultMessage: 'Turn collapsed reply threads on or off.'},
    displayThreadsKeywords: {id: 'user.settings.search.display.threads.keywords', defaultMessage: 'crt collapsed reply threads thread view'},

    displayTimezoneTitle: {id: 'user.settings.search.display.timezone.title', defaultMessage: 'Timezone'},
    displayTimezoneDesc: {id: 'user.settings.search.display.timezone.description', defaultMessage: 'Set your timezone automatically or manually.'},
    displayTimezoneKeywords: {id: 'user.settings.search.display.timezone.keywords', defaultMessage: 'time zone region utc gmt'},

    displayLanguageTitle: {id: 'user.settings.search.display.language.title', defaultMessage: 'Language'},
    displayLanguageDesc: {id: 'user.settings.search.display.language.description', defaultMessage: 'Change the display language of the interface.'},
    displayLanguageKeywords: {id: 'user.settings.search.display.language.keywords', defaultMessage: 'locale translation localization internationalization'},

    displayLinkPreviewTitle: {id: 'user.settings.search.display.linkPreview.title', defaultMessage: 'Website Link Previews'},
    displayLinkPreviewDesc: {id: 'user.settings.search.display.linkPreview.description', defaultMessage: 'Show a preview of website content below messages.'},
    displayLinkPreviewKeywords: {id: 'user.settings.search.display.linkPreview.keywords', defaultMessage: 'url unfurl preview website link embed'},

    displayCollapseTitle: {id: 'user.settings.search.display.collapse.title', defaultMessage: 'Default Appearance of Image Previews'},
    displayCollapseDesc: {id: 'user.settings.search.display.collapse.description', defaultMessage: 'Show image previews expanded or collapsed by default.'},
    displayCollapseKeywords: {id: 'user.settings.search.display.collapse.keywords', defaultMessage: 'image preview expand collapse thumbnail attachment'},

    displayReactionsTitle: {id: 'user.settings.search.display.reactions.title', defaultMessage: 'Quick reactions on messages'},
    displayReactionsDesc: {id: 'user.settings.search.display.reactions.description', defaultMessage: 'Show recent reactions when hovering over a message.'},
    displayReactionsKeywords: {id: 'user.settings.search.display.reactions.keywords', defaultMessage: 'emoji reaction one click quick react'},

    displayClickReplyTitle: {id: 'user.settings.search.display.clickReply.title', defaultMessage: 'Click to open threads'},
    displayClickReplyDesc: {id: 'user.settings.search.display.clickReply.description', defaultMessage: 'Open a reply thread by clicking anywhere on a message.'},
    displayClickReplyKeywords: {id: 'user.settings.search.display.clickReply.keywords', defaultMessage: 'click reply thread open message'},

    displayAvailabilityTitle: {id: 'user.settings.search.display.availability.title', defaultMessage: 'Show online availability on profile images'},
    displayAvailabilityDesc: {id: 'user.settings.search.display.availability.description', defaultMessage: 'Show availability status on profile images in messages.'},
    displayAvailabilityKeywords: {id: 'user.settings.search.display.availability.keywords', defaultMessage: 'online status availability presence green dot'},

    // Sidebar
    sidebarUnreadsTitle: {id: 'user.settings.search.sidebar.unreads.title', defaultMessage: 'Group unread channels'},
    sidebarUnreadsDesc: {id: 'user.settings.search.sidebar.unreads.description', defaultMessage: 'Group channels with unread messages in a separate category.'},
    sidebarUnreadsKeywords: {id: 'user.settings.search.sidebar.unreads.keywords', defaultMessage: 'unread category group sidebar channels'},

    sidebarLimitDmsTitle: {id: 'user.settings.search.sidebar.limitDms.title', defaultMessage: 'Number of direct messages to show'},
    sidebarLimitDmsDesc: {id: 'user.settings.search.sidebar.limitDms.description', defaultMessage: 'Limit how many direct and group messages appear in the sidebar.'},
    sidebarLimitDmsKeywords: {id: 'user.settings.search.sidebar.limitDms.keywords', defaultMessage: 'dm gm direct group message limit sidebar count'},

    // Advanced
    advancedFormattingTitle: {id: 'user.settings.search.advanced.formatting.title', defaultMessage: 'Enable Post Formatting'},
    advancedFormattingDesc: {id: 'user.settings.search.advanced.formatting.description', defaultMessage: 'Render markdown formatting in messages.'},
    advancedFormattingKeywords: {id: 'user.settings.search.advanced.formatting.keywords', defaultMessage: 'markdown format bold italic code render'},

    advancedCtrlSendTitle: {id: 'user.settings.search.advanced.ctrlSend.title', defaultMessage: 'Send Messages on Ctrl+Enter'},
    advancedCtrlSendDesc: {id: 'user.settings.search.advanced.ctrlSend.description', defaultMessage: 'Choose the keyboard shortcut used to send messages.'},
    advancedCtrlSendKeywords: {id: 'user.settings.search.advanced.ctrlSend.keywords', defaultMessage: 'ctrl cmd enter send keyboard shortcut return'},

    advancedScrollTitle: {id: 'user.settings.search.advanced.scroll.title', defaultMessage: 'Scroll position when viewing an unread channel'},
    advancedScrollDesc: {id: 'user.settings.search.advanced.scroll.description', defaultMessage: 'Choose where the channel opens when it has unread messages.'},
    advancedScrollKeywords: {id: 'user.settings.search.advanced.scroll.keywords', defaultMessage: 'scroll unread position new messages line'},

    advancedJoinLeaveTitle: {id: 'user.settings.search.advanced.joinLeave.title', defaultMessage: 'Enable Join/Leave Messages'},
    advancedJoinLeaveDesc: {id: 'user.settings.search.advanced.joinLeave.description', defaultMessage: 'Show system messages when people join or leave channels.'},
    advancedJoinLeaveKeywords: {id: 'user.settings.search.advanced.joinLeave.keywords', defaultMessage: 'join leave system message added removed'},

    advancedSyncDraftsTitle: {id: 'user.settings.search.advanced.syncDrafts.title', defaultMessage: 'Allow message drafts to sync with the server'},
    advancedSyncDraftsDesc: {id: 'user.settings.search.advanced.syncDrafts.description', defaultMessage: 'Keep unsent message drafts available across devices.'},
    advancedSyncDraftsKeywords: {id: 'user.settings.search.advanced.syncDrafts.keywords', defaultMessage: 'draft sync server devices unsent'},

    advancedPerfTitle: {id: 'user.settings.search.advanced.performance.title', defaultMessage: 'Performance Debugging'},
    advancedPerfDesc: {id: 'user.settings.search.advanced.performance.description', defaultMessage: 'Disable features that can affect performance while troubleshooting.'},
    advancedPerfKeywords: {id: 'user.settings.search.advanced.performance.keywords', defaultMessage: 'performance debug troubleshoot slow lag'},

    advancedDeactivateTitle: {id: 'user.settings.search.advanced.deactivate.title', defaultMessage: 'Deactivate Account'},
    advancedDeactivateDesc: {id: 'user.settings.search.advanced.deactivate.description', defaultMessage: 'Deactivate your account and sign out everywhere.'},
    advancedDeactivateKeywords: {id: 'user.settings.search.advanced.deactivate.keywords', defaultMessage: 'deactivate delete disable close account remove'},

    // Profile
    profileNameTitle: {id: 'user.settings.search.profile.name.title', defaultMessage: 'Full Name'},
    profileNameDesc: {id: 'user.settings.search.profile.name.description', defaultMessage: 'Edit your first and last name.'},
    profileNameKeywords: {id: 'user.settings.search.profile.name.keywords', defaultMessage: 'first last full name real name'},

    profileUsernameTitle: {id: 'user.settings.search.profile.username.title', defaultMessage: 'Username'},
    profileUsernameDesc: {id: 'user.settings.search.profile.username.description', defaultMessage: 'Change the username used to mention you.'},
    profileUsernameKeywords: {id: 'user.settings.search.profile.username.keywords', defaultMessage: 'username handle mention login'},

    profileNicknameTitle: {id: 'user.settings.search.profile.nickname.title', defaultMessage: 'Nickname'},
    profileNicknameDesc: {id: 'user.settings.search.profile.nickname.description', defaultMessage: 'Set a nickname shown to teammates.'},
    profileNicknameKeywords: {id: 'user.settings.search.profile.nickname.keywords', defaultMessage: 'nickname alias display name'},

    profileEmailTitle: {id: 'user.settings.search.profile.email.title', defaultMessage: 'Email'},
    profileEmailDesc: {id: 'user.settings.search.profile.email.description', defaultMessage: 'Update the email address on your account.'},
    profileEmailKeywords: {id: 'user.settings.search.profile.email.keywords', defaultMessage: 'email address change'},

    profilePositionTitle: {id: 'user.settings.search.profile.position.title', defaultMessage: 'Position'},
    profilePositionDesc: {id: 'user.settings.search.profile.position.description', defaultMessage: 'Add your role or job title.'},
    profilePositionKeywords: {id: 'user.settings.search.profile.position.keywords', defaultMessage: 'position role title job'},

    profilePictureTitle: {id: 'user.settings.search.profile.picture.title', defaultMessage: 'Profile Picture'},
    profilePictureDesc: {id: 'user.settings.search.profile.picture.description', defaultMessage: 'Upload or change your profile picture.'},
    profilePictureKeywords: {id: 'user.settings.search.profile.picture.keywords', defaultMessage: 'avatar photo picture image upload'},

    // Security
    securityPasswordTitle: {id: 'user.settings.search.security.password.title', defaultMessage: 'Password'},
    securityPasswordDesc: {id: 'user.settings.search.security.password.description', defaultMessage: 'Change your account password.'},
    securityPasswordKeywords: {id: 'user.settings.search.security.password.keywords', defaultMessage: 'password change reset credentials'},

    securityMfaTitle: {id: 'user.settings.search.security.mfa.title', defaultMessage: 'Multi-factor Authentication'},
    securityMfaDesc: {id: 'user.settings.search.security.mfa.description', defaultMessage: 'Add an extra verification step when signing in.'},
    securityMfaKeywords: {id: 'user.settings.search.security.mfa.keywords', defaultMessage: '2fa two factor mfa authenticator otp verification'},

    securitySigninTitle: {id: 'user.settings.search.security.signin.title', defaultMessage: 'Sign-in Method'},
    securitySigninDesc: {id: 'user.settings.search.security.signin.description', defaultMessage: 'Manage how you sign in to your account.'},
    securitySigninKeywords: {id: 'user.settings.search.security.signin.keywords', defaultMessage: 'sign in login sso saml gitlab google office365 method'},

    securityAppsTitle: {id: 'user.settings.search.security.apps.title', defaultMessage: 'OAuth 2.0 Applications'},
    securityAppsDesc: {id: 'user.settings.search.security.apps.description', defaultMessage: 'Review applications authorized to access your account.'},
    securityAppsKeywords: {id: 'user.settings.search.security.apps.keywords', defaultMessage: 'oauth apps applications authorized integrations'},

    securityTokensTitle: {id: 'user.settings.search.security.tokens.title', defaultMessage: 'Personal Access Tokens'},
    securityTokensDesc: {id: 'user.settings.search.security.tokens.description', defaultMessage: 'Create and manage personal access tokens.'},
    securityTokensKeywords: {id: 'user.settings.search.security.tokens.keywords', defaultMessage: 'token pat api access personal'},
});

// The full searchable catalog. Section keys must match the section identifiers
// used by each settings tab so results can deep-link to a specific section.
export const settingsSearchEntries: SettingsSearchEntry[] = [
    {tab: 'notifications', section: 'desktopAndMobile', title: messages.notificationsDesktopTitle, description: messages.notificationsDesktopDesc, keywords: messages.notificationsDesktopKeywords},
    {tab: 'notifications', section: 'email', title: messages.notificationsEmailTitle, description: messages.notificationsEmailDesc, keywords: messages.notificationsEmailKeywords},
    {tab: 'notifications', section: 'keywordsAndMentions', title: messages.notificationsMentionsTitle, description: messages.notificationsMentionsDesc, keywords: messages.notificationsMentionsKeywords},
    {tab: 'notifications', section: 'keywordsAndHighlight', title: messages.notificationsHighlightTitle, description: messages.notificationsHighlightDesc, keywords: messages.notificationsHighlightKeywords},
    {tab: 'notifications', section: 'replyNotifications', title: messages.notificationsReplyTitle, description: messages.notificationsReplyDesc, keywords: messages.notificationsReplyKeywords},
    {tab: 'notifications', section: 'autoResponder', title: messages.notificationsAutoResponderTitle, description: messages.notificationsAutoResponderDesc, keywords: messages.notificationsAutoResponderKeywords},

    // Display
    {tab: 'display', section: 'theme', title: messages.displayThemeTitle, description: messages.displayThemeDesc, keywords: messages.displayThemeKeywords},
    {tab: 'display', section: 'message_display', title: messages.displayMessageTitle, description: messages.displayMessageDesc, keywords: messages.displayMessageKeywords},
    {tab: 'display', section: 'channel_display_mode', title: messages.displayChannelTitle, description: messages.displayChannelDesc, keywords: messages.displayChannelKeywords},
    {tab: 'display', section: 'clock', title: messages.displayClockTitle, description: messages.displayClockDesc, keywords: messages.displayClockKeywords},
    {tab: 'display', section: 'name_format', title: messages.displayNameTitle, description: messages.displayNameDesc, keywords: messages.displayNameKeywords},
    {tab: 'display', section: 'collapsed_reply_threads', title: messages.displayThreadsTitle, description: messages.displayThreadsDesc, keywords: messages.displayThreadsKeywords},
    {tab: 'display', section: 'timezone', title: messages.displayTimezoneTitle, description: messages.displayTimezoneDesc, keywords: messages.displayTimezoneKeywords},
    {tab: 'display', section: 'languages', title: messages.displayLanguageTitle, description: messages.displayLanguageDesc, keywords: messages.displayLanguageKeywords},
    {tab: 'display', section: 'linkpreview', title: messages.displayLinkPreviewTitle, description: messages.displayLinkPreviewDesc, keywords: messages.displayLinkPreviewKeywords},
    {tab: 'display', section: 'collapse', title: messages.displayCollapseTitle, description: messages.displayCollapseDesc, keywords: messages.displayCollapseKeywords},
    {tab: 'display', section: 'one_click_reactions_enabled', title: messages.displayReactionsTitle, description: messages.displayReactionsDesc, keywords: messages.displayReactionsKeywords},
    {tab: 'display', section: 'click_to_reply', title: messages.displayClickReplyTitle, description: messages.displayClickReplyDesc, keywords: messages.displayClickReplyKeywords},
    {tab: 'display', section: 'availabilityStatus', title: messages.displayAvailabilityTitle, description: messages.displayAvailabilityDesc, keywords: messages.displayAvailabilityKeywords},

    // Sidebar
    {tab: 'sidebar', section: 'showUnreadsCategory', title: messages.sidebarUnreadsTitle, description: messages.sidebarUnreadsDesc, keywords: messages.sidebarUnreadsKeywords},
    {tab: 'sidebar', section: 'limitVisibleGMsDMs', title: messages.sidebarLimitDmsTitle, description: messages.sidebarLimitDmsDesc, keywords: messages.sidebarLimitDmsKeywords},

    // Advanced
    {tab: 'advanced', section: 'formatting', title: messages.advancedFormattingTitle, description: messages.advancedFormattingDesc, keywords: messages.advancedFormattingKeywords},
    {tab: 'advanced', section: 'advancedCtrlSend', title: messages.advancedCtrlSendTitle, description: messages.advancedCtrlSendDesc, keywords: messages.advancedCtrlSendKeywords},
    {tab: 'advanced', section: 'unread_scroll_position', title: messages.advancedScrollTitle, description: messages.advancedScrollDesc, keywords: messages.advancedScrollKeywords},
    {tab: 'advanced', section: 'joinLeave', title: messages.advancedJoinLeaveTitle, description: messages.advancedJoinLeaveDesc, keywords: messages.advancedJoinLeaveKeywords},
    {tab: 'advanced', section: 'syncDrafts', title: messages.advancedSyncDraftsTitle, description: messages.advancedSyncDraftsDesc, keywords: messages.advancedSyncDraftsKeywords},
    {tab: 'advanced', section: 'performanceDebugging', title: messages.advancedPerfTitle, description: messages.advancedPerfDesc, keywords: messages.advancedPerfKeywords},
    {tab: 'advanced', section: 'deactivateAccount', title: messages.advancedDeactivateTitle, description: messages.advancedDeactivateDesc, keywords: messages.advancedDeactivateKeywords},

    // Profile
    {tab: 'profile', section: 'name', title: messages.profileNameTitle, description: messages.profileNameDesc, keywords: messages.profileNameKeywords},
    {tab: 'profile', section: 'username', title: messages.profileUsernameTitle, description: messages.profileUsernameDesc, keywords: messages.profileUsernameKeywords},
    {tab: 'profile', section: 'nickname', title: messages.profileNicknameTitle, description: messages.profileNicknameDesc, keywords: messages.profileNicknameKeywords},
    {tab: 'profile', section: 'email', title: messages.profileEmailTitle, description: messages.profileEmailDesc, keywords: messages.profileEmailKeywords},
    {tab: 'profile', section: 'position', title: messages.profilePositionTitle, description: messages.profilePositionDesc, keywords: messages.profilePositionKeywords},
    {tab: 'profile', section: 'picture', title: messages.profilePictureTitle, description: messages.profilePictureDesc, keywords: messages.profilePictureKeywords},

    // Security
    {tab: 'security', section: 'password', title: messages.securityPasswordTitle, description: messages.securityPasswordDesc, keywords: messages.securityPasswordKeywords},
    {tab: 'security', section: 'mfa', title: messages.securityMfaTitle, description: messages.securityMfaDesc, keywords: messages.securityMfaKeywords},
    {tab: 'security', section: 'signin', title: messages.securitySigninTitle, description: messages.securitySigninDesc, keywords: messages.securitySigninKeywords},
    {tab: 'security', section: 'apps', title: messages.securityAppsTitle, description: messages.securityAppsDesc, keywords: messages.securityAppsKeywords},
    {tab: 'security', section: 'tokens', title: messages.securityTokensTitle, description: messages.securityTokensDesc, keywords: messages.securityTokensKeywords},
];

function normalize(value: string): string {
    return value.toLowerCase().trim();
}

/**
 * Search the settings catalog.
 *
 * @param query        The raw user query.
 * @param intl         Intl instance used to localize titles/keywords before matching.
 * @param availableTabs Only entries whose tab is in this list are considered, so
 *                      results stay scoped to what the current modal actually shows.
 */
export function searchSettings(query: string, intl: IntlShape, availableTabs: string[]): SettingsSearchResult[] {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) {
        return [];
    }

    const terms = normalizedQuery.split(/\s+/).filter(Boolean);
    const availableSet = new Set(availableTabs);

    const results: SettingsSearchResult[] = [];

    for (const entry of settingsSearchEntries) {
        if (!availableSet.has(entry.tab)) {
            continue;
        }

        const title = normalize(intl.formatMessage(entry.title));
        const description = normalize(intl.formatMessage(entry.description));
        const keywords = normalize(intl.formatMessage(entry.keywords));
        const category = getCategoryLabel(entry.tab);
        const categoryText = category ? normalize(intl.formatMessage(category)) : '';

        const haystack = `${title} ${description} ${keywords} ${categoryText}`;

        // Every term must match somewhere for the entry to be included (AND semantics).
        const matchesAllTerms = terms.every((term) => haystack.includes(term));
        if (!matchesAllTerms) {
            continue;
        }

        // Rank: exact title match > title prefix > title contains > description/keyword only.
        let score = 0;
        if (title === normalizedQuery) {
            score = 100;
        } else if (title.startsWith(normalizedQuery)) {
            score = 75;
        } else if (title.includes(normalizedQuery)) {
            score = 50;
        } else if (terms.every((term) => title.includes(term))) {
            score = 40;
        } else if (description.includes(normalizedQuery)) {
            score = 25;
        } else {
            score = 10;
        }

        results.push({...entry, score});
    }

    return results.sort((a, b) => b.score - a.score);
}
