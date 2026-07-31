// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createIntl, createIntlCache} from 'react-intl';

import {
    buildUserSettingsSearchIndex,
    filterSettingsSearchEntries,
    matchesSettingsSearch,
    normalizeSearchQuery,
} from './user_settings_search_index';

const intl = createIntl({locale: 'en', messages: {}}, createIntlCache());

describe('user_settings_search_index', () => {
    it('normalizes search queries', () => {
        expect(normalizeSearchQuery('  Theme   ')).toBe('theme');
        expect(normalizeSearchQuery('')).toBe('');
    });

    it('matches labels case-insensitively', () => {
        expect(matchesSettingsSearch('Theme', 'theme')).toBe(true);
        expect(matchesSettingsSearch('Password', 'sign')).toBe(false);
    });

    it('builds product settings entries including plugins', () => {
        const entries = buildUserSettingsSearchIndex(
            intl.formatMessage,
            true,
            {
                plugin_a: {
                    id: 'plugin_a',
                    uiName: 'Plugin A',
                    sections: [{title: 'Plugin A Section', settings: [{name: 'setting'}]}],
                },
            },
        );

        expect(entries.some((entry) => entry.type === 'tab' && entry.tab === 'display')).toBe(true);
        expect(entries.some((entry) => entry.section === 'theme' && entry.tab === 'display')).toBe(true);
        expect(entries.some((entry) => entry.tab === 'plugin_a' && entry.type === 'tab')).toBe(true);
        expect(entries.some((entry) => entry.section === 'Plugin A Section')).toBe(true);
    });

    it('builds profile settings entries', () => {
        const entries = buildUserSettingsSearchIndex(intl.formatMessage, false, {});

        expect(entries.some((entry) => entry.tab === 'profile' && entry.type === 'tab')).toBe(true);
        expect(entries.some((entry) => entry.tab === 'security' && entry.section === 'password')).toBe(true);
        expect(entries.some((entry) => entry.tab === 'profile' && entry.section === 'email')).toBe(true);
    });

    it('filters entries by query and deduplicates', () => {
        const entries = buildUserSettingsSearchIndex(intl.formatMessage, true, {});
        const results = filterSettingsSearchEntries(entries, 'theme');

        expect(results.length).toBeGreaterThan(0);
        expect(results.every((entry) => entry.label.toLowerCase().includes('theme') || entry.tabLabel.toLowerCase().includes('theme'))).toBe(true);
        expect(filterSettingsSearchEntries(entries, '')).toEqual([]);
        expect(filterSettingsSearchEntries(entries, 'zzzznotfound')).toEqual([]);
    });
});
