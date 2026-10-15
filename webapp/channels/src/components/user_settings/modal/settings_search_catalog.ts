// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {defineMessages} from 'react-intl';
import type {IntlShape, MessageDescriptor} from 'react-intl';

import type {PluginConfiguration} from 'types/plugins/user_settings';

export type SettingsSearchCatalogEntry = {
    tab: string;
    section: string;
    title: MessageDescriptor;
    aliases?: string[];
};

export type SettingsSearchMatch = {
    tabs: string[];
    firstMatch?: {tab: string; section: string};
};

// Keep in sync with section titles in each user_settings/* tab component.
const titles = defineMessages({
    notificationsTab: {id: 'user.settings.modal.notifications', defaultMessage: 'Notifications'},
    displayTab: {id: 'user.settings.modal.display', defaultMessage: 'Display'},
    sidebarTab: {id: 'user.settings.modal.sidebar', defaultMessage: 'Sidebar'},
    advancedTab: {id: 'user.settings.modal.advanced', defaultMessage: 'Advanced'},
    profileTab: {id: 'user.settings.modal.profile', defaultMessage: 'Profile Settings'},
    securityTab: {id: 'user.settings.modal.security', defaultMessage: 'Security'},
    desktopAndMobile: {id: 'user.settings.notifications.desktopAndMobile.title', defaultMessage: 'Desktop and mobile notifications'},
    desktopNotificationSounds: {id: 'user.settings.notifications.desktopNotificationSounds.title', defaultMessage: 'Desktop notification sounds'},
    emailNotifications: {id: 'user.settings.notifications.emailNotifications', defaultMessage: 'Email notifications'},
    keywordsWithNotification: {id: 'user.settings.notifications.keywordsWithNotification.title', defaultMessage: 'Keywords that trigger notifications'},
    keywordsWithHighlight: {id: 'user.settings.notifications.keywordsWithHighlight.title', defaultMessage: 'Keywords that get highlighted (without notifications)'},
    replyNotifications: {id: 'user.settings.notifications.comments', defaultMessage: 'Reply notifications'},
    autoResponder: {id: 'user.settings.notifications.autoResponder', defaultMessage: 'Automatic direct message replies'},
    theme: {id: 'user.settings.display.theme.title', defaultMessage: 'Theme'},
    clock: {id: 'user.settings.display.clockDisplay', defaultMessage: 'Clock Display'},
    timezone: {id: 'user.settings.display.timezone', defaultMessage: 'Timezone'},
    language: {id: 'user.settings.display.language', defaultMessage: 'Language'},
    collapse: {id: 'user.settings.display.collapseDisplay', defaultMessage: 'Default Appearance of Image Previews'},
    linkPreview: {id: 'user.settings.display.linkPreviewDisplay', defaultMessage: 'Website Link Previews'},
    lastActive: {id: 'user.settings.display.lastActiveDisplay', defaultMessage: 'Share last active time'},
    availabilityStatus: {id: 'user.settings.display.availabilityStatusOnPostsTitle', defaultMessage: 'Show online availability on profile images'},
    messageDisplay: {id: 'user.settings.display.messageDisplayTitle', defaultMessage: 'Message Display'},
    channelDisplay: {id: 'user.settings.display.channelDisplayTitle', defaultMessage: 'Channel Display'},
    collapsedReplyThreads: {id: 'user.settings.display.collapsedReplyThreadsTitle', defaultMessage: 'Threaded Discussions'},
    oneClickReactions: {id: 'user.settings.display.oneClickReactionsOnPostsTitle', defaultMessage: 'Quick reactions on messages'},
    renderEmoticonsAsEmoji: {id: 'user.settings.display.renderEmoticonsAsEmojiTitle', defaultMessage: 'Render emoticons as emojis'},
    teammateNameDisplay: {id: 'user.settings.display.teammateNameDisplayTitle', defaultMessage: 'Teammate Name Display'},
    showUnreadsCategory: {id: 'user.settings.sidebar.showUnreadsCategoryTitle', defaultMessage: 'Group unread channels separately'},
    limitVisibleGMsDMs: {id: 'user.settings.sidebar.limitVisibleGMsDMsTitle', defaultMessage: 'Number of direct messages to show'},
    ctrlSend: {id: 'user.settings.advance.sendTitle', defaultMessage: 'Send Messages on CTRL+ENTER'},
    ctrlSendMac: {id: 'user.settings.advance.sendTitle.mac', defaultMessage: 'Send Messages on ⌘+ENTER'},
    formatting: {id: 'user.settings.advance.formattingTitle', defaultMessage: 'Enable Post Formatting'},
    joinLeave: {id: 'user.settings.advance.joinLeaveTitle', defaultMessage: 'Enable Join/Leave Messages'},
    unreadScrollPosition: {id: 'user.settings.advance.unreadScrollPositionTitle', defaultMessage: 'Scroll position when viewing an unread channel'},
    syncDrafts: {id: 'user.settings.advance.syncDrafts.Title', defaultMessage: 'Allow message drafts to sync with the server'},
    deactivateAccount: {id: 'user.settings.advance.deactivateAccountTitle', defaultMessage: 'Deactivate Account'},
    performance: {id: 'user.settings.advance.performance.title', defaultMessage: 'Performance Debugging'},
    fullName: {id: 'user.settings.general.fullName', defaultMessage: 'Full Name'},
    username: {id: 'user.settings.general.username', defaultMessage: 'Username'},
    nickname: {id: 'user.settings.general.nickname', defaultMessage: 'Nickname'},
    position: {id: 'user.settings.general.position', defaultMessage: 'Position'},
    email: {id: 'user.settings.general.email', defaultMessage: 'Email'},
    profilePicture: {id: 'user.settings.general.profilePicture', defaultMessage: 'Profile Picture'},
    password: {id: 'user.settings.security.password', defaultMessage: 'Password'},
    signinMethod: {id: 'user.settings.security.method', defaultMessage: 'Sign-in Method'},
    mfa: {id: 'user.settings.mfa.title', defaultMessage: 'Multi-factor Authentication'},
    oauthApps: {id: 'user.settings.security.oauthApps', defaultMessage: 'OAuth 2.0 Applications'},
    tokens: {id: 'user.settings.tokens.title', defaultMessage: 'Personal Access Tokens'},
});

