// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {MessageDescriptor} from 'react-intl';
import type {IntlShape} from 'react-intl';

import type {PluginConfiguration} from 'types/plugins/user_settings';

import type {Index} from './user_settings_index';
import {generateUserSettingsIndex, getUserSettingsSearchEntries} from './user_settings_index';

export type UserSettingsSearchMatch = {
    tab: string;
    section: string;
    id: string;
};

export type UserSettingsSearchFilter = {
    query: string;
    matchingSections: Set<string> | null;
};

export function buildSearchQuery(filter: string): string {
    let query = '';
    for (const term of filter.split(' ')) {
        const trimmed = term.trim();
        if (trimmed !== '') {
            query += trimmed + ' ';
            query += trimmed + '* ';
        }
    }
    return query;
}

export function searchUserSettings(
    filter: string,
    intl: IntlShape,
    options: {
        isContentProductSettings: boolean;
        pluginSettings: {[pluginId: string]: PluginConfiguration};
    },
    index?: Index | null,
): UserSettingsSearchFilter {
    if (!filter) {
        return {query: '', matchingSections: null};
    }

    const idx = index ?? generateUserSettingsIndex(intl, options);
    const sectionIds = idx.search(buildSearchQuery(filter));
    return {
        query: filter,
        matchingSections: new Set(sectionIds),
    };
}

export function getMatchingTabs(
    searchFilter: UserSettingsSearchFilter,
    tabNames: string[],
): Set<string> | null {
    if (!searchFilter.query) {
        return null;
    }

    if (!searchFilter.matchingSections || searchFilter.matchingSections.size === 0) {
        return new Set();
    }

    const matchingTabs = new Set<string>();
    for (const id of searchFilter.matchingSections) {
        const [tab] = id.split('.', 2);
        if (tab) {
            matchingTabs.add(tab);
        }
    }

    for (const tabName of tabNames) {
        if (tabName.toLowerCase().includes(searchFilter.query.toLowerCase())) {
            matchingTabs.add(tabName);
        }
    }

    return matchingTabs;
}

export function isUserSettingsSectionVisible(
    tab: string,
    section: string,
    searchFilter: UserSettingsSearchFilter,
): boolean {
    if (!searchFilter.query) {
        return true;
    }

    if (!searchFilter.matchingSections) {
        return false;
    }

    return searchFilter.matchingSections.has(`${tab}.${section}`);
}

export function getSearchMatches(
    searchFilter: UserSettingsSearchFilter,
    intl: IntlShape,
    options: {
        isContentProductSettings: boolean;
        pluginSettings: {[pluginId: string]: PluginConfiguration};
    },
): UserSettingsSearchMatch[] {
    if (!searchFilter.matchingSections) {
        return [];
    }

    const entries = getUserSettingsSearchEntries(intl, options);
    const entryById = new Map(entries.map((entry) => [entry.id, entry]));

    return Array.from(searchFilter.matchingSections).
        map((id) => entryById.get(id)).
        filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)).
        map((entry) => ({
            id: entry.id,
            tab: entry.tab,
            section: entry.section,
        }));
}

export function pushSearchText(texts: string[], value: string | MessageDescriptor, intl: IntlShape) {
    if (typeof value === 'string') {
        texts.push(value);
    } else {
        texts.push(intl.formatMessage(value));
    }
}
