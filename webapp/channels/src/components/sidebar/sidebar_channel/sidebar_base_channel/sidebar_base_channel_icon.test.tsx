// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {loadCustomEmojisIfNeeded} from 'actions/emoji_actions';

import {renderWithContext, screen} from 'tests/react_testing_utils';
import Constants from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import SidebarBaseChannelIcon from './sidebar_base_channel_icon';

jest.mock('actions/emoji_actions', () => ({
    loadCustomEmojisIfNeeded: jest.fn(() => ({type: 'MOCK_LOAD_CUSTOM_EMOJIS'})),
}));

describe('components/sidebar/sidebar_channel/sidebar_base_channel/sidebar_base_channel_icon', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render the globe icon for a public channel without an emoji', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon channelType={Constants.OPEN_CHANNEL}/>,
        );

        expect(container.querySelector('.icon-globe')).toBeInTheDocument();
        expect(screen.queryByTestId('sidebar-channel-emoji')).not.toBeInTheDocument();
        expect(loadCustomEmojisIfNeeded).not.toHaveBeenCalled();
    });

    test('should render the lock icon for a private channel without an emoji', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon channelType={Constants.PRIVATE_CHANNEL}/>,
        );

        expect(container.querySelector('.icon-lock-outline')).toBeInTheDocument();
        expect(screen.queryByTestId('sidebar-channel-emoji')).not.toBeInTheDocument();
    });

    test('should render a system emoji in place of the channel type icon', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon
                channelType={Constants.OPEN_CHANNEL}
                emoji='rocket'
            />,
        );

        expect(screen.getByTestId('sidebar-channel-emoji')).toBeInTheDocument();
        expect(container.querySelector('[data-emoticon="rocket"]')).toBeInTheDocument();
        expect(container.querySelector('.icon-globe')).not.toBeInTheDocument();
        expect(loadCustomEmojisIfNeeded).not.toHaveBeenCalled();
    });

    test('should render a loaded custom emoji', () => {
        const customEmoji = TestHelper.getCustomEmojiMock({id: 'custom_emoji_id', name: 'team-mascot'});

        const {container} = renderWithContext(
            <SidebarBaseChannelIcon
                channelType={Constants.PRIVATE_CHANNEL}
                emoji='team-mascot'
            />,
            {
                entities: {
                    general: {
                        config: {
                            EnableCustomEmoji: 'true',
                        },
                    },
                    emojis: {
                        customEmoji: {
                            [customEmoji.id]: customEmoji,
                        },
                    },
                },
            },
        );

        expect(container.querySelector('[data-emoticon="team-mascot"]')).toBeInTheDocument();
        expect(container.querySelector('.icon-lock-outline')).not.toBeInTheDocument();
    });

    test('should fall back to the type icon and request the emoji when a custom emoji is not loaded', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon
                channelType={Constants.PRIVATE_CHANNEL}
                emoji='not-loaded-yet'
            />,
        );

        expect(container.querySelector('.icon-lock-outline')).toBeInTheDocument();
        expect(screen.queryByTestId('sidebar-channel-emoji')).not.toBeInTheDocument();
        expect(loadCustomEmojisIfNeeded).toHaveBeenCalledWith(['not-loaded-yet']);
    });
});
