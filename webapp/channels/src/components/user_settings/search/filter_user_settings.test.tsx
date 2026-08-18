// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {IntlShape} from 'react-intl';

import type {UserPropertyField} from '@mattermost/types/properties';

import {
    buildUserSettingsSearchItems,
    filterUserSettings,
    getFirstPartyProductSettingSectionIds,
    getFirstPartyProfileSettingSectionIds,
} from 'components/user_settings/search';

import type {PluginConfiguration} from 'types/plugins/user_settings';

const intl = {
    formatMessage: ({defaultMessage}: {defaultMessage?: string}) => defaultMessage || '',
} as IntlShape;

const expectedProductSections = [
    'desktopAndMobile',
    'desktopNotificationSound',
    'email',
    'keywordsAndMentions',
    'keywordsAndHighlight',
    'replyNotifications',
    'autoResponder',
    'theme',
    'clock',
    'name_format',
    'timezone',
    'collapse',
    'linkpreview',
    'message_display',
    'channel_display_mode',
    'languages',
    'availabilityStatus',
    'lastactive',
    'click_to_reply',
    'collapsed_reply_threads',
    'one_click_reactions_enabled',
    'renderEmoticonsAsEmoji',
    'showUnreadsCategory',
    'limitVisibleGMsDMs',
    'advancedCtrlSend',
    'formatting',
    'joinLeave',
    'performanceDebugging',
    'unread_scroll_position',
    'syncDrafts',
    'deactivateAccount',
];

const expectedProfileSections = [
    'name',
    'username',
    'nickname',
    'position',
    'email',
    'picture',
    'password',
    'mfa',
    'signin',
    'apps',
    'tokens',
    '',
];

describe('filterUserSettings', () => {
    const items = buildUserSettingsSearchItems(intl, true, {});

    it('matches case-insensitively', () => {
        const matches = filterUserSettings(items, 'THEME');
        expect(matches.some((match) => match.section === 'theme')).toBe(true);
    });

    it('is whitespace tolerant', () => {
        const matches = filterUserSettings(items, '  dark   mode  ');
        expect(matches[0]?.section).toBe('theme');
        expect(matches[0]?.tab).toBe('display');
    });

    it.each([
        ['dark mode', 'theme', 'display'],
        ['language', 'languages', 'display'],
        ['time format', 'clock', 'display'],
        ['automatic replies', 'autoResponder', 'notifications'],
        ['channel switcher', 'limitVisibleGMsDMs', 'sidebar'],
        ['join/leave messages', 'joinLeave', 'advanced'],
    ])('matches required product alias %s', (query, section, tab) => {
        const matches = filterUserSettings(items, query);
        expect(matches.some((match) => match.section === section && match.tab === tab)).toBe(true);
    });

    it.each([
        ['MFA', 'mfa'],
        ['access tokens', 'tokens'],
        ['active sessions', ''],
    ])('matches required profile alias %s', (query, section) => {
        const profileItems = buildUserSettingsSearchItems(intl, false, {});
        const matches = filterUserSettings(profileItems, query);
        expect(matches.some((match) => match.section === section && match.tab === 'security')).toBe(true);
    });

    it('matches prefix tokens like appear -> Appearance/theme aliases', () => {
        const matches = filterUserSettings(items, 'appear');
        expect(matches.some((match) => match.section === 'theme')).toBe(true);
    });

    it('prefers exact label matches over looser matches', () => {
        const matches = filterUserSettings(items, 'Theme');
        expect(matches[0]?.section).toBe('theme');
    });

    it('returns empty list for empty query', () => {
        expect(filterUserSettings(items, '   ')).toEqual([]);
    });

    it('matches plugin metadata', () => {
        const pluginSettings: {[pluginId: string]: PluginConfiguration} = {
            demo: {
                id: 'demo',
                uiName: 'Demo Plugin',
                action: {
                    title: 'Open Demo',
                    text: 'Launch the demo action',
                    buttonText: 'Open',
                    onClick: () => undefined,
                },
                sections: [{
                    title: 'Demo Section',
                    settings: [{
                        type: 'radio',
                        name: 'demo_setting',
                        title: 'Demo Setting Title',
                        helpText: 'Helpful demo text',
                        default: 'a',
                        options: [{
                            value: 'a',
                            text: 'Option A',
                            helpText: 'Option help',
                        }],
                    }],
                }],
            },
        };

        const withPlugins = buildUserSettingsSearchItems(intl, true, pluginSettings);
        expect(filterUserSettings(withPlugins, 'Demo Setting Title').some((match) => match.tab === 'demo')).toBe(true);
        expect(filterUserSettings(withPlugins, 'Option A').some((match) => match.tab === 'demo')).toBe(true);
        expect(filterUserSettings(withPlugins, 'Helpful demo text').some((match) => match.tab === 'demo')).toBe(true);
        expect(filterUserSettings(withPlugins, 'Open Demo').some((match) => match.tab === 'demo')).toBe(true);
    });

    it('indexes custom plugin sections by title only', () => {
        const pluginSettings: {[pluginId: string]: PluginConfiguration} = {
            custom: {
                id: 'custom',
                uiName: 'Custom Plugin',
                sections: [{
                    title: 'Custom React Section',
                    component: () => null,
                }],
            },
        };

        const withPlugins = buildUserSettingsSearchItems(intl, true, pluginSettings);
        expect(filterUserSettings(withPlugins, 'Custom React Section')[0]?.section).toBe('Custom React Section');
    });
});

