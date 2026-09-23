// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {Emoji} from '@mattermost/types/emojis';

import {renderWithContext, screen, userEvent} from 'tests/react_testing_utils';
import {TestHelper} from 'utils/test_helper';

import ChannelEmojiField from './channel_emoji_field';

const mockSystemEmoji = TestHelper.getSystemEmojiMock({
    name: 'rocket',
    short_name: 'rocket',
    short_names: ['rocket'],
    unified: '1F680',
    category: 'travel-places',
});

const mockCustomEmoji = TestHelper.getCustomEmojiMock({
    id: 'custom_emoji_id',
    name: 'team-logo',
    category: 'custom',
});

jest.mock('components/emoji_picker/use_emoji_picker', () => ({
    __esModule: true,
    default: ({showEmojiPicker, setShowEmojiPicker, onEmojiClick}: {
        showEmojiPicker: boolean;
        setShowEmojiPicker: (show: boolean) => void;
        onEmojiClick: (emoji: Emoji) => void;
    }) => ({
        emojiPicker: showEmojiPicker ? (
            <div data-testid='mockEmojiPicker'>
                <button onClick={() => onEmojiClick(mockSystemEmoji)}>{'Pick rocket'}</button>
                <button onClick={() => onEmojiClick(mockCustomEmoji)}>{'Pick team-logo'}</button>
            </div>
        ) : null,
        getReferenceProps: () => ({onClick: () => setShowEmojiPicker(!showEmojiPicker)}),
        setReference: jest.fn(),
    }),
}));

describe('ChannelEmojiField', () => {
    it('should prompt to choose an emoji when none is set', () => {
        renderWithContext(
            <ChannelEmojiField
                value=''
                onChange={jest.fn()}
            />,
        );

        expect(screen.getByText('Channel emoji (optional)')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Choose emoji'})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: 'Remove emoji'})).not.toBeInTheDocument();
        expect(screen.getByText('Appears next to the channel name in the sidebar for all channel members.')).toBeInTheDocument();
    });

    it('should show the current emoji with change and remove actions', () => {
        const {container} = renderWithContext(
            <ChannelEmojiField
                value='rocket'
                onChange={jest.fn()}
            />,
        );

        expect(screen.getByRole('button', {name: /Change emoji/})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Remove emoji'})).toBeInTheDocument();
        expect(container.querySelector('[data-emoticon="rocket"]')).toBeInTheDocument();
    });

    it('should emit the bare system emoji name and close the picker when an emoji is picked', async () => {
        const onChange = jest.fn();
        renderWithContext(
            <ChannelEmojiField
                value=''
                onChange={onChange}
            />,
        );

        await userEvent.click(screen.getByRole('button', {name: 'Choose emoji'}));
        await userEvent.click(screen.getByRole('button', {name: 'Pick rocket'}));

        expect(onChange).toHaveBeenCalledWith('rocket');
        expect(screen.queryByTestId('mockEmojiPicker')).not.toBeInTheDocument();
    });

    it('should emit the custom emoji name when a custom emoji is picked', async () => {
        const onChange = jest.fn();
        renderWithContext(
            <ChannelEmojiField
                value=''
                onChange={onChange}
            />,
        );

        await userEvent.click(screen.getByRole('button', {name: 'Choose emoji'}));
        await userEvent.click(screen.getByRole('button', {name: 'Pick team-logo'}));

        expect(onChange).toHaveBeenCalledWith('team-logo');
    });

    it('should clear the emoji when remove is clicked', async () => {
        const onChange = jest.fn();
        renderWithContext(
            <ChannelEmojiField
                value='rocket'
                onChange={onChange}
            />,
        );

        await userEvent.click(screen.getByRole('button', {name: 'Remove emoji'}));

        expect(onChange).toHaveBeenCalledWith('');
    });

    it('should not allow changes when disabled', () => {
        renderWithContext(
            <ChannelEmojiField
                value='rocket'
                onChange={jest.fn()}
                disabled={true}
            />,
        );

        expect(screen.getByRole('button', {name: /Change emoji/})).toBeDisabled();
        expect(screen.queryByRole('button', {name: 'Remove emoji'})).not.toBeInTheDocument();
    });
});
