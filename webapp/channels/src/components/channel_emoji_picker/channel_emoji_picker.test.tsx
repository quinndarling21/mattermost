// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {
    renderWithContext,
    screen,
    userEvent,
} from 'tests/react_testing_utils';

import ChannelEmojiPicker from './channel_emoji_picker';

jest.mock('components/emoji_picker/use_emoji_picker', () => ({
    __esModule: true,
    default: ({
        onEmojiClick,
        showEmojiPicker,
        setShowEmojiPicker,
    }: {
        onEmojiClick: (emoji: {name: string; short_name?: string}) => void;
        showEmojiPicker: boolean;
        setShowEmojiPicker: (show: boolean) => void;
    }) => ({
        emojiPicker: showEmojiPicker ? (
            <>
                <button
                    aria-label='Choose system emoji'
                    onClick={() => onEmojiClick({name: 'Party Popper', short_name: 'tada'})}
                />
                <button
                    aria-label='Choose custom emoji'
                    onClick={() => onEmojiClick({name: 'custom_emoji'})}
                />
            </>
        ) : null,
        getReferenceProps: () => ({
            onClick: () => setShowEmojiPicker(!showEmojiPicker),
        }),
        setReference: jest.fn(),
    }),
}));

describe('ChannelEmojiPicker', () => {
    test('selects and removes a channel emoji', async () => {
        const onChange = jest.fn();
        const {rerender} = renderWithContext(
            <ChannelEmojiPicker
                value=''
                onChange={onChange}
            />,
        );

        await userEvent.click(
            screen.getByRole('button', {name: 'Select channel emoji'}),
        );
        await userEvent.click(
            screen.getByRole('button', {name: 'Choose system emoji'}),
        );
        expect(onChange).toHaveBeenCalledWith('tada');

        await userEvent.click(
            screen.getByRole('button', {name: 'Select channel emoji'}),
        );
        await userEvent.click(
            screen.getByRole('button', {name: 'Choose custom emoji'}),
        );
        expect(onChange).toHaveBeenLastCalledWith('custom_emoji');

        rerender(
            <ChannelEmojiPicker
                value='tada'
                onChange={onChange}
            />,
        );
        await userEvent.click(
            screen.getByRole('button', {name: 'Remove channel emoji'}),
        );
        expect(onChange).toHaveBeenLastCalledWith('');
    });
});
