// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {IntlShape} from 'react-intl';

import type {UserPropertyField} from '@mattermost/types/properties';

import Constants, {AdvancedSections, UserSettingsNotificationSections} from 'utils/constants';

import type {PluginConfiguration} from 'types/plugins/user_settings';

import type {UserSettingsSearchItem} from './types';

const Preferences = Constants.Preferences;

type TabContext = {
    tab: string;
    tabLabel: string;
    isPlugin?: boolean;
};

function item(
    ctx: TabContext,
    section: string,
    label: string,
    aliases: string[],
    description?: string,
): UserSettingsSearchItem {
    const sectionKey = section || 'root';
    return {
        id: `${ctx.tab}:${sectionKey}:${label}`,
        tab: ctx.tab,
        tabLabel: ctx.tabLabel,
        section,
        label,
        description,
        aliases,
        isPlugin: ctx.isPlugin,
    };
}

function buildNotificationsItems(intl: IntlShape): UserSettingsSearchItem[] {
    const ctx: TabContext = {
        tab: 'notifications',
        tabLabel: intl.formatMessage({id: 'user.settings.modal.notifications', defaultMessage: 'Notifications'}),
    };

    return [
        item(ctx, UserSettingsNotificationSections.DESKTOP_AND_MOBILE,
            intl.formatMessage({id: 'user.settings.notifications.desktopAndMobile.title', defaultMessage: 'Desktop and mobile notifications'}),
            ['desktop', 'mobile', 'push', 'notifications']),
        item(ctx, UserSettingsNotificationSections.DESKTOP_NOTIFICATION_SOUND,
            intl.formatMessage({id: 'user.settings.notifications.desktopNotificationSounds.title', defaultMessage: 'Desktop notification sounds'}),
            ['sounds', 'desktop', 'notification sound']),
        item(ctx, UserSettingsNotificationSections.EMAIL,
            intl.formatMessage({id: 'user.settings.notifications.emailNotifications', defaultMessage: 'Email notifications'}),
            ['email', 'notifications']),
        item(ctx, UserSettingsNotificationSections.KEYWORDS_MENTIONS,
            intl.formatMessage({id: 'user.settings.notifications.keywordsWithNotification.title', defaultMessage: 'Keywords that trigger notifications'}),
            ['mentions', 'keywords', 'notifications']),
        item(ctx, UserSettingsNotificationSections.KEYWORDS_HIGHLIGHT,
            intl.formatMessage({id: 'user.settings.notifications.keywordsWithHighlight.title', defaultMessage: 'Keywords that get highlighted (without notifications)'}),
            ['keywords', 'highlight']),
        item(ctx, UserSettingsNotificationSections.REPLY_NOTIFCATIONS,
            intl.formatMessage({id: 'user.settings.notifications.comments', defaultMessage: 'Reply notifications'}),
            ['replies', 'comments', 'threads']),
        item(ctx, UserSettingsNotificationSections.AUTO_RESPONDER,
            intl.formatMessage({id: 'user.settings.notifications.autoResponder', defaultMessage: 'Automatic direct message replies'}),
            ['automatic replies', 'auto responder', 'out of office']),
    ];
}

