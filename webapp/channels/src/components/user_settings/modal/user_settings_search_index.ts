// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {IntlShape} from 'react-intl';

import {AdvancedSections, Preferences, UserSettingsNotificationSections} from 'utils/constants';

import type {PluginConfiguration} from 'types/plugins/user_settings';

export type SettingsSearchEntry = {
    tab: string;
    section?: string;
    label: string;
    tabLabel: string;
    type: 'tab' | 'section';
};

type SectionDefinition = {
    section: string;
    label: {id: string; defaultMessage: string};
};

function buildSectionEntries(
    tab: string,
    tabLabel: string,
    sections: SectionDefinition[],
    formatMessage: IntlShape['formatMessage'],
): SettingsSearchEntry[] {
    return sections.map(({section, label}) => ({
        tab,
        section,
        label: formatMessage(label),
        tabLabel,
        type: 'section',
    }));
}

export function buildUserSettingsSearchIndex(
    formatMessage: IntlShape['formatMessage'],
    isContentProductSettings: boolean,
    pluginSettings: {[pluginId: string]: PluginConfiguration},
): SettingsSearchEntry[] {
    const entries: SettingsSearchEntry[] = [];

    const profileTabLabel = formatMessage({id: 'user.settings.modal.profile', defaultMessage: 'Profile Settings'});
    const securityTabLabel = formatMessage({id: 'user.settings.modal.security', defaultMessage: 'Security'});
    const notificationsTabLabel = formatMessage({id: 'user.settings.modal.notifications', defaultMessage: 'Notifications'});
    const displayTabLabel = formatMessage({id: 'user.settings.modal.display', defaultMessage: 'Display'});
    const sidebarTabLabel = formatMessage({id: 'user.settings.modal.sidebar', defaultMessage: 'Sidebar'});
    const advancedTabLabel = formatMessage({id: 'user.settings.modal.advanced', defaultMessage: 'Advanced'});

    if (isContentProductSettings) {
        const productTabs: Array<{tab: string; label: string}> = [
            {tab: 'notifications', label: notificationsTabLabel},
            {tab: 'display', label: displayTabLabel},
            {tab: 'sidebar', label: sidebarTabLabel},
            {tab: 'advanced', label: advancedTabLabel},
        ];

        for (const {tab, label} of productTabs) {
            entries.push({tab, label, tabLabel: label, type: 'tab'});
        }

        entries.push(...buildSectionEntries('notifications', notificationsTabLabel, [
            {section: UserSettingsNotificationSections.DESKTOP_AND_MOBILE, label: {id: 'user.settings.notifications.desktopAndMobile', defaultMessage: 'Desktop and mobile notifications'}},
            {section: UserSettingsNotificationSections.DESKTOP_NOTIFICATION_SOUND, label: {id: 'user.settings.notifications.desktopNotificationSound', defaultMessage: 'Desktop notification sounds'}},
            {section: UserSettingsNotificationSections.EMAIL, label: {id: 'user.settings.notifications.email', defaultMessage: 'Email notifications'}},
            {section: UserSettingsNotificationSections.REPLY_NOTIFCATIONS, label: {id: 'user.settings.notifications.comments', defaultMessage: 'Reply notifications'}},
            {section: UserSettingsNotificationSections.KEYWORDS_MENTIONS, label: {id: 'user.settings.notifications.keywordsWithNotification.title', defaultMessage: 'Keywords that trigger notifications'}},
            {section: UserSettingsNotificationSections.KEYWORDS_HIGHLIGHT, label: {id: 'user.settings.notifications.keywordsWithHighlight.title', defaultMessage: 'Keywords that get highlighted (without notifications)'}},
            {section: UserSettingsNotificationSections.AUTO_RESPONDER, label: {id: 'user.settings.notifications.autoResponder', defaultMessage: 'Automatic Direct Message Replies'}},
        ], formatMessage));

        entries.push(...buildSectionEntries('display', displayTabLabel, [
            {section: 'theme', label: {id: 'user.settings.display.theme', defaultMessage: 'Theme'}},
            {section: 'languages', label: {id: 'user.settings.display.language', defaultMessage: 'Language'}},
            {section: 'timezone', label: {id: 'user.settings.display.timezone', defaultMessage: 'Timezone'}},
            {section: 'clock', label: {id: 'user.settings.display.clockDisplay', defaultMessage: 'Clock Display'}},
            {section: Preferences.MESSAGE_DISPLAY, label: {id: 'user.settings.display.messageDisplay', defaultMessage: 'Message Display'}},
            {section: Preferences.CHANNEL_DISPLAY_MODE, label: {id: 'user.settings.display.channelDisplayTitle', defaultMessage: 'Channel Display'}},
            {section: Preferences.NAME_NAME_FORMAT, label: {id: 'user.settings.display.teammateNameDisplay', defaultMessage: 'Teammate Name Display'}},
            {section: 'collapse', label: {id: 'user.settings.display.collapsePreview', defaultMessage: 'Default Appearance of Image Previews'}},
            {section: 'linkpreview', label: {id: 'user.settings.display.linkPreview', defaultMessage: 'Website Link Previews'}},
            {section: 'lastactive', label: {id: 'user.settings.display.lastActive', defaultMessage: 'Share last active time'}},
            {section: 'availabilityStatus', label: {id: 'user.settings.display.availabilityStatusOnPosts', defaultMessage: 'Show online availability on profile images'}},
            {section: Preferences.COLLAPSED_REPLY_THREADS, label: {id: 'user.settings.display.collapsedReplyThreads', defaultMessage: 'Collapsed Reply Threads'}},
            {section: Preferences.CLICK_TO_REPLY, label: {id: 'user.settings.display.clickToReply', defaultMessage: 'Click to reply'}},
            {section: Preferences.ONE_CLICK_REACTIONS_ENABLED, label: {id: 'user.settings.display.oneClickReactionsOnPosts', defaultMessage: 'One-click reactions on messages'}},
            {section: 'renderEmoticonsAsEmoji', label: {id: 'user.settings.display.renderEmoticonsAsEmoji', defaultMessage: 'Render emoticons as emojis'}},
        ], formatMessage));

        entries.push(...buildSectionEntries('sidebar', sidebarTabLabel, [
            {section: 'showUnreadsCategory', label: {id: 'user.settings.sidebar.showUnreadsCategory', defaultMessage: 'Group unread channels separately'}},
            {section: 'limitVisibleGMsDMs', label: {id: 'user.settings.sidebar.limitVisibleGMsDMs', defaultMessage: 'Number of direct messages to show'}},
        ], formatMessage));

        entries.push(...buildSectionEntries('advanced', advancedTabLabel, [
            {section: 'formatting', label: {id: 'user.settings.advance.formatting', defaultMessage: 'Enable Post Formatting'}},
            {section: Preferences.UNREAD_SCROLL_POSITION, label: {id: 'user.settings.advance.unreadScrollPosition', defaultMessage: 'Scroll position when viewing an unread channel'}},
            {section: AdvancedSections.SYNC_DRAFTS, label: {id: 'user.settings.advance.syncDrafts', defaultMessage: 'Allow message drafts to sync with the server'}},
            {section: AdvancedSections.CONTROL_SEND, label: {id: 'user.settings.advance.sendOnCtrlEnter', defaultMessage: 'Send Messages on CTRL+ENTER'}},
            {section: AdvancedSections.JOIN_LEAVE, label: {id: 'user.settings.advance.joinLeave', defaultMessage: 'Enable Join/Leave Messages'}},
            {section: AdvancedSections.PERFORMANCE_DEBUGGING, label: {id: 'user.settings.advance.performanceDebugging', defaultMessage: 'Performance Debugging'}},
            {section: 'deactivateAccount', label: {id: 'user.settings.advance.deactivateAccount', defaultMessage: 'Deactivate Account'}},
            {section: 'enableConcurrentReactExperimental', label: {id: 'user.settings.advance.enableConcurrentReactExperimental', defaultMessage: 'Enable Concurrent React (Experimental)'}},
        ], formatMessage));

        for (const plugin of Object.values(pluginSettings)) {
            entries.push({
                tab: plugin.id,
                label: plugin.uiName,
                tabLabel: plugin.uiName,
                type: 'tab',
            });

            for (const section of plugin.sections) {
                entries.push({
                    tab: plugin.id,
                    section: section.title,
                    label: section.title,
                    tabLabel: plugin.uiName,
                    type: 'section',
                });
            }
        }
    } else {
        entries.push(
            {tab: 'profile', label: profileTabLabel, tabLabel: profileTabLabel, type: 'tab'},
            {tab: 'security', label: securityTabLabel, tabLabel: securityTabLabel, type: 'tab'},
        );

        entries.push(...buildSectionEntries('profile', profileTabLabel, [
            {section: 'email', label: {id: 'user.settings.general.email', defaultMessage: 'Email'}},
            {section: 'name', label: {id: 'user.settings.general.fullName', defaultMessage: 'Full Name'}},
            {section: 'nickname', label: {id: 'user.settings.general.nickname', defaultMessage: 'Nickname'}},
            {section: 'username', label: {id: 'user.settings.general.username', defaultMessage: 'Username'}},
            {section: 'position', label: {id: 'user.settings.general.position', defaultMessage: 'Position'}},
            {section: 'picture', label: {id: 'user.settings.general.picture', defaultMessage: 'Profile Picture'}},
        ], formatMessage));

        entries.push(...buildSectionEntries('security', securityTabLabel, [
            {section: 'password', label: {id: 'user.settings.security.password', defaultMessage: 'Password'}},
            {section: 'signin', label: {id: 'user.settings.security.method', defaultMessage: 'Sign-in Method'}},
            {section: 'apps', label: {id: 'user.settings.security.oauthApps', defaultMessage: 'OAuth 2.0 Applications'}},
            {section: 'tokens', label: {id: 'user.settings.security.tokens', defaultMessage: 'Personal Access Tokens'}},
            {section: 'mfa', label: {id: 'user.settings.security.mfa', defaultMessage: 'Multi-factor Authentication'}},
        ], formatMessage));
    }

    return entries;
}

export function normalizeSearchQuery(query: string): string {
    return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function matchesSettingsSearch(label: string, query: string): boolean {
    const normalizedQuery = normalizeSearchQuery(query);
    if (!normalizedQuery) {
        return false;
    }

    return label.toLowerCase().includes(normalizedQuery);
}

export function filterSettingsSearchEntries(
    entries: SettingsSearchEntry[],
    query: string,
): SettingsSearchEntry[] {
    const normalizedQuery = normalizeSearchQuery(query);
    if (!normalizedQuery) {
        return [];
    }

    const seen = new Set<string>();
    const results: SettingsSearchEntry[] = [];

    for (const entry of entries) {
        if (!matchesSettingsSearch(entry.label, query) && !matchesSettingsSearch(entry.tabLabel, query)) {
            continue;
        }

        const key = `${entry.tab}:${entry.section ?? ''}:${entry.type}`;
        if (seen.has(key)) {
            continue;
        }

        seen.add(key);
        results.push(entry);
    }

    return results;
}
