// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {Channel} from '@mattermost/types/channels';
import type {CustomEmoji} from '@mattermost/types/emojis';

import {Preferences} from 'mattermost-redux/constants';

import {renderWithContext, screen} from 'tests/react_testing_utils';
import {TestHelper} from 'utils/test_helper';

import ChannelEmoji from './channel_emoji';

function preferenceState(channelId: string, emojiName: string, customEmoji?: CustomEmoji) {
    return {
        entities: {
            general: {
                config: {
                    EnableCustomEmoji: 'true',
                },
            },
            emojis: {
                customEmoji: customEmoji ? {[customEmoji.id]: customEmoji} : {},
            },
            preferences: {
                myPreferences: {
                    [`${Preferences.CATEGORY_CHANNEL_EMOJI}--${channelId}`]: {
                        user_id: 'user_id',
                        category: Preferences.CATEGORY_CHANNEL_EMOJI,
                        name: channelId,
                        value: emojiName,
                    },
                },
            },
        },
    };
}

describe('ChannelEmoji', () => {
    const channel = TestHelper.getChannelMock({id: 'channel_id', type: 'O'});

    test.each(['O', 'P'] as const)('renders a standard emoji marker for %s channels', (type) => {
        const {container} = renderWithContext(
            <ChannelEmoji channel={TestHelper.getChannelMock({id: 'channel_id', type})}/>,
            preferenceState(channel.id, 'smile'),
        );

        const marker = container.querySelector('.ChannelEmoji');
        expect(marker).toHaveAttribute('aria-hidden', 'true');
        expect(marker?.querySelector('[data-emoticon="smile"]')).toBeInTheDocument();
        expect(screen.queryByText(':smile:')).not.toBeInTheDocument();
    });

    test('renders a custom emoji', () => {
        const customEmoji: CustomEmoji = {
            id: 'emoji1',
            name: 'party-parrot',
            category: 'custom',
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            creator_id: 'user_id',
        };
        const {container} = renderWithContext(
            <ChannelEmoji channel={channel}/>,
            preferenceState(channel.id, 'party-parrot', customEmoji),
        );

        expect(container.querySelector('[data-emoticon="party-parrot"]')).toBeInTheDocument();
    });

    test('omits a marker when the saved emoji cannot be resolved', () => {
        const {container} = renderWithContext(
            <ChannelEmoji channel={channel}/>,
            preferenceState(channel.id, 'deleted-custom'),
        );

        expect(container.querySelector('.ChannelEmoji')).not.toBeInTheDocument();
        expect(container).not.toHaveTextContent(':deleted-custom:');
        expect(container).not.toHaveTextContent('deleted-custom');
    });

    test.each(['D', 'G'] as const)('does not render a marker for %s channels', (type) => {
        const directChannel = TestHelper.getChannelMock({id: 'channel_id', type}) as Channel;
        const {container} = renderWithContext(
            <ChannelEmoji channel={directChannel}/>,
            preferenceState(directChannel.id, 'smile'),
        );

        expect(container.querySelector('.ChannelEmoji')).not.toBeInTheDocument();
    });
});
