// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Preferences} from 'mattermost-redux/constants';

import {renderWithContext, screen} from 'tests/react_testing_utils';
import {TestHelper} from 'utils/test_helper';

import type {GlobalState} from 'types/store';

import ChannelEmoji from './channel_emoji';
import {getChannelEmoji, makeChannelEmojiPreference} from './utils';

describe('components/sidebar/sidebar_channel/channel_emoji', () => {
    const channelId = 'channel_id';

    function stateWithChannelEmoji(emojiName?: string, customEmojis = {}) {
        const myPreferences = emojiName ? {
            [`${Preferences.CATEGORY_CHANNEL_EMOJI}--${channelId}`]: makeChannelEmojiPreference('user_id', channelId, emojiName),
        } : {};

        // Custom emoji stays disabled unless a test provides some, so unresolved names don't trigger a fetch.
        const enableCustomEmoji = Object.keys(customEmojis).length > 0;

        return {
            entities: {
                general: {config: {EnableCustomEmoji: String(enableCustomEmoji)}},
                preferences: {myPreferences},
                emojis: {customEmoji: customEmojis},
            },
        };
    }

    test('renders nothing when no emoji is assigned', () => {
        renderWithContext(<ChannelEmoji channelId={channelId}/>, stateWithChannelEmoji());

        expect(screen.queryByTestId('channelEmoji')).not.toBeInTheDocument();
    });

    test('renders an assigned system emoji as a decorative marker', () => {
        renderWithContext(<ChannelEmoji channelId={channelId}/>, stateWithChannelEmoji('rocket'));

        const marker = screen.getByTestId('channelEmoji');
        expect(marker).toHaveAttribute('aria-hidden', 'true');
        expect(marker.querySelector('[data-emoticon="rocket"]')).toBeInTheDocument();
    });

    test('renders an assigned custom emoji that is loaded', () => {
        const customEmoji = TestHelper.getCustomEmojiMock({id: 'emoji_id', name: 'team-logo'});

        renderWithContext(<ChannelEmoji channelId={channelId}/>, stateWithChannelEmoji('team-logo', {[customEmoji.id]: customEmoji}));

        expect(screen.getByTestId('channelEmoji').querySelector('[data-emoticon="team-logo"]')).toBeInTheDocument();
    });

    test('renders nothing instead of a broken marker when the emoji cannot be resolved', () => {
        renderWithContext(<ChannelEmoji channelId={channelId}/>, stateWithChannelEmoji('deleted-custom-emoji'));

        expect(screen.queryByTestId('channelEmoji')).not.toBeInTheDocument();
        expect(screen.queryByText(/deleted-custom-emoji/)).not.toBeInTheDocument();
    });

    test('requests the assigned emoji so custom emoji that are not loaded yet can appear', () => {
        const spy = jest.spyOn(require('actions/emoji_actions'), 'loadCustomEmojisIfNeeded').mockReturnValue({type: 'MOCK_LOAD_CUSTOM_EMOJIS'});

        renderWithContext(<ChannelEmoji channelId={channelId}/>, stateWithChannelEmoji('team-logo'));

        expect(spy).toHaveBeenCalledWith(['team-logo']);

        spy.mockRestore();
    });

    test('getChannelEmoji reads the preference for the given channel only', () => {
        const state = stateWithChannelEmoji('rocket') as unknown as GlobalState;

        expect(getChannelEmoji(state, channelId)).toBe('rocket');
        expect(getChannelEmoji(state, 'other_channel')).toBe('');
    });
});
