// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {GlobalState} from 'types/store';

import {getChannelEmojiName, makeChannelEmojiPreference} from './helpers';

describe('components/sidebar/sidebar_channel/channel_emoji/helpers', () => {
    const makeState = (myPreferences: Record<string, unknown>) => ({
        entities: {
            preferences: {
                myPreferences,
            },
        },
    } as unknown as GlobalState);

    describe('getChannelEmojiName', () => {
        test('should return an empty string when no emoji preference exists for the channel', () => {
            expect(getChannelEmojiName(makeState({}), 'channel_id')).toBe('');
        });

        test('should return the saved emoji name for the channel', () => {
            const state = makeState({
                'channel_emoji--channel_id': {
                    user_id: 'user_id',
                    category: 'channel_emoji',
                    name: 'channel_id',
                    value: 'smile',
                },
            });

            expect(getChannelEmojiName(state, 'channel_id')).toBe('smile');
            expect(getChannelEmojiName(state, 'other_channel_id')).toBe('');
        });
    });

    describe('makeChannelEmojiPreference', () => {
        test('should build the preference used to save an emoji', () => {
            expect(makeChannelEmojiPreference('user_id', 'channel_id', 'smile')).toEqual({
                user_id: 'user_id',
                category: 'channel_emoji',
                name: 'channel_id',
                value: 'smile',
            });
        });

        test('should build the preference identity used to delete an emoji', () => {
            expect(makeChannelEmojiPreference('user_id', 'channel_id')).toEqual({
                user_id: 'user_id',
                category: 'channel_emoji',
                name: 'channel_id',
                value: '',
            });
        });
    });
});
