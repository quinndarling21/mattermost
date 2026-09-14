// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Provider} from 'react-redux';

import type {ChannelType} from '@mattermost/types/channels';

import configureStore from 'store';

import {render} from 'tests/react_testing_utils';

import SidebarBaseChannelIcon from './sidebar_base_channel_icon';

jest.mock('components/emoji/render_emoji', () => ({
    __esModule: true,
    default: ({emojiName}: {emojiName: string}) => (
        <span data-emoticon={emojiName}/>
    ),
}));

function renderIcon(ui: React.ReactElement) {
    return render(
        <Provider store={configureStore()}>
            {ui}
        </Provider>,
    );
}

describe('SidebarBaseChannelIcon', () => {
    test('renders a known emoji instead of the channel type icon', () => {
        const {container} = renderIcon(
            <SidebarBaseChannelIcon
                channelType={'O' as ChannelType}
                emoji='tada'
            />,
        );

        expect(container.querySelector('[data-emoticon="tada"]')).toBeInTheDocument();
        expect(container.querySelector('.icon-globe')).not.toBeInTheDocument();
    });

    test('falls back to the channel type icon for an unknown emoji', () => {
        const {container} = renderIcon(
            <SidebarBaseChannelIcon
                channelType={'O' as ChannelType}
                emoji='not_a_real_emoji'
            />,
        );

        expect(container.querySelector('[data-emoticon]')).not.toBeInTheDocument();
        expect(container.querySelector('.icon-globe')).toBeInTheDocument();
    });

    test('renders the channel type icon when no emoji is assigned', () => {
        const {container} = renderIcon(
            <SidebarBaseChannelIcon channelType={'P' as ChannelType}/>,
        );

        expect(container.querySelector('.icon-lock-outline')).toBeInTheDocument();
    });
});
