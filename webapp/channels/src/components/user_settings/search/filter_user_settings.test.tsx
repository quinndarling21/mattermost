// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {IntlShape} from 'react-intl';

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

    it('matches aliases such as dark mode', () => {
        const matches = filterUserSettings(items, 'dark mode');
        expect(matches[0]?.section).toBe('theme');
        expect(matches[0]?.tab).toBe('display');
    });

    it('matches prefix tokens like appear -> Appearance/theme aliases', () => {
        const matches = filterUserSettings(items, 'appear');
        expect(matches.some((match) => match.section === 'theme')).toBe(true);
    });

    it('returns empty list for empty query', () => {
        expect(filterUserSettings(items, '   ')).toEqual([]);
    });

    it('matches plugin metadata', () => {
        const pluginSettings: {[pluginId: string]: PluginConfiguration} = {
            demo: {
                id: 'demo',
                uiName: 'Demo Plugin',
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
        const byName = filterUserSettings(withPlugins, 'Demo Setting Title');
        expect(byName.some((match) => match.tab === 'demo')).toBe(true);

        const byOption = filterUserSettings(withPlugins, 'Option A');
        expect(byOption.some((match) => match.tab === 'demo')).toBe(true);
    });
});

describe('buildUserSettingsSearchItems coverage', () => {
    it('includes every first-party product setting section', () => {
        const sections = getFirstPartyProductSettingSectionIds();
        expect(sections.length).toBeGreaterThan(10);
        expect(sections).toEqual(expect.arrayContaining([
            'theme',
            'desktopAndMobile',
            'showUnreadsCategory',
            'formatting',
        ]));
    });

    it('includes every first-party profile setting section', () => {
        const sections = getFirstPartyProfileSettingSectionIds();
        expect(sections).toEqual(expect.arrayContaining([
            'name',
            'username',
            'password',
            'mfa',
        ]));
    });

    it('scopes product vs profile modal state', () => {
        const product = buildUserSettingsSearchItems(intl, true, {});
        const profile = buildUserSettingsSearchItems(intl, false, {});

        expect(product.some((item) => item.tab === 'display')).toBe(true);
        expect(product.some((item) => item.tab === 'profile')).toBe(false);
        expect(profile.some((item) => item.tab === 'profile')).toBe(true);
        expect(profile.some((item) => item.tab === 'display')).toBe(false);
    });
});
