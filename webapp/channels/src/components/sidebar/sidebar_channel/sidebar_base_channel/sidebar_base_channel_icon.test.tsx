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
        <span
            className='emoticon'
            data-emoticon={emojiName}
        />
    ),
}));

function renderIcon(ui: React.ReactElement) {
    const store = configureStore();
    return render(
        <Provider store={store}>
            {ui}
        </Provider>,
    );
}

describe('SidebarBaseChannelIcon', () => {
    test('renders the channel emoji instead of the channel type icon', () => {
        const {container} = renderIcon(
            <SidebarBaseChannelIcon
                channelType={'O' as ChannelType}
                emoji='tada'
            />,
        );

        expect(container.querySelector('[data-emoticon="tada"]')).toBeInTheDocument();
        expect(container.querySelector('.SidebarBaseChannelIcon')).toBeInTheDocument();
        expect(container.querySelector('.icon-globe')).not.toBeInTheDocument();
        expect(container.querySelector('.SidebarBaseChannelIcon__fallback')).not.toBeInTheDocument();
    });

    test('falls back to the channel type icon when the emoji name is unknown', () => {
        const {container} = renderIcon(
            <SidebarBaseChannelIcon
                channelType={'O' as ChannelType}
                emoji='not_a_real_emoji'
            />,
        );

        expect(container.querySelector('[data-emoticon]')).not.toBeInTheDocument();
        expect(container.querySelector('.SidebarBaseChannelIcon')).not.toBeInTheDocument();
        expect(container.querySelector('.icon-globe')).toBeInTheDocument();
    });

    test('renders the channel type icon when no emoji is assigned', () => {
        const {container} = renderIcon(
            <SidebarBaseChannelIcon channelType={'P' as ChannelType}/>,
        );

        expect(
            container.querySelector('.icon-lock-outline'),
        ).toBeInTheDocument();
        expect(container.querySelector('.SidebarBaseChannelIcon')).not.toBeInTheDocument();
    });
});
