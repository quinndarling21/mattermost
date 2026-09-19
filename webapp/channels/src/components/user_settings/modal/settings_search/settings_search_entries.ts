// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {defineMessages} from 'react-intl';
import type {IntlShape, MessageDescriptor} from 'react-intl';

import Constants, {AdvancedSections, UserSettingsNotificationSections} from 'utils/constants';

const {Preferences} = Constants;

export type SettingsSearchEntry = {

    // The top-level settings tab that owns this setting (e.g. 'display', 'security').
    tab: string;

    // The section within the tab to open. When omitted, only the tab is opened.
    section?: string;

    // The user-facing label for the setting.
    label: MessageDescriptor;

    // Additional search terms (in English) that should match this setting.
    keywords: string[];
};

// These labels intentionally mirror the copy already shown inside each settings
// tab so that search results read the same as the settings they navigate to.
const messages = defineMessages({
    profileName: {id: 'user.settings.search.profile.name', defaultMessage: 'Full Name'},
    profileUsername: {id: 'user.settings.search.profile.username', defaultMessage: 'Username'},
    profileNickname: {id: 'user.settings.search.profile.nickname', defaultMessage: 'Nickname'},
    profilePosition: {id: 'user.settings.search.profile.position', defaultMessage: 'Position'},
    profileEmail: {id: 'user.settings.search.profile.email', defaultMessage: 'Email'},
    profilePicture: {id: 'user.settings.search.profile.picture', defaultMessage: 'Profile Picture'},

    securityPassword: {id: 'user.settings.search.security.password', defaultMessage: 'Password'},
    securityMfa: {id: 'user.settings.search.security.mfa', defaultMessage: 'Multi-factor Authentication'},
    securitySignin: {id: 'user.settings.search.security.signin', defaultMessage: 'Sign-in Method'},
    securityApps: {id: 'user.settings.search.security.apps', defaultMessage: 'OAuth 2.0 Applications'},
    securityTokens: {id: 'user.settings.search.security.tokens', defaultMessage: 'Personal Access Tokens'},

    notificationsDesktop: {id: 'user.settings.search.notifications.desktop', defaultMessage: 'Desktop and mobile notifications'},
    notificationsSound: {id: 'user.settings.search.notifications.sound', defaultMessage: 'Desktop notification sounds'},
    notificationsEmail: {id: 'user.settings.search.notifications.email', defaultMessage: 'Email notifications'},
    notificationsMentions: {id: 'user.settings.search.notifications.mentions', defaultMessage: 'Keywords that trigger mentions'},
    notificationsHighlight: {id: 'user.settings.search.notifications.highlight', defaultMessage: 'Keywords that get highlighted'},
    notificationsReply: {id: 'user.settings.search.notifications.reply', defaultMessage: 'Reply notifications'},
    notificationsAutoResponder: {id: 'user.settings.search.notifications.autoResponder', defaultMessage: 'Automatic direct message replies'},

    displayTheme: {id: 'user.settings.search.display.theme', defaultMessage: 'Theme'},
    displayClock: {id: 'user.settings.search.display.clock', defaultMessage: 'Clock Display'},
    displayNameFormat: {id: 'user.settings.search.display.nameFormat', defaultMessage: 'Teammate Name Display'},
    displayAvailability: {id: 'user.settings.search.display.availability', defaultMessage: 'Show online availability on profile images'},
    displayTimezone: {id: 'user.settings.search.display.timezone', defaultMessage: 'Timezone'},
    displayMessageDisplay: {id: 'user.settings.search.display.messageDisplay', defaultMessage: 'Message Display'},
    displayCollapsedThreads: {id: 'user.settings.search.display.collapsedThreads', defaultMessage: 'Collapsed Reply Threads'},
    displayChannelDisplay: {id: 'user.settings.search.display.channelDisplay', defaultMessage: 'Channel Display'},
    displayLanguage: {id: 'user.settings.search.display.language', defaultMessage: 'Language'},
    displayQuickReactions: {id: 'user.settings.search.display.quickReactions', defaultMessage: 'Quick reactions on messages'},
    displayLinkPreviews: {id: 'user.settings.search.display.linkPreviews', defaultMessage: 'Website Link Previews'},

    sidebarUnreads: {id: 'user.settings.search.sidebar.unreads', defaultMessage: 'Group unread channels'},
    sidebarLimitDms: {id: 'user.settings.search.sidebar.limitDms', defaultMessage: 'Number of direct messages to show'},

    advancedCtrlSend: {id: 'user.settings.search.advanced.ctrlSend', defaultMessage: 'Send Messages on Ctrl+Enter'},
    advancedFormatting: {id: 'user.settings.search.advanced.formatting', defaultMessage: 'Enable Post Formatting'},
    advancedJoinLeave: {id: 'user.settings.search.advanced.joinLeave', defaultMessage: 'Enable Join/Leave Messages'},
    advancedPerformance: {id: 'user.settings.search.advanced.performance', defaultMessage: 'Performance Debugging'},
    advancedSyncDrafts: {id: 'user.settings.search.advanced.syncDrafts', defaultMessage: 'Allow Draft Synchronization'},
});

