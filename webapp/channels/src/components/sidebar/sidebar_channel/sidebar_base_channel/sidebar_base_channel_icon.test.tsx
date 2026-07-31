// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import SidebarBaseChannelIcon from 'components/sidebar/sidebar_channel/sidebar_base_channel/sidebar_base_channel_icon';

import {renderWithContext} from 'tests/react_testing_utils';
import Constants from 'utils/constants';

describe('components/sidebar/sidebar_channel/sidebar_base_channel/sidebar_base_channel_icon', () => {
    test('should render globe icon for public channel without custom emoji', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon channelType={Constants.OPEN_CHANNEL}/>,
        );

        expect(container.querySelector('.icon-globe')).toBeInTheDocument();
    });

    test('should render lock icon for private channel without custom emoji', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon channelType={Constants.PRIVATE_CHANNEL}/>,
        );

        expect(container.querySelector('.icon-lock-outline')).toBeInTheDocument();
    });

    test('should render custom emoji when sidebar emoji is set', () => {
        const {container} = renderWithContext(
            <SidebarBaseChannelIcon
                channelType={Constants.OPEN_CHANNEL}
                sidebarEmoji='rocket'
            />,
        );

        expect(container.querySelector('.icon-globe')).not.toBeInTheDocument();
        expect(container.querySelector('.emoticon')).toBeInTheDocument();
    });
});
