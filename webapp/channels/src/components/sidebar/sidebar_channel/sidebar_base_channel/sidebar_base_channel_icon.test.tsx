// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {ChannelType} from '@mattermost/types/channels';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import SidebarBaseChannelIcon from './sidebar_base_channel_icon';

describe('components/sidebar/sidebar_channel/sidebar_base_channel/sidebar_base_channel_icon', () => {
    test('should render globe icon for public channels', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon channelType={'O' as ChannelType}/>,
        );

        expect(container.querySelector('.icon-globe')).toBeInTheDocument();
        expect(screen.queryByLabelText(':rocket:')).not.toBeInTheDocument();
    });

    test('should render lock icon for private channels', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon channelType={'P' as ChannelType}/>,
        );

        expect(container.querySelector('.icon-lock-outline')).toBeInTheDocument();
    });

    test('should render the channel emoji instead of the type icon when set', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon
                channelType={'O' as ChannelType}
                emoji='rocket'
            />,
        );

        expect(container.querySelector('.icon-globe')).not.toBeInTheDocument();
        expect(screen.getByLabelText(':rocket:')).toBeInTheDocument();
    });

    test('should render the channel emoji instead of the lock icon on private channels', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon
                channelType={'P' as ChannelType}
                emoji='rocket'
            />,
        );

        expect(container.querySelector('.icon-lock-outline')).not.toBeInTheDocument();
        expect(screen.getByLabelText(':rocket:')).toBeInTheDocument();
    });

    test('should strip surrounding colons from the stored emoji name', () => {
        renderWithContext(
            <SidebarBaseChannelIcon
                channelType={'P' as ChannelType}
                emoji=':smile:'
            />,
        );

        expect(screen.getByLabelText(':smile:')).toBeInTheDocument();
    });
});
