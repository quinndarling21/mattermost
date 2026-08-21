// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createIntl} from 'react-intl';

import type {PluginConfiguration} from 'types/plugins/user_settings';

import {
    builtInSearchableSettings,
    createUserSettingsSearchIndex,
    getPluginSearchableSettings,
    searchUserSettings,
} from './searchable_user_settings';

const enMessages = require('../../../i18n/en');

const intl = createIntl({locale: 'en', messages: enMessages, defaultLocale: 'en'});

describe('searchable_user_settings', () => {
    describe('builtInSearchableSettings', () => {
        test('every entry uses a title message id that exists in en.json', () => {
            for (const setting of builtInSearchableSettings) {
                expect(typeof setting.title).not.toBe('string');
                const id = (setting.title as {id: string}).id;
                expect(id).toBeDefined();
                expect(enMessages[id]).toBeDefined();
            }
        });

        test('entries have unique tab/section combinations', () => {
            const keys = builtInSearchableSettings.map((s) => `${s.tab}_${s.section}`);
            expect(new Set(keys).size).toBe(keys.length);
        });

        test('only references the four product-settings tabs', () => {
            const allowedTabs = new Set(['notifications', 'display', 'sidebar', 'advanced']);
            for (const setting of builtInSearchableSettings) {
                expect(allowedTabs.has(setting.tab)).toBe(true);
            }
        });
    });

    describe('searchUserSettings', () => {
        const index = createUserSettingsSearchIndex(builtInSearchableSettings, intl);

        test('returns nothing for an empty query', () => {
            expect(searchUserSettings('', builtInSearchableSettings, index)).toEqual([]);
            expect(searchUserSettings('   ', builtInSearchableSettings, index)).toEqual([]);
        });

        test('matches a setting by its localized title', () => {
            const results = searchUserSettings('language', builtInSearchableSettings, index);
            expect(results.some((r) => r.tab === 'display' && r.section === 'languages')).toBe(true);
        });

        test('matches a setting by keyword synonym', () => {
            const results = searchUserSettings('markdown', builtInSearchableSettings, index);
            expect(results.some((r) => r.tab === 'advanced' && r.section === 'formatting')).toBe(true);
        });

        test('matches notification email setting', () => {
            const results = searchUserSettings('email', builtInSearchableSettings, index);
            expect(results.some((r) => r.tab === 'notifications' && r.section === 'email')).toBe(true);
        });

        test('returns nothing for a query with no matches', () => {
            expect(searchUserSettings('notawordinsettings', builtInSearchableSettings, index)).toEqual([]);
        });
    });

    describe('getPluginSearchableSettings', () => {
        test('returns an empty array when no plugin settings are provided', () => {
            expect(getPluginSearchableSettings()).toEqual([]);
            expect(getPluginSearchableSettings({})).toEqual([]);
        });

        test('indexes plugin sections and their settings', () => {
            const pluginSettings: {[pluginId: string]: PluginConfiguration} = {
                myplugin: {
                    id: 'myplugin',
                    uiName: 'My Plugin',
                    sections: [
                        {
                            title: 'Custom Section',
                            settings: [
                                {
                                    name: 'foo',
                                    type: 'radio',
                                    default: 'a',
                                    title: 'Foo setting',
                                    helpText: 'A special widget toggle',
                                    options: [{value: 'a', text: 'A'}],
                                },
                            ],
                        },
                    ],
                },
            };

            const entries = getPluginSearchableSettings(pluginSettings);
            expect(entries).toHaveLength(1);
            expect(entries[0].tab).toBe('myplugin');
            expect(entries[0].section).toBe('Custom Section');
            expect(entries[0].keywords).toContain('A special widget toggle');

            const all = [...builtInSearchableSettings, ...entries];
            const index = createUserSettingsSearchIndex(all, intl);
            const results = searchUserSettings('widget', all, index);
            expect(results.some((r) => r.tab === 'myplugin' && r.section === 'Custom Section')).toBe(true);
        });
    });
});
