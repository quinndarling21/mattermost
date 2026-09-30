// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Posts} from 'mattermost-redux/constants';

import {Locations} from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import {
    MAX_READING_MINUTES,
    WORDS_PER_MINUTE,
    countWords,
    estimateReadingMinutes,
    readingMinutesForPost,
    stripMarkdownNoise,
} from './estimate';

function words(count: number, word = 'word'): string {
    return Array.from({length: count}, () => word).join(' ');
}

describe('reading time estimate', () => {
    test('returns 0 below 200 words', () => {
        expect(countWords(words(0))).toBe(0);
        expect(countWords('   ')).toBe(0);
        expect(estimateReadingMinutes(words(WORDS_PER_MINUTE - 1))).toBe(0);
        expect(estimateReadingMinutes('')).toBe(0);
    });

    test('uses ceil(wordCount / 200) at and above the threshold', () => {
        expect(estimateReadingMinutes(words(200))).toBe(1);
        expect(estimateReadingMinutes(words(201))).toBe(2);
        expect(estimateReadingMinutes(words(400))).toBe(2);
        expect(estimateReadingMinutes(words(401))).toBe(3);
    });

    test('caps the displayed estimate at 60 minutes', () => {
        expect(estimateReadingMinutes(words(MAX_READING_MINUTES * WORDS_PER_MINUTE))).toBe(60);
        expect(estimateReadingMinutes(words((MAX_READING_MINUTES * WORDS_PER_MINUTE) + 1))).toBe(60);
    });

    test('strips markdown markers without dropping fence or link words', () => {
        const message = [
            '# Heading words here',
            '',
            'A **bold** and _italic_ phrase.',
            '',
            '> quoted line stays',
            '',
            '- list item stays',
            '',
            '[link text](https://example.com/docs)',
            '',
            '```js',
            'const answer = 42',
            '```',
            '',
            '---',
        ].join('\n');

        const stripped = stripMarkdownNoise(message);
        expect(stripped).not.toMatch(/[#>*_`]/);
        expect(countWords(message)).toBe(countWords([
            'Heading words here',
            'A bold and italic phrase.',
            'quoted line stays',
            'list item stays',
            'link text https://example.com/docs',
            'const answer = 42',
        ].join(' ')));
        expect(countWords('```')).toBe(0);
        expect(countWords('[click here](https://example.com)')).toBe(3);
        expect(countWords('```\nconst value equals one\n```')).toBe(4);
    });
});

describe('readingMinutesForPost', () => {
    const visible = {
        location: Locations.CENTER,
        timestampVisible: true,
        headerCollapsed: false,
    };

    test('shows the estimate for a long root post in center and RHS root', () => {
        const post = TestHelper.getPostMock({message: words(200), type: ''});

        expect(readingMinutesForPost(post, visible)).toBe(1);
        expect(readingMinutesForPost(post, {...visible, location: Locations.RHS_ROOT})).toBe(1);
    });

    test('hides short, reply, system, ephemeral, deleted, pending, and failed posts', () => {
        expect(readingMinutesForPost(TestHelper.getPostMock({message: words(199), type: ''}), visible)).toBe(0);
        expect(readingMinutesForPost(TestHelper.getPostMock({message: words(400), type: '', root_id: 'root'}), visible)).toBe(0);
        expect(readingMinutesForPost(TestHelper.getPostMock({message: words(400), type: 'system_join_channel'}), visible)).toBe(0);
        expect(readingMinutesForPost(TestHelper.getPostMock({message: words(400), type: Posts.POST_TYPES.EPHEMERAL}), visible)).toBe(0);
        expect(readingMinutesForPost(TestHelper.getPostMock({message: words(400), type: '', state: Posts.POST_DELETED}), visible)).toBe(0);
        expect(readingMinutesForPost(TestHelper.getPostMock({message: words(400), type: '', id: 'pending', pending_post_id: 'pending'}), visible)).toBe(0);
        expect(readingMinutesForPost(TestHelper.getPostMock({message: words(400), type: '', failed: true}), visible)).toBe(0);
    });

    test('hides the label when the header is collapsed, the timestamp is hidden, or the surface is out of scope', () => {
        const post = TestHelper.getPostMock({message: words(400), type: ''});

        expect(readingMinutesForPost(post, {...visible, headerCollapsed: true})).toBe(0);
        expect(readingMinutesForPost(post, {...visible, timestampVisible: false})).toBe(0);
        expect(readingMinutesForPost(post, {...visible, location: Locations.RHS_COMMENT})).toBe(0);
        expect(readingMinutesForPost(post, {...visible, location: Locations.SEARCH})).toBe(0);
    });

    test('drops the label when an edited message falls under the threshold', () => {
        const longPost = TestHelper.getPostMock({message: words(200), type: ''});
        const edited = {...longPost, message: words(20), edit_at: 1};

        expect(readingMinutesForPost(longPost, visible)).toBe(1);
        expect(readingMinutesForPost(edited, visible)).toBe(0);
    });
});
