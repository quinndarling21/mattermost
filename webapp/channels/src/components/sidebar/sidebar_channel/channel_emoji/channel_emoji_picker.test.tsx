// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {ChannelType} from '@mattermost/types/channels';
import type {Emoji} from '@mattermost/types/emojis';

import {savePreferences} from 'mattermost-redux/actions/preferences';

import {renderWithContext, screen, userEvent, waitFor} from 'tests/react_testing_utils';
import {TestHelper} from 'utils/test_helper';

import ChannelEmojiPicker from './channel_emoji_picker';

jest.mock('mattermost-redux/actions/preferences', () => ({
    savePreferences: jest.fn().mockReturnValue({type: 'MOCK_SAVE_PREFERENCES'}),
}));

jest.mock('components/emoji_picker/emoji_picker_tabs', () => {
    return function MockEmojiPickerTabs({onEmojiClick, onEmojiClose}: {onEmojiClick: (emoji: Emoji) => void; onEmojiClose: () => void}) {
        const emoji = {id: 'custom_emoji_id', name: 'parrot', category: 'custom', creator_id: '', create_at: 0, update_at: 0, delete_at: 0} as Emoji;
        return (
            <div>
                <button onClick={() => onEmojiClick(emoji)}>{'mock pick emoji'}</button>
                <button onClick={onEmojiClose}>{'mock close picker'}</button>
            </div>
        );
    };
});

describe('components/sidebar/sidebar_channel/channel_emoji/channel_emoji_picker', () => {
    const channel = TestHelper.getChannelMock({id: 'channel_id', type: 'O' as ChannelType});

    const initialState = {
        entities: {
            users: {
                currentUserId: 'user_id',
            },
        },
    };

    const renderPicker = (setShow = jest.fn()) => {
        const anchor = document.createElement('button');
        document.body.appendChild(anchor);
        const anchorRef = {current: anchor};

        const result = renderWithContext(
            <ChannelEmojiPicker
                channel={channel}
                setShow={setShow}
                anchorRef={anchorRef}
            />,
            initialState,
        );

        return {...result, setShow, anchor};
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should save the preference and close when an emoji is selected', async () => {
        const user = userEvent.setup();
        const {setShow, anchor} = renderPicker();

        await user.click(screen.getByText('mock pick emoji'));

        expect(savePreferences).toHaveBeenCalledWith('user_id', [{
            user_id: 'user_id',
            category: 'channel_emoji',
            name: 'channel_id',
            value: 'parrot',
        }]);
        expect(setShow).toHaveBeenCalledWith(false);

        await waitFor(() => {
            expect(anchor).toHaveFocus();
        });
    });

    test('should close without saving when the picker is dismissed', async () => {
        const user = userEvent.setup();
        const {setShow, anchor} = renderPicker();

        await user.click(screen.getByText('mock close picker'));

        expect(savePreferences).not.toHaveBeenCalled();
        expect(setShow).toHaveBeenCalledWith(false);

        await waitFor(() => {
            expect(anchor).toHaveFocus();
        });
    });

    test('should close without saving on Escape', async () => {
        const user = userEvent.setup();
        const {setShow} = renderPicker();

        await user.keyboard('{Escape}');

        expect(savePreferences).not.toHaveBeenCalled();
        expect(setShow).toHaveBeenCalledWith(false);
    });
});
