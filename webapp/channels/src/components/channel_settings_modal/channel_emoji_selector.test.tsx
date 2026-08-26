// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlProvider} from 'react-intl';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ChannelEmojiSelector from './channel_emoji_selector';

jest.mock('components/emoji_picker/use_emoji_picker', () => ({
    __esModule: true,
    default: ({onEmojiClick}: {onEmojiClick: (emoji: {name: string}) => void}) => ({
        emojiPicker: (
            <button
                data-testid='mock-emoji-picker'
                onClick={() => onEmojiClick({name: 'rocket'})}
            >
                {'Pick'}
            </button>
        ),
        getReferenceProps: () => ({}),
        setReference: jest.fn(),
    }),
}));

jest.mock('components/emoji/render_emoji', () => ({
    __esModule: true,
    default: ({emojiName}: {emojiName: string}) => (
        <span data-testid='render-emoji'>{emojiName}</span>
    ),
}));

function renderSelector(ui: React.ReactElement) {
    return render(
        <IntlProvider locale='en'>
            {ui}
        </IntlProvider>,
    );
}

describe('ChannelEmojiSelector', () => {
    test('calls onChange when an emoji is selected', async () => {
        const onChange = jest.fn();

        renderSelector(
            <ChannelEmojiSelector
                emoji=''
                onChange={onChange}
            />,
        );

        await userEvent.click(screen.getByTestId('mock-emoji-picker'));

        expect(onChange).toHaveBeenCalledWith('rocket');
    });

    test('clears the emoji when remove is clicked', async () => {
        const onChange = jest.fn();

        renderSelector(
            <ChannelEmojiSelector
                emoji=':smile:'
                onChange={onChange}
            />,
        );

        expect(screen.getByTestId('render-emoji')).toHaveTextContent('smile');

        await userEvent.click(screen.getByText('Remove emoji'));

        expect(onChange).toHaveBeenCalledWith('');
    });
});