// A curated, lightweight index of well-known settings. Section identifiers are
// sourced from the individual settings tabs so that navigation lands on the
// matching setting. If a section id drifts, navigation gracefully falls back to
// opening the parent tab.
const entries: SettingsSearchEntry[] = [

    // Profile
    {tab: 'profile', section: 'name', label: messages.profileName, keywords: ['name', 'full name', 'first name', 'last name']},
    {tab: 'profile', section: 'username', label: messages.profileUsername, keywords: ['username', 'handle']},
    {tab: 'profile', section: 'nickname', label: messages.profileNickname, keywords: ['nickname']},
    {tab: 'profile', section: 'position', label: messages.profilePosition, keywords: ['position', 'role', 'job title']},
    {tab: 'profile', section: 'email', label: messages.profileEmail, keywords: ['email', 'email address']},
    {tab: 'profile', section: 'picture', label: messages.profilePicture, keywords: ['picture', 'avatar', 'photo', 'image']},

    // Security
    {tab: 'security', section: 'password', label: messages.securityPassword, keywords: ['password', 'change password']},
    {tab: 'security', section: 'mfa', label: messages.securityMfa, keywords: ['mfa', '2fa', 'two factor', 'multi factor', 'authenticator']},
    {tab: 'security', section: 'signin', label: messages.securitySignin, keywords: ['sign in', 'signin', 'login', 'sso']},
    {tab: 'security', section: 'apps', label: messages.securityApps, keywords: ['oauth', 'apps', 'applications']},
    {tab: 'security', section: 'tokens', label: messages.securityTokens, keywords: ['token', 'access token', 'api token', 'personal access token']},

    // Notifications
    {tab: 'notifications', section: UserSettingsNotificationSections.DESKTOP_AND_MOBILE, label: messages.notificationsDesktop, keywords: ['desktop', 'mobile', 'push', 'alerts']},
    {tab: 'notifications', section: UserSettingsNotificationSections.DESKTOP_NOTIFICATION_SOUND, label: messages.notificationsSound, keywords: ['sound', 'notification sound', 'ring']},
    {tab: 'notifications', section: UserSettingsNotificationSections.EMAIL, label: messages.notificationsEmail, keywords: ['email notifications']},
    {tab: 'notifications', section: UserSettingsNotificationSections.KEYWORDS_MENTIONS, label: messages.notificationsMentions, keywords: ['mentions', 'keywords', 'trigger']},
    {tab: 'notifications', section: UserSettingsNotificationSections.KEYWORDS_HIGHLIGHT, label: messages.notificationsHighlight, keywords: ['highlight', 'highlighted keywords']},
    {tab: 'notifications', section: UserSettingsNotificationSections.REPLY_NOTIFCATIONS, label: messages.notificationsReply, keywords: ['reply', 'replies', 'threads']},
    {tab: 'notifications', section: UserSettingsNotificationSections.AUTO_RESPONDER, label: messages.notificationsAutoResponder, keywords: ['auto responder', 'away message', 'out of office', 'automatic reply']},

    // Display
    {tab: 'display', section: 'theme', label: messages.displayTheme, keywords: ['theme', 'color', 'colour', 'dark mode', 'appearance']},
    {tab: 'display', section: 'clock', label: messages.displayClock, keywords: ['clock', 'time', '24 hour', '12 hour', 'military time']},
    {tab: 'display', section: Preferences.NAME_NAME_FORMAT, label: messages.displayNameFormat, keywords: ['name display', 'teammate name', 'display name']},
    {tab: 'display', section: 'availabilityStatus', label: messages.displayAvailability, keywords: ['availability', 'online status', 'presence']},
    {tab: 'display', section: 'timezone', label: messages.displayTimezone, keywords: ['timezone', 'time zone']},
    {tab: 'display', section: Preferences.MESSAGE_DISPLAY, label: messages.displayMessageDisplay, keywords: ['message display', 'compact', 'standard']},
    {tab: 'display', section: Preferences.COLLAPSED_REPLY_THREADS, label: messages.displayCollapsedThreads, keywords: ['threads', 'collapsed reply threads']},
    {tab: 'display', section: Preferences.CHANNEL_DISPLAY_MODE, label: messages.displayChannelDisplay, keywords: ['channel display', 'full width', 'fixed width']},
    {tab: 'display', section: 'languages', label: messages.displayLanguage, keywords: ['language', 'locale']},
    {tab: 'display', section: Preferences.ONE_CLICK_REACTIONS_ENABLED, label: messages.displayQuickReactions, keywords: ['reactions', 'quick reactions', 'emoji reactions']},
    {tab: 'display', section: 'linkpreview', label: messages.displayLinkPreviews, keywords: ['link preview', 'website preview']},

    // Sidebar
    {tab: 'sidebar', section: 'showUnreadsCategory', label: messages.sidebarUnreads, keywords: ['unread', 'unreads category', 'group unread']},
    {tab: 'sidebar', section: 'limitVisibleGMsDMs', label: messages.sidebarLimitDms, keywords: ['direct messages', 'dms', 'gms', 'limit']},

    // Advanced
    {tab: 'advanced', section: AdvancedSections.CONTROL_SEND, label: messages.advancedCtrlSend, keywords: ['ctrl enter', 'send message', 'enter to send']},
    {tab: 'advanced', section: AdvancedSections.FORMATTING, label: messages.advancedFormatting, keywords: ['formatting', 'markdown']},
    {tab: 'advanced', section: AdvancedSections.JOIN_LEAVE, label: messages.advancedJoinLeave, keywords: ['join leave', 'system messages']},
    {tab: 'advanced', section: AdvancedSections.PERFORMANCE_DEBUGGING, label: messages.advancedPerformance, keywords: ['performance', 'debugging']},
    {tab: 'advanced', section: AdvancedSections.SYNC_DRAFTS, label: messages.advancedSyncDrafts, keywords: ['drafts', 'sync drafts']},
];

export function getSettingsSearchEntries(): SettingsSearchEntry[] {
    return entries;
}

// Normalizes a search string for case-insensitive, whitespace-insensitive matching.
export function normalizeSearchTerm(term: string): string {
    return term.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Returns true when the entry matches the (already normalized) query.
export function entryMatches(intl: IntlShape, entry: SettingsSearchEntry, normalizedQuery: string): boolean {
    if (!normalizedQuery) {
        return false;
    }

    const label = intl.formatMessage(entry.label).toLowerCase();
    if (label.includes(normalizedQuery)) {
        return true;
    }

    return entry.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery));
}
