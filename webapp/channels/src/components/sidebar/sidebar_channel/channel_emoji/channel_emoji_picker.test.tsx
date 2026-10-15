// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {savePreferences} from 'mattermost-redux/actions/preferences';

import {renderWithContext, screen, userEvent} from 'tests/react_testing_utils';

import ChannelEmojiPicker from './channel_emoji_picker';
import {makeChannelEmojiPreference} from './utils';

jest.mock('mattermost-redux/actions/preferences', () => ({
    ...jest.requireActual('mattermost-redux/actions/preferences'),
    savePreferences: jest.fn(() => ({type: 'MOCK_SAVE_PREFERENCES'})),
}));

describe('components/sidebar/sidebar_channel/channel_emoji/channel_emoji_picker', () => {
    const userId = 'user_id';
    const channelId = 'channel_id';
    const anchorId = 'sidebarItem_channel';

    const initialState = {
        entities: {
            users: {currentUserId: userId},
        },
    };

    function TestHarness({onRowClick}: {onRowClick: () => void}) {
        const [show, setShow] = useState(true);

        return (
            <a
                id={anchorId}
                href='/team/channels/channel'
                onClick={onRowClick}
            >
                <ChannelEmojiPicker
                    channelId={channelId}
                    anchorId={anchorId}
                    show={show}
                    setShow={setShow}
                />
            </a>
        );
    }

    test('saves the selected emoji as a channel_emoji preference and closes the picker', async () => {
        const onRowClick = jest.fn();
        renderWithContext(<TestHarness onRowClick={onRowClick}/>, initialState);

        expect(screen.getByText('Emoji Picker')).toBeVisible();

        // The picker doesn't render emoji items in tests, so select one through search.
        await userEvent.type(screen.getByPlaceholderText('Search emojis'), 'banana{enter}');

        expect(savePreferences).toHaveBeenCalledWith(userId, [makeChannelEmojiPreference(userId, channelId, 'banana')]);
        expect(screen.queryByText('Emoji Picker')).not.toBeInTheDocument();
    });

    test('does not let clicks inside the picker reach the sidebar row', async () => {
        const onRowClick = jest.fn();
        renderWithContext(<TestHarness onRowClick={onRowClick}/>, initialState);

        await userEvent.click(screen.getByPlaceholderText('Search emojis'));

        expect(onRowClick).not.toHaveBeenCalled();
        expect(screen.getByText('Emoji Picker')).toBeVisible();
    });

    test('closes without saving when dismissed with Escape', async () => {
        renderWithContext(<TestHarness onRowClick={jest.fn()}/>, initialState);

        await userEvent.keyboard('{Escape}');

        expect(screen.queryByText('Emoji Picker')).not.toBeInTheDocument();
        expect(savePreferences).not.toHaveBeenCalled();
    });

    afterEach(() => {
        jest.mocked(savePreferences).mockClear();
    });
});
