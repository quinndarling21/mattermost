// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    buildSettingsSearchIndex,
    filterSettingsSearchResults,
    matchesSettingsSearch,
    normalizeSettingsSearchQuery,
} from './settings_search_index';

describe('settings_search_index', () => {
    const formatMessage = (descriptor: {defaultMessage?: string}) => descriptor.defaultMessage || '';

    it('normalizes search queries', () => {
        expect(normalizeSettingsSearchQuery('  Theme   ')).toBe('theme');
        expect(normalizeSettingsSearchQuery('')).toBe('');
    });

    it('matches labels case-insensitively', () => {
        expect(matchesSettingsSearch('Theme', 'theme')).toBe(true);
        expect(matchesSettingsSearch('Password', 'nomatch')).toBe(false);
    });

    it('builds product settings search index with tabs and sections', () => {
        const index = buildSettingsSearchIndex(formatMessage, {
            isContentProductSettings: true,
            pluginSettings: {},
        });

        expect(index.some((entry) => entry.tab === 'display' && entry.section === 'theme')).toBe(true);
        expect(index.some((entry) => entry.tab === 'notifications' && !entry.section)).toBe(true);
    });

    it('builds profile settings search index', () => {
        const index = buildSettingsSearchIndex(formatMessage, {
            isContentProductSettings: false,
            pluginSettings: {},
        });

        expect(index.some((entry) => entry.tab === 'profile' && entry.section === 'password')).toBe(false);
        expect(index.some((entry) => entry.tab === 'security' && entry.section === 'password')).toBe(true);
    });

    it('includes plugin tabs and sections in the search index', () => {
        const index = buildSettingsSearchIndex(formatMessage, {
            isContentProductSettings: true,
            pluginSettings: {
                plugin_a: {
                    id: 'plugin_a',
                    uiName: 'Plugin A',
                    sections: [{title: 'Plugin Section', settings: [{name: 'setting'}]}],
                },
            },
        });

        expect(index.some((entry) => entry.tab === 'plugin_a' && entry.label === 'Plugin A')).toBe(true);
        expect(index.some((entry) => entry.tab === 'plugin_a' && entry.section === 'Plugin Section')).toBe(true);
    });

    it('filters search results by label and tab name', () => {
        const index = buildSettingsSearchIndex(formatMessage, {
            isContentProductSettings: true,
            pluginSettings: {},
        });

        const themeResults = filterSettingsSearchResults(index, 'theme');
        expect(themeResults.some((entry) => entry.section === 'theme')).toBe(true);

        const displayResults = filterSettingsSearchResults(index, 'display');
        expect(displayResults.some((entry) => entry.tab === 'display' && !entry.section)).toBe(true);
    });

    it('returns empty results for unmatched queries', () => {
        const index = buildSettingsSearchIndex(formatMessage, {
            isContentProductSettings: true,
            pluginSettings: {},
        });

        expect(filterSettingsSearchResults(index, 'zzzznotfound')).toEqual([]);
    });
});
