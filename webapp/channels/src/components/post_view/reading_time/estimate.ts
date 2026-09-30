// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Post} from '@mattermost/types/posts';

import {Posts} from 'mattermost-redux/constants';
import {isPostEphemeral, isPostPendingOrFailed, isSystemMessage} from 'mattermost-redux/utils/post_utils';

import {Locations} from 'utils/constants';

export const WORDS_PER_MINUTE = 200;
export const MAX_READING_MINUTES = 60;

// Markers are not words. Fence bodies and link text/URLs still count.
export function stripMarkdownNoise(message: string): string {
    return message.
        replace(/!\[([^\]]*)\]\(([^)]*)\)/g, ' $1 $2 ').
        replace(/\[([^\]]*)\]\(([^)]*)\)/g, ' $1 $2 ').
        replace(/```[^\n]*\n?/g, ' ').
        replace(/^\s{0,3}#{1,6}\s+/gm, '').
        replace(/^\s{0,3}>\s?/gm, '').
        replace(/^\s{0,3}(?:[-*_]\s*){3,}$/gm, '').
        replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '').
        replace(/[*_~`]/g, '');
}

function isWordToken(token: string): boolean {
    return (/[\p{L}\p{N}]/u).test(token);
}

export function countWords(message: string): number {
    const stripped = stripMarkdownNoise(message).trim();
    if (!stripped) {
        return 0;
    }

    return stripped.split(/\s+/).filter(isWordToken).length;
}

export function estimateReadingMinutes(message: string): number {
    const words = countWords(message || '');
    if (words < WORDS_PER_MINUTE) {
        return 0;
    }

    return Math.min(MAX_READING_MINUTES, Math.ceil(words / WORDS_PER_MINUTE));
}

export type ReadingTimeVisibility = {
    location: string;
    timestampVisible: boolean;
    headerCollapsed: boolean;
};

export function readingMinutesForPost(post: Post, visibility: ReadingTimeVisibility): number {
    if (!visibility.timestampVisible || visibility.headerCollapsed) {
        return 0;
    }

    if (visibility.location !== Locations.CENTER && visibility.location !== Locations.RHS_ROOT) {
        return 0;
    }

    if (post.root_id) {
        return 0;
    }

    if (isSystemMessage(post) || isPostEphemeral(post) || isPostPendingOrFailed(post) || post.state === Posts.POST_DELETED) {
        return 0;
    }

    return estimateReadingMinutes(post.message || '');
}
