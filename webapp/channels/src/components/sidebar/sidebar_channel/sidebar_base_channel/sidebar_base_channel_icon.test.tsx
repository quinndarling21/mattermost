// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {ChannelType} from '@mattermost/types/channels';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import SidebarBaseChannelIcon from './sidebar_base_channel_icon';

describe('components/sidebar/sidebar_channel/sidebar_base_channel/sidebar_base_channel_icon', () => {
    test('should render the globe icon for a public channel without an emoji', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon channelType={'O' as ChannelType}/>,
        );

        expect(container.querySelector('.icon-globe')).toBeInTheDocument();
        expect(screen.queryByTestId('sidebarChannelEmoji')).not.toBeInTheDocument();
    });

    test('should render the lock icon for a private channel without an emoji', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon channelType={'P' as ChannelType}/>,
        );

        expect(container.querySelector('.icon-lock-outline')).toBeInTheDocument();
    });

    test('should render the channel emoji in place of the type icon', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon
                channelType={'P' as ChannelType}
                emoji='rocket'
            />,
        );

        expect(screen.getByTestId('sidebarChannelEmoji')).toBeInTheDocument();
        expect(screen.getByLabelText(':rocket:')).toBeInTheDocument();
        expect(container.querySelector('.icon-lock-outline')).not.toBeInTheDocument();
    });

    test('should fall back to the type icon when the emoji is unknown', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon
                channelType={'O' as ChannelType}
                emoji='not_a_real_emoji_name'
            />,
        );

        expect(screen.queryByTestId('sidebarChannelEmoji')).not.toBeInTheDocument();
        expect(container.querySelector('.icon-globe')).toBeInTheDocument();
    });
});