export const BUILTIN_SETTINGS_CATALOG: SettingsSearchCatalogEntry[] = [
    {tab: 'notifications', section: '', title: titles.notificationsTab},
    {tab: 'notifications', section: 'desktopAndMobile', title: titles.desktopAndMobile, aliases: ['push', 'mobile']},
    {tab: 'notifications', section: 'desktopNotificationSound', title: titles.desktopNotificationSounds, aliases: ['sound']},
    {tab: 'notifications', section: 'email', title: titles.emailNotifications, aliases: ['email']},
    {tab: 'notifications', section: 'keysWithNotification', title: titles.keywordsWithNotification, aliases: ['mentions', 'keywords']},
    {tab: 'notifications', section: 'keysWithHighlight', title: titles.keywordsWithHighlight, aliases: ['highlight']},
    {tab: 'notifications', section: 'replyNotifications', title: titles.replyNotifications, aliases: ['comments', 'threads']},
    {tab: 'notifications', section: 'autoResponder', title: titles.autoResponder, aliases: ['ooo', 'out of office']},
    {tab: 'display', section: '', title: titles.displayTab},
    {tab: 'display', section: 'theme', title: titles.theme, aliases: ['dark mode', 'light mode', 'appearance']},
    {tab: 'display', section: 'clock', title: titles.clock, aliases: ['12-hour', '24-hour']},
    {tab: 'display', section: 'timezone', title: titles.timezone},
    {tab: 'display', section: 'languages', title: titles.language, aliases: ['locale']},
    {tab: 'display', section: 'collapse', title: titles.collapse, aliases: ['images', 'expand']},
    {tab: 'display', section: 'linkpreview', title: titles.linkPreview},
    {tab: 'display', section: 'lastactive', title: titles.lastActive},
    {tab: 'display', section: 'availabilityStatus', title: titles.availabilityStatus, aliases: ['online']},
    {tab: 'display', section: 'message_display', title: titles.messageDisplay},
    {tab: 'display', section: 'channel_display_mode', title: titles.channelDisplay},
    {tab: 'display', section: 'collapsed_reply_threads', title: titles.collapsedReplyThreads, aliases: ['threads']},
    {tab: 'display', section: 'one_click_reactions_enabled', title: titles.oneClickReactions, aliases: ['emoji']},
    {tab: 'display', section: 'renderEmoticonsAsEmoji', title: titles.renderEmoticonsAsEmoji, aliases: ['emoticons']},
    {tab: 'display', section: 'name_format', title: titles.teammateNameDisplay},
    {tab: 'sidebar', section: '', title: titles.sidebarTab},
    {tab: 'sidebar', section: 'showUnreadsCategory', title: titles.showUnreadsCategory, aliases: ['unreads']},
    {tab: 'sidebar', section: 'limitVisibleGMsDMs', title: titles.limitVisibleGMsDMs, aliases: ['dm', 'gm']},
    {tab: 'advanced', section: '', title: titles.advancedTab},
    {tab: 'advanced', section: 'advancedCtrlSend', title: titles.ctrlSend, aliases: ['ctrl enter', 'ctrl', 'enter']},
    {tab: 'advanced', section: 'advancedCtrlSend', title: titles.ctrlSendMac, aliases: ['cmd enter', 'cmd', 'command']},
    {tab: 'advanced', section: 'formatting', title: titles.formatting, aliases: ['markdown']},
    {tab: 'advanced', section: 'joinLeave', title: titles.joinLeave},
    {tab: 'advanced', section: 'unreadScrollPosition', title: titles.unreadScrollPosition},
    {tab: 'advanced', section: 'syncDrafts', title: titles.syncDrafts, aliases: ['drafts']},
    {tab: 'advanced', section: 'deactivateAccount', title: titles.deactivateAccount},
    {tab: 'advanced', section: 'performanceDebugging', title: titles.performance},
    {tab: 'profile', section: '', title: titles.profileTab},
    {tab: 'profile', section: 'name', title: titles.fullName, aliases: ['name']},
    {tab: 'profile', section: 'username', title: titles.username},
    {tab: 'profile', section: 'nickname', title: titles.nickname},
    {tab: 'profile', section: 'position', title: titles.position},
    {tab: 'profile', section: 'email', title: titles.email, aliases: ['email']},
    {tab: 'profile', section: 'picture', title: titles.profilePicture, aliases: ['avatar', 'photo']},
    {tab: 'security', section: '', title: titles.securityTab},
    {tab: 'security', section: 'password', title: titles.password},
    {tab: 'security', section: 'signin', title: titles.signinMethod, aliases: ['login']},
    {tab: 'security', section: 'mfa', title: titles.mfa, aliases: ['2fa', 'two factor']},
    {tab: 'security', section: 'apps', title: titles.oauthApps, aliases: ['oauth']},
    {tab: 'security', section: 'tokens', title: titles.tokens, aliases: ['pat', 'api']},
];

