// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {ChannelType} from '@mattermost/types/channels';

import {renderWithContext} from 'tests/react_testing_utils';
import {TestHelper} from 'utils/test_helper';

import ChannelEmoji from './channel_emoji';

describe('components/sidebar/sidebar_channel/channel_emoji', () => {
    const channel = TestHelper.getChannelMock({id: 'channel_id', type: 'O' as ChannelType});

    const stateWithEmoji = (emojiName: string) => ({
        entities: {
            preferences: {
                myPreferences: {
                    'channel_emoji--channel_id': {
                        user_id: 'user_id',
                        category: 'channel_emoji',
                        name: 'channel_id',
                        value: emojiName,
                    },
                },
            },
        },
    });

    test('should render nothing when no emoji preference is set', () => {
        const {container} = renderWithContext(<ChannelEmoji channel={channel}/>);

        expect(container.querySelector('.ChannelEmoji')).not.toBeInTheDocument();
    });

    test('should render a standard emoji marker when a preference is set', () => {
        const {container} = renderWithContext(
            <ChannelEmoji channel={channel}/>,
            stateWithEmoji('smile'),
        );

        const marker = container.querySelector('.ChannelEmoji');
        expect(marker).toBeInTheDocument();
        expect(marker).toHaveAttribute('aria-hidden', 'true');
        expect(marker!.querySelector('[data-emoticon="smile"]')).toBeInTheDocument();
    });

    test('should render a custom emoji marker when the custom emoji exists', () => {
        const customEmoji = TestHelper.getCustomEmojiMock({id: 'custom_emoji_id', name: 'parrot'});

        const {container} = renderWithContext(
            <ChannelEmoji channel={channel}/>,
            {
                ...stateWithEmoji('parrot'),
                entities: {
                    ...stateWithEmoji('parrot').entities,
                    emojis: {
                        customEmoji: {
                            custom_emoji_id: customEmoji,
                        },
                    },
                },
            },
        );

        expect(container.querySelector('.ChannelEmoji')).toBeInTheDocument();
    });

    test('should render nothing when the saved custom emoji no longer exists', () => {
        const {container} = renderWithContext(
            <ChannelEmoji channel={channel}/>,
            stateWithEmoji('deleted_custom_emoji'),
        );

        expect(container.querySelector('.ChannelEmoji')).not.toBeInTheDocument();
        expect(container).not.toHaveTextContent(':deleted_custom_emoji:');
    });

    test('should render nothing for DM channels even when a preference exists', () => {
        const dmChannel = TestHelper.getChannelMock({id: 'channel_id', type: 'D' as ChannelType});

        const {container} = renderWithContext(
            <ChannelEmoji channel={dmChannel}/>,
            stateWithEmoji('smile'),
        );

        expect(container.querySelector('.ChannelEmoji')).not.toBeInTheDocument();
    });

    test('should render nothing for GM channels even when a preference exists', () => {
        const gmChannel = TestHelper.getChannelMock({id: 'channel_id', type: 'G' as ChannelType});

        const {container} = renderWithContext(
            <ChannelEmoji channel={gmChannel}/>,
            stateWithEmoji('smile'),
        );

        expect(container.querySelector('.ChannelEmoji')).not.toBeInTheDocument();
    });
});
