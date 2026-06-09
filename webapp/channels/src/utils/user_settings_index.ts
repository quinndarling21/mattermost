// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import FlexSearch from 'flexsearch/dist/flexsearch.es5';
import {defineMessage} from 'react-intl';
import type {IntlShape, MessageDescriptor} from 'react-intl';

import {AdvancedSections, UserSettingsNotificationSections} from 'utils/constants';

import type {PluginConfiguration} from 'types/plugins/user_settings';

import type {Index} from './admin_console_index';

export type {Index};

export type UserSettingsSearchEntry = {
    id: string;
    tab: string;
    section: string;
    texts: Array<string | MessageDescriptor>;
    keywords?: string[];
};

type SearchOptions = {
    isContentProductSettings: boolean;
    pluginSettings: {[pluginId: string]: PluginConfiguration};
};

function entry(
    tab: string,
    section: string,
    texts: Array<string | MessageDescriptor>,
    keywords?: string[],
): UserSettingsSearchEntry {
    return {
        id: `${tab}.${section}`,
        tab,
        section,
        texts,
        keywords,
    };
}

export function getUserSettingsSearchEntries(intl: IntlShape, options: SearchOptions): UserSettingsSearchEntry[] {
    const entries: UserSettingsSearchEntry[] = [];

    if (options.isContentProductSettings) {
        entries.push(
            entry('notifications', UserSettingsNotificationSections.DESKTOP_AND_MOBILE, [
                defineMessage({id: 'user.settings.notifications.desktopAndMobile', defaultMessage: 'Desktop and mobile notifications'}),
            ], ['notification', 'desktop', 'mobile', 'push']),
            entry('notifications', UserSettingsNotificationSections.DESKTOP_NOTIFICATION_SOUND, [
                defineMessage({id: 'user.settings.notifications.desktopNotificationSoundTitle', defaultMessage: 'Desktop notification sounds'}),
            ], ['sound', 'notification', 'ring']),
            entry('notifications', UserSettingsNotificationSections.EMAIL, [
                defineMessage({id: 'user.settings.notifications.emailNotifications', defaultMessage: 'Email notifications'}),
            ], ['email', 'notification']),
            entry('notifications', UserSettingsNotificationSections.KEYWORDS_MENTIONS, [
                defineMessage({id: 'user.settings.notifications.keywordsWithNotification.title', defaultMessage: 'Keywords that trigger notifications'}),
            ], ['keywords', 'mentions', 'notification']),
            entry('notifications', UserSettingsNotificationSections.KEYWORDS_HIGHLIGHT, [
                defineMessage({id: 'user.settings.notifications.keywordsWithHighlight.title', defaultMessage: 'Keywords that get highlighted'}),
            ], ['keywords', 'highlight']),
            entry('notifications', UserSettingsNotificationSections.REPLY_NOTIFCATIONS, [
                defineMessage({id: 'user.settings.notifications.comments', defaultMessage: 'Notify me about replies to threads I\'m following'}),
            ], ['reply', 'thread', 'notification']),
            entry('notifications', UserSettingsNotificationSections.AUTO_RESPONDER, [
                defineMessage({id: 'user.settings.notifications.autoResponder', defaultMessage: 'Automatic direct message replies'}),
            ], ['auto responder', 'out of office', 'vacation']),

            entry('display', 'theme', [
                defineMessage({id: 'user.settings.display.themeTitle', defaultMessage: 'Theme'}),
            ], ['theme', 'color', 'appearance']),
            entry('display', 'languages', [
                defineMessage({id: 'user.settings.languages.title', defaultMessage: 'Language'}),
            ], ['language', 'locale', 'translation']),
            entry('display', 'timezone', [
                defineMessage({id: 'user.settings.display.timezone', defaultMessage: 'Timezone'}),
            ], ['timezone', 'time zone']),
            entry('display', 'clock', [
                defineMessage({id: 'user.settings.display.clockDisplay', defaultMessage: 'Clock Display'}),
            ], ['clock', '12-hour', '24-hour', 'military']),
            entry('display', 'collapse', [
                defineMessage({id: 'user.settings.display.collapseDisplay', defaultMessage: 'Default Appearance of Image Previews'}),
            ], ['image', 'preview', 'collapse', 'expand']),
            entry('display', 'linkpreview', [
                defineMessage({id: 'user.settings.display.linkPreviewDisplay', defaultMessage: 'Website Link Previews'}),
            ], ['link', 'preview', 'website']),
            entry('display', 'lastactive', [
                defineMessage({id: 'user.settings.display.lastActiveDisplay', defaultMessage: 'Share last active time'}),
            ], ['last active', 'presence', 'status']),
            entry('display', 'availabilityStatus', [
                defineMessage({id: 'user.settings.display.availabilityStatusOnPostsTitle', defaultMessage: 'Show availability status on profile pictures in messages'}),
            ], ['availability', 'status', 'profile']),
            entry('display', 'renderEmoticonsAsEmoji', [
                defineMessage({id: 'user.settings.display.renderEmoticonsAsEmojiTitle', defaultMessage: 'Render emoticons as emojis'}),
            ], ['emoticon', 'emoji']),
            entry('display', 'name_format', [
                defineMessage({id: 'user.settings.display.teammateNameDisplayTitle', defaultMessage: 'Teammate Name Display'}),
            ], ['name', 'username', 'nickname']),
            entry('display', 'message_display', [
                defineMessage({id: 'user.settings.display.messageDisplayTitle', defaultMessage: 'Message Display'}),
            ], ['message', 'compact', 'standard']),
            entry('display', 'channel_display_mode', [
                defineMessage({id: 'user.settings.display.channelDisplayTitle', defaultMessage: 'Channel Display'}),
            ], ['channel', 'display']),
            entry('display', 'collapsed_reply_threads', [
                defineMessage({id: 'user.settings.display.collapsedReplyThreads', defaultMessage: 'Collapsed reply threads'}),
            ], ['threads', 'reply', 'collapsed']),
            entry('display', 'click_to_reply', [
                defineMessage({id: 'user.settings.display.clickToReplyTitle', defaultMessage: 'Click to reply'}),
            ], ['reply', 'click']),
            entry('display', 'one_click_reactions_enabled', [
                defineMessage({id: 'user.settings.display.oneClickReactionsOnPostsTitle', defaultMessage: 'Quick reactions on messages'}),
            ], ['reactions', 'emoji']),

            entry('sidebar', 'showUnreadsCategory', [
                defineMessage({id: 'user.settings.sidebar.showUnreadsCategoryTitle', defaultMessage: 'Group unread channels separately'}),
            ], ['unread', 'sidebar', 'channels']),
            entry('sidebar', 'limitVisibleGMsDMs', [
                defineMessage({id: 'user.settings.sidebar.limitVisibleGMsDMsTitle', defaultMessage: 'Number of direct messages to show'}),
            ], ['direct messages', 'dms', 'sidebar']),

            entry('advanced', AdvancedSections.CONTROL_SEND, [
                defineMessage({id: 'user.settings.advance.sendDesc', defaultMessage: 'Send Messages On'}),
            ], ['send', 'enter', 'keyboard']),
            entry('advanced', AdvancedSections.FORMATTING, [
                defineMessage({id: 'user.settings.advance.formattingTitle', defaultMessage: 'Formatting'}),
            ], ['formatting', 'markdown']),
            entry('advanced', 'unread_scroll_position', [
                defineMessage({id: 'user.settings.advance.unreadScrollPositionTitle', defaultMessage: 'Scroll on unread channel switch'}),
            ], ['scroll', 'unread']),
            entry('advanced', AdvancedSections.SYNC_DRAFTS, [
                defineMessage({id: 'user.settings.advance.syncDraftsTitle', defaultMessage: 'Synchronize drafts'}),
            ], ['drafts', 'sync']),
            entry('advanced', AdvancedSections.JOIN_LEAVE, [
                defineMessage({id: 'user.settings.advance.joinLeaveTitle', defaultMessage: 'Join/leave messages'}),
            ], ['join', 'leave', 'system messages']),
            entry('advanced', AdvancedSections.PERFORMANCE_DEBUGGING, [
                defineMessage({id: 'user.settings.advance.performanceDebuggingTitle', defaultMessage: 'Enable Client Performance Debugging'}),
            ], ['performance', 'debugging']),
            entry('advanced', 'deactivateAccount', [
                defineMessage({id: 'user.settings.advance.deactivateAccountTitle', defaultMessage: 'Deactivate Account'}),
            ], ['deactivate', 'delete', 'account']),
        );
    } else {
        entries.push(
            entry('profile', 'name', [
                defineMessage({id: 'user.settings.general.fullName', defaultMessage: 'Full Name'}),
            ], ['name', 'profile']),
            entry('profile', 'email', [
                defineMessage({id: 'user.settings.general.email', defaultMessage: 'Email'}),
            ], ['email', 'address']),
            entry('profile', 'nickname', [
                defineMessage({id: 'user.settings.general.nickname', defaultMessage: 'Nickname'}),
            ], ['nickname']),
            entry('profile', 'username', [
                defineMessage({id: 'user.settings.general.username', defaultMessage: 'Username'}),
            ], ['username', 'handle']),
            entry('profile', 'position', [
                defineMessage({id: 'user.settings.general.position', defaultMessage: 'Position'}),
            ], ['position', 'title', 'job']),
            entry('profile', 'picture', [
                defineMessage({id: 'user.settings.general.profilePicture', defaultMessage: 'Profile Picture'}),
            ], ['avatar', 'picture', 'photo']),

            entry('security', 'password', [
                defineMessage({id: 'user.settings.security.passwordTitle', defaultMessage: 'Password'}),
            ], ['password', 'change password']),
            entry('security', 'signin', [
                defineMessage({id: 'user.settings.security.methodTitle', defaultMessage: 'Sign-in Method'}),
            ], ['sign in', 'login', 'sso', 'ldap']),
            entry('security', 'mfa', [
                defineMessage({id: 'user.settings.security.mfaTitle', defaultMessage: 'Multi-Factor Authentication'}),
            ], ['mfa', 'two factor', '2fa', 'authentication']),
            entry('security', 'tokens', [
                defineMessage({id: 'user.settings.security.tokensTitle', defaultMessage: 'Personal Access Tokens'}),
            ], ['token', 'api', 'access']),
            entry('security', 'apps', [
                defineMessage({id: 'user.settings.security.appsTitle', defaultMessage: 'Authorized OAuth Applications'}),
            ], ['oauth', 'apps', 'authorized']),
        );
    }

    for (const plugin of Object.values(options.pluginSettings)) {
        entries.push(entry(plugin.id, plugin.id, [plugin.uiName], ['plugin']));
        for (const section of plugin.sections) {
            entries.push(entry(plugin.id, section.title, [plugin.uiName, section.title], ['plugin']));
        }
    }

    return entries;
}

function entriesToIndexText(entries: UserSettingsSearchEntry[], intl: IntlShape): Record<string, string> {
    const result: Record<string, string> = {};

    for (const searchEntry of entries) {
        let text = '';
        for (const value of searchEntry.texts) {
            if (typeof value === 'string') {
                text += ' ' + value;
            } else {
                text += ' ' + intl.formatMessage(value);
            }
        }
        if (searchEntry.keywords) {
            text += ' ' + searchEntry.keywords.join(' ');
        }
        result[searchEntry.id] = text;
    }

    return result;
}

export function generateUserSettingsIndex(intl: IntlShape, options: SearchOptions): Index {
    const idx: Index = new FlexSearch();
    const texts = entriesToIndexText(getUserSettingsSearchEntries(intl, options), intl);

    for (const [id, text] of Object.entries(texts)) {
        idx.add(id, text);
    }

    return idx;
}