function tokensMatch(queryTokens: string[], haystacks: Array<string | undefined>): boolean {
    const haystack = haystacks.filter(Boolean).join(' ').toLowerCase();
    return queryTokens.every((token) => haystack.includes(token));
}

/**
 * Case-insensitive AND match: every whitespace-separated token must appear in
 * a localized title, alias, tab name, or plugin label.
 */
export function matchSettings(
    query: string,
    intl: Pick<IntlShape, 'formatMessage'>,
    tabIds: string[],
    pluginSettings: {[pluginId: string]: PluginConfiguration} = {},
): SettingsSearchMatch {
    const trimmed = query.trim();
    if (!trimmed) {
        return {tabs: [...tabIds]};
    }

    const queryTokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
    const matchingTabs = new Set<string>();
    let firstMatch: {tab: string; section: string} | undefined;

    const consider = (tab: string, section: string, haystacks: Array<string | undefined>) => {
        if (!tabIds.includes(tab) || !tokensMatch(queryTokens, haystacks)) {
            return;
        }
        matchingTabs.add(tab);
        if (!firstMatch) {
            firstMatch = {tab, section};
        }
    };

    for (const entry of BUILTIN_SETTINGS_CATALOG) {
        consider(entry.tab, entry.section, [
            intl.formatMessage(entry.title),
            entry.tab,
            ...(entry.aliases || []),
        ]);
    }

    for (const plugin of Object.values(pluginSettings)) {
        consider(plugin.id, '', [plugin.uiName, plugin.id]);
        for (const pluginSection of plugin.sections) {
            consider(plugin.id, pluginSection.title, [plugin.uiName, plugin.id, pluginSection.title]);
            if ('settings' in pluginSection) {
                for (const setting of pluginSection.settings) {
                    consider(plugin.id, pluginSection.title, [
                        plugin.uiName,
                        plugin.id,
                        pluginSection.title,
                        setting.title,
                        setting.name,
                    ]);
                }
            }
        }
        if (plugin.action) {
            consider(plugin.id, '', [plugin.uiName, plugin.action.title, plugin.action.text]);
        }
    }

    return {
        tabs: tabIds.filter((id) => matchingTabs.has(id)),
        firstMatch,
    };
}
