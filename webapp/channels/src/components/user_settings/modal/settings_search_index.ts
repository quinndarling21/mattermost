// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {IntlShape} from 'react-intl';

import {isMac} from '@mattermost/shared/utils/user_agent';

import {AdvancedSections, Preferences, UserSettingsNotificationSections} from 'utils/constants';

import type {PluginConfiguration} from 'types/plugins/user_settings';

export type SettingsSearchResult = {
    id: string;
    tab: string;
    section?: string;
    label: string;
    tabLabel: string;
};

type SearchIndexEntry = {
    tab: string;
    section?: string;
    label: Parameters<IntlShape['formatMessage']>[0];
};

function buildBuiltinSearchEntries(isContentProductSettings: boolean): SearchIndexEntry[] {
    if (isContentProductSettings) {
        const ctrlSendLabel = isMac() ?
            {id: 'user.settings.advance.sendTitle.mac', defaultMessage: 'Send Messages on ⌘+ENTER'} :
            {id: 'user.settings.advance.sendTitle', defaultMessage: 'Send Messages on CTRL+ENTER'};

        return [
            {tab: 'notifications', label: {id: 'user.settings.modal.notifications', defaultMessage: 'Notifications'}},
            {tab: 'display', label: {id: 'user.settings.modal.display', defaultMessage: 'Display'}},
            {tab: 'sidebar', label: {id: 'user.settings.modal.sidebar', defaultMessage: 'Sidebar'}},
            {tab: 'advanced', label: {id: 'user.settings.modal.advanced', defaultMessage: 'Advanced'}},

            {tab: 'notifications', section: UserSettingsNotificationSections.DESKTOP_AND_MOBILE, label: {id: 'user.settings.notifications.desktopAndMobile.title', defaultMessage: 'Desktop and mobile notifications'}},
            {tab: 'notifications', section: UserSettingsNotificationSections.DESKTOP_NOTIFICATION_SOUND, label: {id: 'user.settings.notifications.desktopNotificationSounds.title', defaultMessage: 'Desktop notification sounds'}},
            {tab: 'notifications', section: UserSettingsNotificationSections.EMAIL, label: {id: 'user.settings.notifications.emailNotifications', defaultMessage: 'Email notifications'}},
            {tab: 'notifications', section: UserSettingsNotificationSections.KEYWORDS_MENTIONS, label: {id: 'user.settings.notifications.keywordsWithNotification.title', defaultMessage: 'Keywords that trigger notifications'}},
            {tab: 'notifications', section: UserSettingsNotificationSections.KEYWORDS_HIGHLIGHT, label: {id: 'user.settings.notifications.keywordsWithHighlight.title', defaultMessage: 'Keywords that get highlighted (without notifications)'}},
            {tab: 'notifications', section: UserSettingsNotificationSections.REPLY_NOTIFCATIONS, label: {id: 'user.settings.notifications.comments', defaultMessage: 'Reply notifications'}},
            {tab: 'notifications', section: UserSettingsNotificationSections.AUTO_RESPONDER, label: {id: 'user.settings.notifications.autoResponder', defaultMessage: 'Automatic direct message replies'}},

            {tab: 'display', section: 'theme', label: {id: 'user.settings.display.theme.title', defaultMessage: 'Theme'}},
            {tab: 'display', section: 'timezone', label: {id: 'user.settings.display.timezone', defaultMessage: 'Timezone'}},
            {tab: 'display', section: 'languages', label: {id: 'user.settings.display.language', defaultMessage: 'Language'}},
            {tab: 'display', section: 'clock', label: {id: 'user.settings.display.clockDisplay', defaultMessage: 'Clock Display'}},
            {tab: 'display', section: Preferences.MESSAGE_DISPLAY, label: {id: 'user.settings.display.messageDisplayTitle', defaultMessage: 'Message Display'}},
            {tab: 'display', section: Preferences.CHANNEL_DISPLAY_MODE, label: {id: 'user.settings.display.channelDisplayTitle', defaultMessage: 'Channel Display'}},
            {tab: 'display', section: Preferences.COLLAPSED_REPLY_THREADS, label: {id: 'user.settings.display.collapsedReplyThreadsTitle', defaultMessage: 'Collapsed Reply Threads'}},
            {tab: 'display', section: Preferences.CLICK_TO_REPLY, label: {id: 'user.settings.display.clickToReplyTitle', defaultMessage: 'Click to Reply'}},
            {tab: 'display', section: Preferences.NAME_NAME_FORMAT, label: {id: 'user.settings.display.teammateNameDisplayTitle', defaultMessage: 'Teammate Name Display'}},
            {tab: 'display', section: 'availabilityStatus', label: {id: 'user.settings.display.availabilityStatusOnPostsTitle', defaultMessage: 'Show online availability on profile images'}},
            {tab: 'display', section: 'collapse', label: {id: 'user.settings.display.collapseDisplay', defaultMessage: 'Default Appearance of Image Previews'}},
            {tab: 'display', section: 'linkpreview', label: {id: 'user.settings.display.linkPreviewDisplay', defaultMessage: 'Website Link Previews'}},
            {tab: 'display', section: 'lastactive', label: {id: 'user.settings.display.lastActiveDisplay', defaultMessage: 'Share last active time'}},

            {tab: 'sidebar', section: 'showUnreadsCategory', label: {id: 'user.settings.sidebar.showUnreadsCategoryTitle', defaultMessage: 'Group unread channels separately'}},
            {tab: 'sidebar', section: 'limitVisibleGMsDMs', label: {id: 'user.settings.sidebar.limitVisibleGMsDMsTitle', defaultMessage: 'Number of direct messages to show'}},

            {tab: 'advanced', section: AdvancedSections.CONTROL_SEND, label: ctrlSendLabel},
            {tab: 'advanced', section: AdvancedSections.FORMATTING, label: {id: 'user.settings.advance.formattingTitle', defaultMessage: 'Enable Post Formatting'}},
            {tab: 'advanced', section: AdvancedSections.JOIN_LEAVE, label: {id: 'user.settings.advance.joinLeaveTitle', defaultMessage: 'Enable Join/Leave Messages'}},
            {tab: 'advanced', section: AdvancedSections.PERFORMANCE_DEBUGGING, label: {id: 'user.settings.advance.performance.title', defaultMessage: 'Performance Debugging'}},
            {tab: 'advanced', section: AdvancedSections.SYNC_DRAFTS, label: {id: 'user.settings.advance.syncDrafts.Title', defaultMessage: 'Allow message drafts to sync with the server'}},
            {tab: 'advanced', section: Preferences.UNREAD_SCROLL_POSITION, label: {id: 'user.settings.advance.unreadScrollPositionTitle', defaultMessage: 'Scroll position when viewing an unread channel'}},
        ];
    }

    return [
        {tab: 'profile', label: {id: 'user.settings.modal.profile', defaultMessage: 'Profile Settings'}},
        {tab: 'security', label: {id: 'user.settings.modal.security', defaultMessage: 'Security'}},

        {tab: 'profile', section: 'email', label: {id: 'user.settings.general.email', defaultMessage: 'Email'}},
        {tab: 'profile', section: 'name', label: {id: 'user.settings.general.fullName', defaultMessage: 'Full Name'}},
        {tab: 'profile', section: 'nickname', label: {id: 'user.settings.general.nickname', defaultMessage: 'Nickname'}},
        {tab: 'profile', section: 'username', label: {id: 'user.settings.general.username', defaultMessage: 'Username'}},
        {tab: 'profile', section: 'position', label: {id: 'user.settings.general.position', defaultMessage: 'Position'}},
        {tab: 'profile', section: 'picture', label: {id: 'user.settings.general.picture', defaultMessage: 'Profile Picture'}},

        {tab: 'security', section: 'password', label: {id: 'user.settings.security.password', defaultMessage: 'Password'}},
        {tab: 'security', section: 'signin', label: {id: 'user.settings.security.method', defaultMessage: 'Sign-in Method'}},
        {tab: 'security', section: 'mfa', label: {id: 'user.settings.mfa.title', defaultMessage: 'Multi-factor Authentication'}},
        {tab: 'security', section: 'apps', label: {id: 'user.settings.security.oauthApps', defaultMessage: 'OAuth 2.0 Applications'}},
        {tab: 'security', section: 'tokens', label: {id: 'user.settings.tokens.title', defaultMessage: 'Personal Access Tokens'}},
    ];
}

