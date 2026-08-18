// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {ChannelType} from '@mattermost/types/channels';

import {renderWithContext} from 'tests/react_testing_utils';

import SidebarBaseChannelIcon from './sidebar_base_channel_icon';

describe('SidebarBaseChannelIcon', () => {
    test('renders the channel emoji instead of the channel type icon', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon
                channelType={'O' as ChannelType}
                emoji='tada'
            />,
        );

        expect(container.querySelector('[data-emoticon="tada"]')).toBeInTheDocument();
        expect(container.querySelector('.SidebarBaseChannelIcon')).toBeInTheDocument();
        expect(container.querySelector('.SidebarBaseChannelIcon__fallback .icon-globe')).toBeInTheDocument();
    });

    test('falls back to the channel type icon when the emoji name is unknown', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon
                channelType={'O' as ChannelType}
                emoji='not_a_real_emoji'
            />,
        );

        expect(container.querySelector('[data-emoticon]')).not.toBeInTheDocument();
        expect(container.querySelector('.icon-globe')).toBeInTheDocument();
    });

    test('renders the channel type icon when no emoji is assigned', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon channelType={'P' as ChannelType}/>,
        );

        expect(
            container.querySelector('.icon-lock-outline'),
        ).toBeInTheDocument();
    });
});
