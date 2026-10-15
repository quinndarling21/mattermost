// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createIntl} from 'react-intl';

import type {PluginConfiguration} from 'types/plugins/user_settings';

import {matchSettings} from './settings_search_catalog';

const intl = createIntl({locale: 'en', messages: {}});

const PRODUCT_TABS = ['notifications', 'display', 'sidebar', 'advanced'];
const PROFILE_TABS = ['profile', 'security'];

const pluginSettings: {[pluginId: string]: PluginConfiguration} = {
    plugin_a: {
        id: 'plugin_a',
        uiName: 'Sample Plugin',
        sections: [
            {
                title: 'Alerts',
                settings: [
                    {name: 'alert_sound', title: 'Alert sound', type: 'radio', default: 'on', options: []},
                ],
            },
        ],
    },
};

describe('matchSettings', () => {
    it('returns all tabs for an empty query', () => {
        expect(matchSettings('', intl, PRODUCT_TABS).tabs).toEqual(PRODUCT_TABS);
        expect(matchSettings('   ', intl, PRODUCT_TABS).tabs).toEqual(PRODUCT_TABS);
        expect(matchSettings('', intl, PRODUCT_TABS).firstMatch).toBeUndefined();
    });

    it('matches theme to the display tab', () => {
        const result = matchSettings('theme', intl, PRODUCT_TABS);
        expect(result.tabs).toEqual(['display']);
        expect(result.firstMatch).toEqual({tab: 'display', section: 'theme'});
    });

    it('matches dark mode alias to display', () => {
        expect(matchSettings('dark mode', intl, PRODUCT_TABS).tabs).toEqual(['display']);
    });

    it('matches email to notifications on product settings', () => {
        const result = matchSettings('email', intl, PRODUCT_TABS);
        expect(result.tabs).toEqual(['notifications']);
        expect(result.firstMatch?.tab).toBe('notifications');
    });

    it('matches email to profile on profile settings', () => {
        const result = matchSettings('email', intl, PROFILE_TABS);
        expect(result.tabs).toEqual(['profile']);
        expect(result.firstMatch).toEqual({tab: 'profile', section: 'email'});
    });

    it('matches ctrl and cmd aliases to advanced', () => {
        expect(matchSettings('ctrl', intl, PRODUCT_TABS).tabs).toEqual(['advanced']);
        expect(matchSettings('cmd', intl, PRODUCT_TABS).tabs).toEqual(['advanced']);
        expect(matchSettings('cmd enter', intl, PRODUCT_TABS).firstMatch?.section).toBe('advancedCtrlSend');
    });

    it('requires every token to match (AND)', () => {
        expect(matchSettings('desktop notification', intl, PRODUCT_TABS).tabs).toEqual(['notifications']);
        expect(matchSettings('desktop theme', intl, PRODUCT_TABS).tabs).toEqual([]);
    });

    it('returns no tabs for an unknown string', () => {
        const result = matchSettings('zzzz', intl, PRODUCT_TABS);
        expect(result.tabs).toEqual([]);
        expect(result.firstMatch).toBeUndefined();
    });

    it('is case-insensitive', () => {
        expect(matchSettings('THEME', intl, PRODUCT_TABS).tabs).toEqual(['display']);
        expect(matchSettings('Email', intl, PRODUCT_TABS).tabs).toEqual(['notifications']);
    });

    it('matches a plugin uiName', () => {
        const tabIds = [...PRODUCT_TABS, 'plugin_a'];
        const result = matchSettings('sample plugin', intl, tabIds, pluginSettings);
        expect(result.tabs).toEqual(['plugin_a']);
        expect(result.firstMatch?.tab).toBe('plugin_a');
    });

    it('matches a plugin section title', () => {
        const tabIds = [...PRODUCT_TABS, 'plugin_a'];
        const result = matchSettings('alerts', intl, tabIds, pluginSettings);
        expect(result.tabs).toEqual(['plugin_a']);
        expect(result.firstMatch?.section).toBe('Alerts');
    });

    it('matches a plugin setting title', () => {
        const tabIds = [...PRODUCT_TABS, 'plugin_a'];
        const result = matchSettings('alert sound', intl, tabIds, pluginSettings);
        expect(result.tabs).toEqual(['plugin_a']);
    });

    it('ignores catalog tabs that are not in tabIds', () => {
        expect(matchSettings('theme', intl, PROFILE_TABS).tabs).toEqual([]);
        expect(matchSettings('password', intl, PRODUCT_TABS).tabs).toEqual([]);
    });

    it('preserves tab order of matches', () => {
        const result = matchSettings('notification', intl, PRODUCT_TABS);
        expect(result.tabs[0]).toBe('notifications');
    });
});
