// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {UserSettingsSearchItem, UserSettingsSearchMatch} from './types';

export function normalizeSearchText(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function scoreField(field: string, query: string): number | null {
    const normalized = normalizeSearchText(field);
    if (!normalized || !query) {
        return null;
    }

    if (normalized === query) {
        return 100;
    }
    if (normalized.startsWith(query)) {
        return 80;
    }

    // Prefix-friendly token match: "appear" matches "Appearance"
    const tokens = normalized.split(' ');
    if (tokens.some((token) => token.startsWith(query))) {
        return 70;
    }

    if (normalized.includes(query)) {
        return 60;
    }

    return null;
}

function scoreItem(item: UserSettingsSearchItem, query: string): number | null {
    const candidates: Array<{value: string; weight: number}> = [
        {value: item.label, weight: 0},
        {value: item.tabLabel, weight: -5},
        {value: item.description || '', weight: -10},
        ...item.aliases.map((alias) => ({value: alias, weight: -2})),
    ];

    let best: number | null = null;
    for (const candidate of candidates) {
        const score = scoreField(candidate.value, query);
        if (score === null) {
            continue;
        }
        const weighted = score + candidate.weight;
        if (best === null || weighted > best) {
            best = weighted;
        }
    }

    return best;
}

/**
 * Filter and rank searchable settings. Prefer exact/prefix label matches, then
 * aliases, then broader substring matches. Source order is the tie-breaker.
 */
export function filterUserSettings(
    items: UserSettingsSearchItem[],
    rawQuery: string,
): UserSettingsSearchMatch[] {
    const query = normalizeSearchText(rawQuery);
    if (!query) {
        return [];
    }

    const matches: UserSettingsSearchMatch[] = [];
    items.forEach((item, index) => {
        const score = scoreItem(item, query);
        if (score === null) {
            return;
        }
        matches.push({
            ...item,
            score: score - (index * 0.001),
        });
    });

    return matches.sort((a, b) => b.score - a.score);
}

export function groupSearchMatchesByTab(
    matches: UserSettingsSearchMatch[],
): Array<{tab: string; tabLabel: string; isPlugin: boolean; items: UserSettingsSearchMatch[]}> {
    const groups: Array<{tab: string; tabLabel: string; isPlugin: boolean; items: UserSettingsSearchMatch[]}> = [];
    const indexByTab = new Map<string, number>();

    for (const match of matches) {
        const existing = indexByTab.get(match.tab);
        if (existing === undefined) {
            indexByTab.set(match.tab, groups.length);
            groups.push({
                tab: match.tab,
                tabLabel: match.tabLabel,
                isPlugin: Boolean(match.isPlugin),
                items: [match],
            });
        } else {
            groups[existing].items.push(match);
        }
    }

    return groups;
}