export function normalizeSettingsSearchQuery(query: string): string {
    return query.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function matchesSettingsSearch(label: string, query: string): boolean {
    const normalizedQuery = normalizeSettingsSearchQuery(query);
    if (!normalizedQuery) {
        return false;
    }

    return label.toLowerCase().includes(normalizedQuery);
}

export function buildSettingsSearchIndex(
    formatMessage: IntlShape['formatMessage'],
    options: {
        isContentProductSettings: boolean;
        pluginSettings: {[pluginId: string]: PluginConfiguration};
    },
): SettingsSearchResult[] {
    const tabLabels = new Map<string, string>();
    const results: SettingsSearchResult[] = [];

    const addEntry = (entry: SearchIndexEntry) => {
        const label = formatMessage(entry.label);
        if (!tabLabels.has(entry.tab)) {
            tabLabels.set(entry.tab, label);
        }

        const tabLabel = tabLabels.get(entry.tab) || label;
        const id = entry.section ? `${entry.tab}:${entry.section}` : entry.tab;

        results.push({
            id,
            tab: entry.tab,
            section: entry.section,
            label,
            tabLabel,
        });
    };

    for (const entry of buildBuiltinSearchEntries(options.isContentProductSettings)) {
        addEntry(entry);
    }

    for (const plugin of Object.values(options.pluginSettings)) {
        results.push({
            id: plugin.id,
            tab: plugin.id,
            label: plugin.uiName,
            tabLabel: plugin.uiName,
        });

        for (const section of plugin.sections) {
            results.push({
                id: `${plugin.id}:${section.title}`,
                tab: plugin.id,
                section: section.title,
                label: section.title,
                tabLabel: plugin.uiName,
            });
        }
    }

    return results;
}

export function filterSettingsSearchResults(
    index: SettingsSearchResult[],
    query: string,
): SettingsSearchResult[] {
    const normalizedQuery = normalizeSettingsSearchQuery(query);
    if (!normalizedQuery) {
        return [];
    }

    const seen = new Set<string>();
    const filtered: SettingsSearchResult[] = [];

    for (const entry of index) {
        const matchesLabel = matchesSettingsSearch(entry.label, query);
        const matchesTab = entry.section && matchesSettingsSearch(entry.tabLabel, query);

        if (!matchesLabel && !matchesTab) {
            continue;
        }

        if (seen.has(entry.id)) {
            continue;
        }

        seen.add(entry.id);
        filtered.push(entry);
    }

    return filtered;
}