function buildDisplayItems(intl: IntlShape): UserSettingsSearchItem[] {
    const ctx: TabContext = {
        tab: 'display',
        tabLabel: intl.formatMessage({id: 'user.settings.modal.display', defaultMessage: 'Display'}),
    };

    return [
        item(ctx, 'theme',
            intl.formatMessage({id: 'user.settings.display.theme.title', defaultMessage: 'Theme'}),
            ['dark mode', 'light mode', 'theme', 'appearance', 'colors']),
        item(ctx, 'clock',
            intl.formatMessage({id: 'user.settings.display.clockDisplay', defaultMessage: 'Clock Display'}),
            ['clock', 'time format', '12-hour', '24-hour']),
        item(ctx, Preferences.NAME_NAME_FORMAT,
            intl.formatMessage({id: 'user.settings.display.teammateNameDisplayTitle', defaultMessage: 'Teammate Name Display'}),
            ['teammate name', 'username', 'nickname', 'full name']),
        item(ctx, 'timezone',
            intl.formatMessage({id: 'user.settings.display.timezone', defaultMessage: 'Timezone'}),
            ['timezone', 'time zone']),
        item(ctx, 'collapse',
            intl.formatMessage({id: 'user.settings.display.collapseDisplay', defaultMessage: 'Default Appearance of Image Previews'}),
            ['image previews', 'collapse', 'expand']),
        item(ctx, 'linkpreview',
            intl.formatMessage({id: 'user.settings.display.linkPreviewDisplay', defaultMessage: 'Website Link Previews'}),
            ['link previews', 'website preview']),
        item(ctx, Preferences.MESSAGE_DISPLAY,
            intl.formatMessage({id: 'user.settings.display.messageDisplayTitle', defaultMessage: 'Message Display'}),
            ['message display', 'compact', 'standard']),
        item(ctx, Preferences.CHANNEL_DISPLAY_MODE,
            intl.formatMessage({id: 'user.settings.display.channelDisplayTitle', defaultMessage: 'Channel Display'}),
            ['channel display', 'full width', 'fixed width']),
        item(ctx, 'languages',
            intl.formatMessage({id: 'user.settings.languages.change', defaultMessage: 'Language'}),
            ['language', 'locale', 'translation']),
        item(ctx, 'availabilityStatus',
            intl.formatMessage({id: 'user.settings.display.availabilityStatusOnPostsTitle', defaultMessage: 'Show online availability on profile images'}),
            ['availability', 'online status', 'status']),
        item(ctx, 'lastactive',
            intl.formatMessage({id: 'user.settings.display.lastActiveDisplay', defaultMessage: 'Share last active time'}),
            ['last active', 'last seen']),
        item(ctx, Preferences.CLICK_TO_REPLY,
            intl.formatMessage({id: 'user.settings.display.clickToReply', defaultMessage: 'Click to open threads'}),
            ['threads', 'click to reply']),
        item(ctx, Preferences.COLLAPSED_REPLY_THREADS,
            intl.formatMessage({id: 'user.settings.display.collapsedReplyThreadsTitle', defaultMessage: 'Threaded Discussions'}),
            ['threads', 'collapsed threads']),
        item(ctx, Preferences.ONE_CLICK_REACTIONS_ENABLED,
            intl.formatMessage({id: 'user.settings.display.oneClickReactionsOnPostsTitle', defaultMessage: 'Quick reactions on messages'}),
            ['emoji', 'reactions']),
        item(ctx, 'renderEmoticonsAsEmoji',
            intl.formatMessage({id: 'user.settings.display.renderEmoticonsAsEmojiTitle', defaultMessage: 'Render emoticons as emojis'}),
            ['emoji', 'emoticons']),
    ];
}

function buildSidebarItems(intl: IntlShape): UserSettingsSearchItem[] {
    const ctx: TabContext = {
        tab: 'sidebar',
        tabLabel: intl.formatMessage({id: 'user.settings.modal.sidebar', defaultMessage: 'Sidebar'}),
    };

    return [
        item(ctx, 'showUnreadsCategory',
            intl.formatMessage({id: 'user.settings.sidebar.showUnreadsCategoryTitle', defaultMessage: 'Group unread channels separately'}),
            ['sidebar', 'unreads', 'channel grouping', 'sorting']),
        item(ctx, 'limitVisibleGMsDMs',
            intl.formatMessage({id: 'user.settings.sidebar.limitVisibleGMsDMsTitle', defaultMessage: 'Number of direct messages to show'}),
            ['sidebar', 'group messages', 'direct messages', 'channel switcher']),
    ];
}

function buildAdvancedItems(intl: IntlShape): UserSettingsSearchItem[] {
    const ctx: TabContext = {
        tab: 'advanced',
        tabLabel: intl.formatMessage({id: 'user.settings.modal.advanced', defaultMessage: 'Advanced'}),
    };

    return [
        item(ctx, AdvancedSections.CONTROL_SEND,
            intl.formatMessage({id: 'user.settings.advance.sendTitle', defaultMessage: 'Send Messages on CTRL+ENTER'}),
            ['send messages', 'formatting', 'enter', 'ctrl']),
        item(ctx, AdvancedSections.FORMATTING,
            intl.formatMessage({id: 'user.settings.advance.formattingTitle', defaultMessage: 'Enable Post Formatting'}),
            ['formatting', 'markdown']),
        item(ctx, AdvancedSections.JOIN_LEAVE,
            intl.formatMessage({id: 'user.settings.advance.joinLeaveTitle', defaultMessage: 'Enable Join/Leave Messages'}),
            ['join/leave messages', 'join leave']),
        item(ctx, AdvancedSections.PERFORMANCE_DEBUGGING,
            intl.formatMessage({id: 'user.settings.advance.performance.title', defaultMessage: 'Performance Debugging'}),
            ['performance debugging', 'preview features']),
        item(ctx, Preferences.UNREAD_SCROLL_POSITION,
            intl.formatMessage({id: 'user.settings.advance.unreadScrollPositionTitle', defaultMessage: 'Scroll position when viewing an unread channel'}),
            ['unread channels', 'scroll position']),
        item(ctx, AdvancedSections.SYNC_DRAFTS,
            intl.formatMessage({id: 'user.settings.advance.syncDrafts.Title', defaultMessage: 'Allow message drafts to sync with the server'}),
            ['drafts', 'sync']),
        item(ctx, 'deactivateAccount',
            intl.formatMessage({id: 'user.settings.advance.deactivateAccountTitle', defaultMessage: 'Deactivate Account'}),
            ['deactivate account', 'delete account']),
    ];
}

