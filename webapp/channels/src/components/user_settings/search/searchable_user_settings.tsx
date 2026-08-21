// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import FlexSearch from 'flexsearch/dist/flexsearch.es5';
import {defineMessage} from 'react-intl';
import type {IntlShape, MessageDescriptor} from 'react-intl';

import type {PluginConfiguration} from 'types/plugins/user_settings';

export type SearchableUserSetting = {

    /** The settings tab the setting lives in (matches the SettingsSidebar tab name). */
    tab: string;

    /** The section id passed to updateSection when navigating to this setting. */
    section: string;

    /**
     * Title of the setting, shown as the primary text in search results.
     * Built-in settings use a MessageDescriptor; plugin sections provide a plain string.
     */
    title: MessageDescriptor | string;

    /** Localized label of the parent tab, shown as the secondary text in search results. */
    tabLabel: MessageDescriptor | string;

    /**
     * Extra, non-localized terms that should match this setting (synonyms, abbreviations).
     * These improve discoverability without requiring a translation entry.
     */
    keywords?: string[];
};

const tabLabels = {
    notifications: defineMessage({id: 'user.settings.modal.notifications', defaultMessage: 'Notifications'}),
    display: defineMessage({id: 'user.settings.modal.display', defaultMessage: 'Display'}),
    sidebar: defineMessage({id: 'user.settings.modal.sidebar', defaultMessage: 'Sidebar'}),
    advanced: defineMessage({id: 'user.settings.modal.advanced', defaultMessage: 'Advanced'}),
};

