// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {ChannelType} from '@mattermost/types/channels';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import SidebarBaseChannelIcon from './sidebar_base_channel_icon';

jest.mock('components/emoji/render_emoji', () => {
    return ({emojiName}: {emojiName: string}) => (
        <span data-testid='render-emoji'>{emojiName}</span>
    );
});

jest.mock('mattermost-redux/utils/emoji_utils', () => ({
    getEmojiImageUrl: () => 'https://example.test/emoji.png',
}));

jest.mock('selectors/emojis', () => ({
    getEmojiMap: () => ({
        get: (name: string) => (name === 'rocket' ? {name: 'rocket'} : undefined),
    }),
}));

describe('components/sidebar/sidebar_channel/sidebar_base_channel_icon', () => {
    test('renders the public channel icon when no emoji is set', () => {
        renderWithContext(
            <SidebarBaseChannelIcon channelType={'O' as ChannelType}/>,
        );

        expect(document.querySelector('.icon-globe')).toBeInTheDocument();
        expect(screen.queryByTestId('render-emoji')).not.toBeInTheDocument();
    });

    test('renders the channel emoji when it can be resolved', () => {
        renderWithContext(
            <SidebarBaseChannelIcon
                channelType={'O' as ChannelType}
                emoji=':rocket:'
            />,
        );

        expect(document.querySelector('.icon-globe')).not.toBeInTheDocument();
        expect(screen.getByTestId('render-emoji')).toHaveTextContent('rocket');
    });

    test('falls back to the type icon when the emoji cannot be resolved', () => {
        renderWithContext(
            <SidebarBaseChannelIcon
                channelType={'P' as ChannelType}
                emoji='missing-custom'
            />,
        );

        expect(document.querySelector('.icon-lock-outline')).toBeInTheDocument();
        expect(screen.queryByTestId('render-emoji')).not.toBeInTheDocument();
    });
});