function buildProfileItems(
    intl: IntlShape,
    customProfileAttributeFields: UserPropertyField[] = [],
): UserSettingsSearchItem[] {
    const ctx: TabContext = {
        tab: 'profile',
        tabLabel: intl.formatMessage({id: 'user.settings.modal.profile', defaultMessage: 'Profile Settings'}),
    };

    const items = [
        item(ctx, 'name',
            intl.formatMessage({id: 'user.settings.general.fullName', defaultMessage: 'Full Name'}),
            ['name', 'full name', 'first name', 'last name']),
        item(ctx, 'username',
            intl.formatMessage({id: 'user.settings.general.username', defaultMessage: 'Username'}),
            ['username']),
        item(ctx, 'nickname',
            intl.formatMessage({id: 'user.settings.general.nickname', defaultMessage: 'Nickname'}),
            ['nickname']),
        item(ctx, 'position',
            intl.formatMessage({id: 'user.settings.general.position', defaultMessage: 'Position'}),
            ['position', 'job title']),
        item(ctx, 'email',
            intl.formatMessage({id: 'user.settings.general.email', defaultMessage: 'Email'}),
            ['email']),
        item(ctx, 'picture',
            intl.formatMessage({id: 'user.settings.general.profilePicture', defaultMessage: 'Profile Picture'}),
            ['profile picture', 'avatar', 'photo']),
    ];

    customProfileAttributeFields.forEach((attribute) => {
        if (attribute.attrs?.access_mode === 'source_only') {
            return;
        }
        const label = attribute.attrs?.display_name || attribute.name;
        items.push(item(
            ctx,
            `customAttribute_${attribute.id}`,
            label,
            [label, attribute.name, 'custom profile'],
        ));
    });

    return items;
}

function buildSecurityItems(intl: IntlShape): UserSettingsSearchItem[] {
    const ctx: TabContext = {
        tab: 'security',
        tabLabel: intl.formatMessage({id: 'user.settings.modal.security', defaultMessage: 'Security'}),
    };

    return [
        item(ctx, 'password',
            intl.formatMessage({id: 'user.settings.security.password', defaultMessage: 'Password'}),
            ['password']),
        item(ctx, 'mfa',
            intl.formatMessage({id: 'user.settings.mfa.title', defaultMessage: 'Multi-factor Authentication'}),
            ['multi-factor authentication', 'MFA', '2fa', 'two factor']),
        item(ctx, 'signin',
            intl.formatMessage({id: 'user.settings.security.method', defaultMessage: 'Sign-in Method'}),
            ['sign-in method', 'login', 'sso']),
        item(ctx, 'apps',
            intl.formatMessage({id: 'user.settings.security.oauthApps', defaultMessage: 'OAuth 2.0 Applications'}),
            ['OAuth apps', 'oauth']),
        item(ctx, 'tokens',
            intl.formatMessage({id: 'user.settings.tokens.title', defaultMessage: 'Personal Access Tokens'}),
            ['access tokens', 'personal access tokens', 'api tokens']),
        item(ctx, '',
            intl.formatMessage({id: 'user.settings.security.logoutActiveSessions', defaultMessage: 'View and Log Out of Active Sessions'}),
            ['active sessions', 'sessions', 'logout']),
    ];
}

