// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Preferences} from 'mattermost-redux/constants';

import type {GlobalState} from 'types/store';

import {getChannelEmojiName, makeChannelEmojiPreference} from './helpers';

describe('channel emoji helpers', () => {
    const preference = makeChannelEmojiPreference('user_id', 'channel_id', ' smile ');

    test('stores the channel id as the preference name', () => {
        expect(preference).toEqual({
            user_id: 'user_id',
            category: Preferences.CATEGORY_CHANNEL_EMOJI,
            name: 'channel_id',
            value: ' smile ',
        });
    });

    test('reads and trims the current user preference for a channel', () => {
        const state = {
            entities: {
                preferences: {
                    myPreferences: {
                        [`${Preferences.CATEGORY_CHANNEL_EMOJI}--channel_id`]: {
                            ...preference,
                            value: '  smile  ',
                        },
                    },
                },
            },
        } as GlobalState;

        expect(getChannelEmojiName(state, 'channel_id')).toBe('smile');
        expect(getChannelEmojiName(state, 'other_channel')).toBe('');
    });
});
