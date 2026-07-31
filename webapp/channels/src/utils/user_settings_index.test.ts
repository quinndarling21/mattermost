// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createIntl} from 'react-intl';

import {generateUserSettingsIndex} from './user_settings_index';

const enMessages = require('../i18n/en');

describe('UserSettingsIndex.generateUserSettingsIndex', () => {
    const intl = createIntl({locale: 'en', messages: enMessages, defaultLocale: 'en'});

    it('should find product settings by keyword', () => {
        const idx = generateUserSettingsIndex(intl, {
            isContentProductSettings: true,
            pluginSettings: {},
        });

        expect(idx.search('theme')).toEqual(expect.arrayContaining(['display.theme']));
        expect(idx.search('password')).toEqual([]);
        expect(idx.search('notification')).toEqual(expect.arrayContaining(['notifications.desktopAndMobile']));
    });

    it('should find profile settings by keyword', () => {
        const idx = generateUserSettingsIndex(intl, {
            isContentProductSettings: false,
            pluginSettings: {},
        });

        expect(idx.search('password')).toEqual(expect.arrayContaining(['security.password']));
        expect(idx.search('theme')).toEqual([]);
        expect(idx.search('email')).toEqual(expect.arrayContaining(['profile.email']));
    });

    it('should include plugin settings in the index', () => {
        const idx = generateUserSettingsIndex(intl, {
            isContentProductSettings: true,
            pluginSettings: {
                plugin_a: {
                    id: 'plugin_a',
                    uiName: 'Plugin A',
                    sections: [{title: 'Plugin Section', settings: []}],
                },
            },
        });

        expect(idx.search('plugin')).toEqual(expect.arrayContaining(['plugin_a.plugin_a', 'plugin_a.Plugin Section']));
    });

    it('should return no matches for unknown queries', () => {
        const idx = generateUserSettingsIndex(intl, {
            isContentProductSettings: true,
            pluginSettings: {},
        });

        expect(idx.search('notexistingword')).toEqual([]);
    });
});
