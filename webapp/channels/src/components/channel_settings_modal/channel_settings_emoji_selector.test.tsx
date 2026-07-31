// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {Emoji} from '@mattermost/types/emojis';

import {renderWithContext, screen, userEvent} from 'tests/react_testing_utils';

import ChannelSettingsEmojiSelector from './channel_settings_emoji_selector';

let capturedOnEmojiClick: ((emoji: Emoji) => void) | undefined;

jest.mock('components/emoji/render_emoji', () => {
    const React = require('react');
    return ({emojiName}: {emojiName: string}) => (
        <span data-testid='render-emoji'>{emojiName}</span>
    );
});

jest.mock('components/emoji_picker/use_emoji_picker', () => {
    return {
        __esModule: true,
        default: ({onEmojiClick}: {onEmojiClick: (emoji: Emoji) => void}) => {
            capturedOnEmojiClick = onEmojiClick;
            return {
                emojiPicker: null,
                getReferenceProps: () => ({}),
                setReference: () => {},
            };
        },
    };
});

describe('components/channel_settings_modal/ChannelSettingsEmojiSelector', () => {
    beforeEach(() => {
        capturedOnEmojiClick = undefined;
    });

    test('renders label and description', () => {
        renderWithContext(
            <ChannelSettingsEmojiSelector onChange={jest.fn()}/>,
        );

        expect(screen.getByText('Channel icon emoji')).toBeInTheDocument();
        expect(screen.getByText(/Show a custom emoji instead of the default icon/)).toBeInTheDocument();
    });

    test('shows the current emoji and a remove button when a value is set', () => {
        renderWithContext(
            <ChannelSettingsEmojiSelector
                value='rocket'
                onChange={jest.fn()}
            />,
        );

        expect(screen.getByTestId('render-emoji')).toHaveTextContent('rocket');
        expect(screen.getByText('Remove emoji')).toBeInTheDocument();
    });

    test('does not show a remove button when no value is set', () => {
        renderWithContext(
            <ChannelSettingsEmojiSelector onChange={jest.fn()}/>,
        );

        expect(screen.queryByText('Remove emoji')).not.toBeInTheDocument();
    });

    test('calls onChange with the selected emoji short name', () => {
        const onChange = jest.fn();
        renderWithContext(
            <ChannelSettingsEmojiSelector onChange={onChange}/>,
        );

        capturedOnEmojiClick?.({short_name: 'tada'} as Emoji);
        expect(onChange).toHaveBeenCalledWith('tada');
    });

    test('calls onChange with empty string when the emoji is removed', async () => {
        const onChange = jest.fn();
        renderWithContext(
            <ChannelSettingsEmojiSelector
                value='rocket'
                onChange={onChange}
            />,
        );

        await userEvent.click(screen.getByText('Remove emoji'));
        expect(onChange).toHaveBeenCalledWith('');
    });

    test('disables the picker button and hides the remove button when disabled', () => {
        renderWithContext(
            <ChannelSettingsEmojiSelector
                value='rocket'
                onChange={jest.fn()}
                disabled={true}
            />,
        );

        expect(screen.getByRole('button', {name: 'Select a channel emoji'})).toBeDisabled();
        expect(screen.queryByText('Remove emoji')).not.toBeInTheDocument();
    });
});