// Static registry of the built-in settings that appear in the main "Settings" dialog
// (isContentProductSettings === true). Plugin-provided settings are indexed separately
// and dynamically via getPluginSearchableSettings.
export const builtInSearchableSettings: SearchableUserSetting[] = [

    // Notifications
    {
        tab: 'notifications',
        tabLabel: tabLabels.notifications,
        section: 'desktopAndMobile',
        title: defineMessage({id: 'user.settings.notifications.desktopAndMobile.title', defaultMessage: 'Desktop and mobile notifications'}),
        keywords: ['push', 'alert', 'banner', 'mobile'],
    },
    {
        tab: 'notifications',
        tabLabel: tabLabels.notifications,
        section: 'desktopNotificationSound',
        title: defineMessage({id: 'user.settings.notifications.desktopNotificationSounds.title', defaultMessage: 'Desktop notification sounds'}),
        keywords: ['sound', 'audio', 'ring', 'chime'],
    },
    {
        tab: 'notifications',
        tabLabel: tabLabels.notifications,
        section: 'email',
        title: defineMessage({id: 'user.settings.notifications.emailNotifications', defaultMessage: 'Email notifications'}),
        keywords: ['email', 'mail'],
    },
    {
        tab: 'notifications',
        tabLabel: tabLabels.notifications,
        section: 'keywordsAndMentions',
        title: defineMessage({id: 'user.settings.notifications.keywordsWithNotification.title', defaultMessage: 'Keywords that trigger notifications'}),
        keywords: ['mention', 'keyword', 'trigger'],
    },
    {
        tab: 'notifications',
        tabLabel: tabLabels.notifications,
        section: 'keywordsAndHighlight',
        title: defineMessage({id: 'user.settings.notifications.keywordsWithHighlight.title', defaultMessage: 'Keywords that get highlighted (without notifications)'}),
        keywords: ['highlight', 'keyword'],
    },
    {
        tab: 'notifications',
        tabLabel: tabLabels.notifications,
        section: 'replyNotifications',
        title: defineMessage({id: 'user.settings.notifications.comments', defaultMessage: 'Reply notifications'}),
        keywords: ['reply', 'thread', 'comment'],
    },
    {
        tab: 'notifications',
        tabLabel: tabLabels.notifications,
        section: 'autoResponder',
        title: defineMessage({id: 'user.settings.notifications.autoResponder', defaultMessage: 'Automatic direct message replies'}),
        keywords: ['auto', 'responder', 'away', 'out of office', 'ooo'],
    },

    // Display
    {
        tab: 'display',
        tabLabel: tabLabels.display,
        section: 'theme',
        title: defineMessage({id: 'user.settings.display.theme.title', defaultMessage: 'Theme'}),
        keywords: ['theme', 'dark mode', 'light mode', 'color'],
    },
    {
        tab: 'display',
        tabLabel: tabLabels.display,
        section: 'collapsed_reply_threads',
        title: defineMessage({id: 'user.settings.display.collapsedReplyThreadsTitle', defaultMessage: 'Threaded Discussions'}),
        keywords: ['threads', 'collapsed', 'reply'],
    },
    {
        tab: 'display',
        tabLabel: tabLabels.display,
        section: 'clock',
        title: defineMessage({id: 'user.settings.display.clockDisplay', defaultMessage: 'Clock Display'}),
        keywords: ['time', 'clock', '24-hour', '12-hour', 'am', 'pm'],
    },
    {
        tab: 'display',
        tabLabel: tabLabels.display,
        section: 'name_format',
        title: defineMessage({id: 'user.settings.display.teammateNameDisplayTitle', defaultMessage: 'Teammate Name Display'}),
        keywords: ['name', 'username', 'nickname', 'teammate'],
    },
    {
        tab: 'display',
        tabLabel: tabLabels.display,
        section: 'availabilityStatus',
        title: defineMessage({id: 'user.settings.display.availabilityStatusOnPostsTitle', defaultMessage: 'Show online availability on profile images'}),
        keywords: ['status', 'online', 'availability', 'presence'],
    },
    {
        tab: 'display',
        tabLabel: tabLabels.display,
        section: 'lastactive',
        title: defineMessage({id: 'user.settings.display.lastActiveDisplay', defaultMessage: 'Share last active time'}),
        keywords: ['active', 'last seen'],
    },
    {
        tab: 'display',
        tabLabel: tabLabels.display,
        section: 'timezone',
        title: defineMessage({id: 'user.settings.display.timezone', defaultMessage: 'Timezone'}),
        keywords: ['timezone', 'time zone', 'utc'],
    },
    {
        tab: 'display',
        tabLabel: tabLabels.display,
        section: 'linkpreview',
        title: defineMessage({id: 'user.settings.display.linkPreviewDisplay', defaultMessage: 'Website Link Previews'}),
        keywords: ['link', 'preview', 'url'],
    },
    {
        tab: 'display',
        tabLabel: tabLabels.display,
        section: 'collapse',
        title: defineMessage({id: 'user.settings.display.collapseDisplay', defaultMessage: 'Default Appearance of Image Previews'}),
        keywords: ['image', 'preview', 'collapse', 'expand'],
    },
    {
        tab: 'display',
        tabLabel: tabLabels.display,
        section: 'message_display',
        title: defineMessage({id: 'user.settings.display.messageDisplayTitle', defaultMessage: 'Message Display'}),
        keywords: ['compact', 'standard', 'density', 'message'],
    },
    {
        tab: 'display',
        tabLabel: tabLabels.display,
        section: 'click_to_reply',
        title: defineMessage({id: 'user.settings.display.clickToReply', defaultMessage: 'Click to open threads'}),
        keywords: ['click', 'reply', 'thread'],
    },
    {
        tab: 'display',
        tabLabel: tabLabels.display,
        section: 'channel_display_mode',
        title: defineMessage({id: 'user.settings.display.channelDisplayTitle', defaultMessage: 'Channel Display'}),
        keywords: ['width', 'full', 'centered', 'channel'],
    },
    {
        tab: 'display',
        tabLabel: tabLabels.display,
        section: 'one_click_reactions_enabled',
        title: defineMessage({id: 'user.settings.display.oneClickReactionsOnPostsTitle', defaultMessage: 'Quick reactions on messages'}),
        keywords: ['reaction', 'emoji', 'quick'],
    },
    {
        tab: 'display',
        tabLabel: tabLabels.display,
        section: 'renderEmoticonsAsEmoji',
        title: defineMessage({id: 'user.settings.display.renderEmoticonsAsEmojiTitle', defaultMessage: 'Render emoticons as emojis'}),
        keywords: ['emoticon', 'emoji'],
    },
    {
        tab: 'display',
        tabLabel: tabLabels.display,
        section: 'languages',
        title: defineMessage({id: 'user.settings.display.language', defaultMessage: 'Language'}),
        keywords: ['language', 'locale', 'translation'],
    },

    // Sidebar
    {
        tab: 'sidebar',
        tabLabel: tabLabels.sidebar,
        section: 'showUnreadsCategory',
        title: defineMessage({id: 'user.settings.sidebar.showUnreadsCategoryTitle', defaultMessage: 'Group unread channels separately'}),
        keywords: ['unread', 'group', 'category'],
    },
    {
        tab: 'sidebar',
        tabLabel: tabLabels.sidebar,
        section: 'limitVisibleGMsDMs',
        title: defineMessage({id: 'user.settings.sidebar.limitVisibleGMsDMsTitle', defaultMessage: 'Number of direct messages to show'}),
        keywords: ['direct message', 'dm', 'gm', 'limit'],
    },

    // Advanced
    {
        tab: 'advanced',
        tabLabel: tabLabels.advanced,
        section: 'advancedCtrlSend',
        title: defineMessage({id: 'user.settings.advance.sendTitle', defaultMessage: 'Send Messages on CTRL+ENTER'}),
        keywords: ['ctrl', 'enter', 'send', 'cmd'],
    },
    {
        tab: 'advanced',
        tabLabel: tabLabels.advanced,
        section: 'formatting',
        title: defineMessage({id: 'user.settings.advance.formattingTitle', defaultMessage: 'Enable Post Formatting'}),
        keywords: ['markdown', 'formatting'],
    },
    {
        tab: 'advanced',
        tabLabel: tabLabels.advanced,
        section: 'joinLeave',
        title: defineMessage({id: 'user.settings.advance.joinLeaveTitle', defaultMessage: 'Enable Join/Leave Messages'}),
        keywords: ['join', 'leave', 'system message'],
    },
    {
        tab: 'advanced',
        tabLabel: tabLabels.advanced,
        section: 'performanceDebugging',
        title: defineMessage({id: 'user.settings.advance.performance.title', defaultMessage: 'Performance Debugging'}),
        keywords: ['performance', 'debug'],
    },
    {
        tab: 'advanced',
        tabLabel: tabLabels.advanced,
        section: 'unread_scroll_position',
        title: defineMessage({id: 'user.settings.advance.unreadScrollPositionTitle', defaultMessage: 'Scroll position when viewing an unread channel'}),
        keywords: ['scroll', 'unread', 'position'],
    },
    {
        tab: 'advanced',
        tabLabel: tabLabels.advanced,
        section: 'syncDrafts',
        title: defineMessage({id: 'user.settings.advance.syncDrafts.Title', defaultMessage: 'Allow message drafts to sync with the server'}),
        keywords: ['draft', 'sync'],
    },
    {
        tab: 'advanced',
        tabLabel: tabLabels.advanced,
        section: 'deactivateAccount',
        title: defineMessage({id: 'user.settings.advance.deactivateAccountTitle', defaultMessage: 'Deactivate Account'}),
        keywords: ['deactivate', 'delete account', 'close account'],
    },
];

