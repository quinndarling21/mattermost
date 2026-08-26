// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    text: string;
    query: string;
};

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlight case-insensitive substrings of `query` within `text`.
 * Falls back to plain text when there is no match.
 */
export default function HighlightMatches({text, query}: Props): JSX.Element {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
        return <>{text}</>;
    }

    const matcher = new RegExp(escapeRegExp(normalizedQuery), 'ig');
    const parts: Array<string | JSX.Element> = [];
    let lastIndex = 0;
    let match = matcher.exec(text);
    let matchCount = 0;

    while (match) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        parts.push(
            <mark
                key={`${match.index}-${matchCount}`}
                className='SettingsSidebar__searchHighlight'
            >
                {match[0]}
            </mark>,
        );
        lastIndex = match.index + match[0].length;
        matchCount += 1;
        match = matcher.exec(text);
    }

    if (matchCount === 0) {
        return <>{text}</>;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return <>{parts}</>;
}
