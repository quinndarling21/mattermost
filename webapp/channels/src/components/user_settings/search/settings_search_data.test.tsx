// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createIntl} from 'react-intl';

import {searchSettings, settingsSearchEntries} from './settings_search_data';

const intl = createIntl({locale: 'en', messages: {}});

const PRODUCT_TABS = ['notifications', 'display', 'sidebar', 'advanced'];
const PROFILE_TABS = ['profile', 'security'];
const ALL_TABS = [...PRODUCT_TABS, ...PROFILE_TABS];

describe('searchSettings', () => {
    test('returns nothing for an empty query', () => {
        expect(searchSettings('', intl, ALL_TABS)).toHaveLength(0);
        expect(searchSettings('   ', intl, ALL_TABS)).toHaveLength(0);
    });

    test('matches a setting by its title', () => {
        const results = searchSettings('theme', intl, ALL_TABS);
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].tab).toBe('display');
        expect(results[0].section).toBe('theme');
    });

    test('matches a setting by a keyword synonym, not just its title', () => {
        const results = searchSettings('dark mode', intl, ALL_TABS);
        expect(results.some((r) => r.tab === 'display' && r.section === 'theme')).toBe(true);
    });

    test('matches multi-factor auth via the "2fa" synonym', () => {
        const results = searchSettings('2fa', intl, ALL_TABS);
        expect(results.some((r) => r.tab === 'security' && r.section === 'mfa')).toBe(true);
    });

    test('only returns entries for the available tabs', () => {
        const results = searchSettings('password', intl, PRODUCT_TABS);
        expect(results.every((r) => PRODUCT_TABS.includes(r.tab))).toBe(true);
        expect(results.some((r) => r.tab === 'security')).toBe(false);

        const profileResults = searchSettings('password', intl, PROFILE_TABS);
        expect(profileResults.some((r) => r.tab === 'security' && r.section === 'password')).toBe(true);
    });

    test('ranks exact/prefix title matches above keyword-only matches', () => {
        const results = searchSettings('email', intl, ALL_TABS);
        expect(results.length).toBeGreaterThan(1);

        // Entries whose title starts with the query must come before others.
        const titleMatchIndex = results.findIndex((r) => intl.formatMessage(r.title).toLowerCase().startsWith('email'));
        expect(titleMatchIndex).toBe(0);
    });

    test('applies AND semantics across query terms', () => {
        const results = searchSettings('reply notifications', intl, ALL_TABS);
        expect(results.some((r) => r.tab === 'notifications' && r.section === 'replyNotifications')).toBe(true);
    });

    test('returns an empty list when nothing matches', () => {
        expect(searchSettings('zzzznotarealsetting', intl, ALL_TABS)).toHaveLength(0);
    });
});

describe('settingsSearchEntries', () => {
    test('every entry has a unique tab/section pair', () => {
        const keys = settingsSearchEntries.map((e) => `${e.tab}:${e.section}`);
        expect(new Set(keys).size).toBe(keys.length);
    });

    test('every entry carries a title, description and keywords', () => {
        for (const entry of settingsSearchEntries) {
            expect(entry.title.defaultMessage).toBeTruthy();
            expect(entry.description.defaultMessage).toBeTruthy();
            expect(entry.keywords.defaultMessage).toBeTruthy();
        }
    });
});