// Builds searchable entries for plugin-provided settings tabs/sections.
export function getPluginSearchableSettings(pluginSettings?: {[pluginId: string]: PluginConfiguration}): SearchableUserSetting[] {
    if (!pluginSettings) {
        return [];
    }

    const entries: SearchableUserSetting[] = [];
    for (const plugin of Object.values(pluginSettings)) {
        for (const section of plugin.sections) {
            const keywords: string[] = [];
            if ('settings' in section && section.settings) {
                for (const setting of section.settings) {
                    if (setting.title) {
                        keywords.push(setting.title);
                    }
                    if (setting.helpText) {
                        keywords.push(setting.helpText);
                    }
                }
            }

            entries.push({
                tab: plugin.id,
                tabLabel: plugin.uiName,
                section: section.title,
                title: section.title,
                keywords,
            });
        }
    }
    return entries;
}

export type UserSettingsSearchIndex = {
    add(id: string, element: string): void;
    search(query: string): string[];
};

// Resolves a title/label that may be a plain string (plugin) or a MessageDescriptor (built-in).
export function resolveSearchableText(value: MessageDescriptor | string, intl: IntlShape): string {
    return typeof value === 'string' ? value : intl.formatMessage(value);
}

function buildSearchText(setting: SearchableUserSetting, intl: IntlShape): string {
    const parts: string[] = [resolveSearchableText(setting.title, intl)];
    if (setting.keywords) {
        parts.push(...setting.keywords);
    }
    return parts.join(' ');
}

// Creates a FlexSearch index for the provided settings. Entry ids are the
// settings' positions in the array, so callers can map results back.
export function createUserSettingsSearchIndex(settings: SearchableUserSetting[], intl: IntlShape): UserSettingsSearchIndex {
    const index: UserSettingsSearchIndex = new FlexSearch();
    settings.forEach((setting, i) => {
        index.add(String(i), buildSearchText(setting, intl));
    });
    return index;
}

// Returns the settings matching the query, in relevance order.
export function searchUserSettings(query: string, settings: SearchableUserSetting[], index: UserSettingsSearchIndex): SearchableUserSetting[] {
    if (!query.trim()) {
        return [];
    }

    const ids = index.search(query);
    return ids.
        map((id) => settings[Number(id)]).
        filter((setting): setting is SearchableUserSetting => Boolean(setting));
}
