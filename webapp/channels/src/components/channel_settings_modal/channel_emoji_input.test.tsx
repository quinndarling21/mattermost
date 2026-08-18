// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {renderWithContext, screen, userEvent} from 'tests/react_testing_utils';

import ChannelEmojiInput from './channel_emoji_input';

jest.mock('components/emoji_picker/use_emoji_picker', () => ({
    __esModule: true,
    default: ({
        onEmojiClick,
        showEmojiPicker,
        setShowEmojiPicker,
    }: {
        onEmojiClick: (emoji: {short_name: string}) => void;
        showEmojiPicker: boolean;
        setShowEmojiPicker: (show: boolean) => void;
    }) => ({
        emojiPicker: showEmojiPicker ? (
            <button
                type='button'
                data-testid='mock-emoji-option'
                onClick={() => onEmojiClick({short_name: 'rocket'})}
            >
                {'rocket'}
            </button>
        ) : null,
        getReferenceProps: () => ({
            onClick: () => setShowEmojiPicker(true),
        }),
        setReference: jest.fn(),
    }),
}));

describe('components/channel_settings_modal/channel_emoji_input', () => {
    test('should show the placeholder icon when no emoji is set', () => {
        renderWithContext(
            <ChannelEmojiInput
                emoji=''
                onChange={jest.fn()}
            />,
        );

        expect(screen.getByTestId('channel-emoji-button')).toBeInTheDocument();
        expect(screen.queryByTestId('channel-emoji-remove')).not.toBeInTheDocument();
        expect(screen.queryByLabelText(':smile:')).not.toBeInTheDocument();
    });

    test('should show the current emoji and a remove action', () => {
        renderWithContext(
            <ChannelEmojiInput
                emoji='smile'
                onChange={jest.fn()}
            />,
        );

        expect(screen.getByLabelText(':smile:')).toBeInTheDocument();
        expect(screen.getByTestId('channel-emoji-remove')).toBeInTheDocument();
    });

    test('should call onChange with an empty string when remove is clicked', async () => {
        const onChange = jest.fn();

        renderWithContext(
            <ChannelEmojiInput
                emoji='smile'
                onChange={onChange}
            />,
        );

        await userEvent.click(screen.getByTestId('channel-emoji-remove'));
        expect(onChange).toHaveBeenCalledWith('');
    });

    test('should call onChange with the selected emoji', async () => {
        const onChange = jest.fn();

        renderWithContext(
            <ChannelEmojiInput
                emoji=''
                onChange={onChange}
            />,
        );

        await userEvent.click(screen.getByTestId('channel-emoji-button'));
        await userEvent.click(screen.getByTestId('mock-emoji-option'));
        expect(onChange).toHaveBeenCalledWith('rocket');
    });
});