function buildPluginItems(
    pluginSettings: {[pluginId: string]: PluginConfiguration},
): UserSettingsSearchItem[] {
    const items: UserSettingsSearchItem[] = [];

    Object.values(pluginSettings).forEach((plugin) => {
        const ctx: TabContext = {
            tab: plugin.id,
            tabLabel: plugin.uiName,
            isPlugin: true,
        };

        items.push(item(
            ctx,
            '',
            plugin.uiName,
            [plugin.uiName, plugin.id, 'plugin'],
        ));

        if (plugin.action) {
            items.push(item(
                ctx,
                '',
                plugin.action.title,
                [plugin.action.title, plugin.action.buttonText, plugin.uiName],
                plugin.action.text,
            ));
        }

        plugin.sections.forEach((section) => {
            items.push(item(
                ctx,
                section.title,
                section.title,
                [section.title, plugin.uiName],
            ));

            if ('settings' in section) {
                section.settings.forEach((setting) => {
                    const label = setting.title || setting.name;
                    const aliases = [setting.name, plugin.uiName];
                    if (setting.type === 'radio') {
                        setting.options.forEach((option) => {
                            aliases.push(option.text);
                            if (option.helpText) {
                                aliases.push(option.helpText);
                            }
                        });
                    }
                    items.push(item(
                        ctx,
                        section.title,
                        label,
                        aliases,
                        setting.helpText,
                    ));
                });
            }
        });
    });

    return items;
}

export type UserSettingsSearchAvailability = {
    enableThemeSelection?: boolean;
    adminMode?: boolean;
    enableLinkPreviews?: boolean;
    lastActiveTimeEnabled?: boolean;
    enableAutoResponder?: boolean;
    enableUserDeactivation?: boolean;
    userAuthService?: string;
    mfaAvailable?: boolean;
    enableOAuthServiceProvider?: boolean;
    canUseAccessTokens?: boolean;
};

export type BuildUserSettingsSearchItemsOptions = {
    customProfileAttributeFields?: UserPropertyField[];
    availability?: UserSettingsSearchAvailability;
};

const gatedSectionAvailable: {[section: string]: (availability: UserSettingsSearchAvailability) => boolean} = {
    theme: (availability) => Boolean(availability.enableThemeSelection && !availability.adminMode),
    linkpreview: (availability) => Boolean(availability.enableLinkPreviews),
    lastactive: (availability) => Boolean(availability.lastActiveTimeEnabled),
    [UserSettingsNotificationSections.AUTO_RESPONDER]: (availability) => Boolean(availability.enableAutoResponder),
    mfa: (availability) => Boolean(availability.mfaAvailable),
    apps: (availability) => Boolean(availability.enableOAuthServiceProvider),
    tokens: (availability) => Boolean(availability.canUseAccessTokens),
    deactivateAccount: (availability) => Boolean(
        availability.enableUserDeactivation &&
        !availability.adminMode &&
        !availability.userAuthService,
    ),
};

function applyAvailability(
    items: UserSettingsSearchItem[],
    availability?: UserSettingsSearchAvailability,
): UserSettingsSearchItem[] {
    if (!availability) {
        return items;
    }

    return items.filter((entry) => {
        const isAvailable = gatedSectionAvailable[entry.section];
        return isAvailable ? isAvailable(availability) : true;
    });
}

/**
 * Build the searchable index for the settings currently available in the open modal.
 */
export function buildUserSettingsSearchItems(
    intl: IntlShape,
    isContentProductSettings: boolean,
    pluginSettings: {[pluginId: string]: PluginConfiguration} = {},
    options: BuildUserSettingsSearchItemsOptions = {},
): UserSettingsSearchItem[] {
    if (isContentProductSettings) {
        return applyAvailability([
            ...buildNotificationsItems(intl),
            ...buildDisplayItems(intl),
            ...buildSidebarItems(intl),
            ...buildAdvancedItems(intl),
            ...buildPluginItems(pluginSettings),
        ], options.availability);
    }

    return applyAvailability([
        ...buildProfileItems(intl, options.customProfileAttributeFields),
        ...buildSecurityItems(intl),
    ], options.availability);
}

const stubIntl = {
    formatMessage: ({defaultMessage}: {defaultMessage?: string}) => defaultMessage || '',
} as IntlShape;

/** First-party section ids expected for product settings (excludes plugins). */
export function getFirstPartyProductSettingSectionIds(): string[] {
    return buildUserSettingsSearchItems(stubIntl, true, {}).map((entry) => entry.section);
}

/** First-party section ids expected for profile settings. */
export function getFirstPartyProfileSettingSectionIds(): string[] {
    return buildUserSettingsSearchItems(stubIntl, false, {}).map((entry) => entry.section);
}
