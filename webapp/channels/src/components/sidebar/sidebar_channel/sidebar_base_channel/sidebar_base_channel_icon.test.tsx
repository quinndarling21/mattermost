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