describe('buildUserSettingsSearchItems coverage', () => {
    it('includes every first-party product setting section', () => {
        const sections = getFirstPartyProductSettingSectionIds();
        expect(sections).toEqual(expect.arrayContaining(expectedProductSections));
        expect(new Set(sections).size).toBe(expectedProductSections.length);
    });

    it('includes every first-party profile setting section', () => {
        const sections = getFirstPartyProfileSettingSectionIds();
        expect(sections).toEqual(expect.arrayContaining(expectedProfileSections));
        expect(new Set(sections).size).toBe(expectedProfileSections.length);
    });

    it('scopes product vs profile modal state', () => {
        const product = buildUserSettingsSearchItems(intl, true, {});
        const profile = buildUserSettingsSearchItems(intl, false, {});

        expect(product.some((item) => item.tab === 'display')).toBe(true);
        expect(product.some((item) => item.tab === 'profile')).toBe(false);
        expect(profile.some((item) => item.tab === 'profile')).toBe(true);
        expect(profile.some((item) => item.tab === 'display')).toBe(false);
    });

    it('includes custom profile attribute labels when Profile is open', () => {
        const customProfileAttributeFields = [{
            id: 'department',
            name: 'Department',
            attrs: {
                display_name: 'Team Department',
                access_mode: '',
            },
        }] as UserPropertyField[];

        const items = buildUserSettingsSearchItems(intl, false, {}, {customProfileAttributeFields});
        const matches = filterUserSettings(items, 'Team Department');
        expect(matches[0]?.section).toBe('customAttribute_department');
        expect(matches[0]?.tab).toBe('profile');
    });

    it('omits source-only custom profile attributes', () => {
        const customProfileAttributeFields = [{
            id: 'hidden',
            name: 'Hidden Field',
            attrs: {access_mode: 'source_only'},
        }] as UserPropertyField[];

        const items = buildUserSettingsSearchItems(intl, false, {}, {customProfileAttributeFields});
        expect(filterUserSettings(items, 'Hidden Field')).toHaveLength(0);
    });

    it('omits settings that are not available in the current config', () => {
        const unavailable = buildUserSettingsSearchItems(intl, true, {}, {
            availability: {
                enableThemeSelection: false,
                enableLinkPreviews: false,
                lastActiveTimeEnabled: false,
                enableAutoResponder: false,
                enableUserDeactivation: false,
            },
        });
        const available = buildUserSettingsSearchItems(intl, true, {}, {
            availability: {
                enableThemeSelection: true,
                enableLinkPreviews: true,
                lastActiveTimeEnabled: true,
                enableAutoResponder: true,
                enableUserDeactivation: true,
                userAuthService: '',
            },
        });

        expect(unavailable.some((item) => item.section === 'theme')).toBe(false);
        expect(unavailable.some((item) => item.section === 'linkpreview')).toBe(false);
        expect(unavailable.some((item) => item.section === 'lastactive')).toBe(false);
        expect(unavailable.some((item) => item.section === 'autoResponder')).toBe(false);
        expect(unavailable.some((item) => item.section === 'deactivateAccount')).toBe(false);

        expect(available.some((item) => item.section === 'theme')).toBe(true);
        expect(available.some((item) => item.section === 'linkpreview')).toBe(true);
        expect(available.some((item) => item.section === 'lastactive')).toBe(true);
        expect(available.some((item) => item.section === 'autoResponder')).toBe(true);
        expect(available.some((item) => item.section === 'deactivateAccount')).toBe(true);
    });

    it('omits security settings that are not available for the current user', () => {
        const unavailable = buildUserSettingsSearchItems(intl, false, {}, {
            availability: {
                mfaAvailable: false,
                enableOAuthServiceProvider: false,
                canUseAccessTokens: false,
            },
        });
        const available = buildUserSettingsSearchItems(intl, false, {}, {
            availability: {
                mfaAvailable: true,
                enableOAuthServiceProvider: true,
                canUseAccessTokens: true,
            },
        });

        expect(unavailable.some((item) => item.section === 'mfa')).toBe(false);
        expect(unavailable.some((item) => item.section === 'apps')).toBe(false);
        expect(unavailable.some((item) => item.section === 'tokens')).toBe(false);

        expect(available.some((item) => item.section === 'mfa')).toBe(true);
        expect(available.some((item) => item.section === 'apps')).toBe(true);
        expect(available.some((item) => item.section === 'tokens')).toBe(true);
    });

    it('omits Theme in admin mode even when theme selection is enabled', () => {
        const items = buildUserSettingsSearchItems(intl, true, {}, {
            availability: {
                enableThemeSelection: true,
                adminMode: true,
            },
        });

        expect(items.some((item) => item.section === 'theme')).toBe(false);
    });
});
