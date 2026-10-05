// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import type {Emoji, SystemEmoji} from '@mattermost/types/emojis';

import {Client4} from 'mattermost-redux/client';
import {Preferences} from 'mattermost-redux/constants';

import {act, renderWithContext, screen} from 'tests/react_testing_utils';
import {TestHelper} from 'utils/test_helper';

import ChannelEmojiPicker from './channel_emoji_picker';

const mockPicker = {
    options: null as null | {
        onEmojiClick: (emoji: Emoji) => void;
        setShowEmojiPicker: (show: boolean) => void;
    },
    setReference: jest.fn(),
};

jest.mock('components/emoji_picker/use_emoji_picker', () => {
    const React = require('react');
    return {
        __esModule: true,
        default: (options: NonNullable<typeof mockPicker.options>) => {
            mockPicker.options = options;
            return {
                emojiPicker: React.createElement('div', {'data-testid': 'emoji-picker'}),
                getReferenceProps: () => ({}),
                setReference: mockPicker.setReference,
            };
        },
    };
});

function Harness({anchorRef}: {anchorRef: React.RefObject<HTMLAnchorElement>}) {
    const [show, setShow] = useState(true);
    if (!show) {
        return null;
    }

    return (
        <ChannelEmojiPicker
            channel={TestHelper.getChannelMock({id: 'channel_id'})}
            anchorRef={anchorRef}
            setShow={setShow}
        />
    );
}

describe('ChannelEmojiPicker', () => {
    let anchor: HTMLAnchorElement;
    let anchorRef: React.RefObject<HTMLAnchorElement>;

    beforeEach(() => {
        mockPicker.options = null;
        mockPicker.setReference.mockClear();
        anchor = document.createElement('a');
        anchor.tabIndex = 0;
        document.body.appendChild(anchor);
        anchorRef = {current: anchor};
        jest.spyOn(Client4, 'savePreferences').mockResolvedValue({status: 'OK'});
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            callback(0);
            return 1;
        });
    });

    afterEach(() => {
        anchor.remove();
        jest.restoreAllMocks();
    });

    test('anchors the picker to the channel row', () => {
        renderWithContext(
            <Harness anchorRef={anchorRef}/>,
            {entities: {users: {currentUserId: 'user_id'}}},
        );

        expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
        expect(mockPicker.setReference).toHaveBeenCalledWith(anchor);
    });

    test('saves the selected emoji and restores focus to the channel row', async () => {
        const focus = jest.spyOn(anchor, 'focus');
        const {store} = renderWithContext(
            <Harness anchorRef={anchorRef}/>,
            {entities: {users: {currentUserId: 'user_id'}}},
        );

        const emoji = {
            name: 'smile',
            short_name: 'smile',
            short_names: ['smile'],
            category: 'smileys-emotion',
            unified: '1f642',
        } as SystemEmoji;

        act(() => {
            mockPicker.options?.onEmojiClick(emoji);
        });

        expect(store.getState().entities.preferences.myPreferences[`${Preferences.CATEGORY_CHANNEL_EMOJI}--channel_id`].value).toBe('smile');
        expect(screen.queryByTestId('emoji-picker')).not.toBeInTheDocument();
        expect(focus).toHaveBeenCalled();
    });

    test('restores focus when the picker is dismissed', () => {
        const focus = jest.spyOn(anchor, 'focus');
        renderWithContext(<Harness anchorRef={anchorRef}/>);

        act(() => {
            mockPicker.options?.setShowEmojiPicker(false);
        });

        expect(screen.queryByTestId('emoji-picker')).not.toBeInTheDocument();
        expect(focus).toHaveBeenCalled();
    });
});
