// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    text: string;
    query: string;
};

/**
 * Highlight case-insensitive substrings of `query` within `text`.
 * Falls back to plain text when there is no match.
 */
export default function HighlightMatches({text, query}: Props): JSX.Element {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
        return <>{text}</>;
    }

    const lowerText = text.toLowerCase();
    const lowerQuery = normalizedQuery.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerQuery);

    if (matchIndex === -1) {
        return <>{text}</>;
    }

    const before = text.slice(0, matchIndex);
    const match = text.slice(matchIndex, matchIndex + normalizedQuery.length);
    const after = text.slice(matchIndex + normalizedQuery.length);

    return (
        <>
            {before}
            <mark className='SettingsSidebar__searchHighlight'>{match}</mark>
            {after}
        </>
    );
}
