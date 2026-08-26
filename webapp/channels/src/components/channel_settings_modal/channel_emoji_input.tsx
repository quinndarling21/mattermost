// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {EmoticonHappyOutlineIcon} from '@mattermost/compass-icons/components';
import {Button} from '@mattermost/shared/components/button';
import type {Emoji} from '@mattermost/types/emojis';

import RenderEmoji from 'components/emoji/render_emoji';
import useEmojiPicker from 'components/emoji_picker/use_emoji_picker';

import {trimmedEmojiName} from 'utils/emoji_utils';

import './channel_emoji_input.scss';

type Props = {
    emoji: string;
    onChange: (emoji: string) => void;
    disabled?: boolean;
};

export default function ChannelEmojiInput({
    emoji,
    onChange,
    disabled = false,
}: Props) {
    const {formatMessage} = useIntl();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiName = trimmedEmojiName(emoji);
    const labelId = 'channel-emoji-label';
    const helpId = 'channel-emoji-help';

    const handleEmojiClick = (selectedEmoji: Emoji) => {
        setShowEmojiPicker(false);
        const name = ('short_name' in selectedEmoji) ? selectedEmoji.short_name : selectedEmoji.name;
        onChange(name);
    };

    const {
        emojiPicker,
        getReferenceProps,
        setReference,
    } = useEmojiPicker({
        showEmojiPicker,
        setShowEmojiPicker,
        onEmojiClick: handleEmojiClick,
    });

    return (
        <div className='ChannelEmojiInput'>
            <label
                id={labelId}
                className='ChannelEmojiInput__label'
                htmlFor='channel-emoji-button'
            >
                <FormattedMessage
                    id='channel_settings.emoji.label'
                    defaultMessage='Channel emoji'
                />
            </label>
            <div className='ChannelEmojiInput__controls'>
                <button
                    id='channel-emoji-button'
                    ref={setReference}
                    type='button'
                    className={classNames('ChannelEmojiInput__button', {active: showEmojiPicker})}
                    data-testid='channel-emoji-button'
                    disabled={disabled}
                    aria-describedby={helpId}
                    aria-expanded={showEmojiPicker}
                    aria-haspopup='dialog'
                    aria-label={emojiName ? formatMessage({id: 'channel_settings.emoji.button.selected.ariaLabel', defaultMessage: 'Channel emoji, {emoji}'}, {emoji: emojiName}) : formatMessage({id: 'channel_settings.emoji.button.ariaLabel', defaultMessage: 'Select a channel emoji'})}
                    {...(disabled ? {} : getReferenceProps())}
                >
                    {emojiName ? (
                        <RenderEmoji
                            emojiName={emojiName}
                            size={20}
                        />
                    ) : (
                        <EmoticonHappyOutlineIcon
                            color='currentColor'
                            size={18}
                        />
                    )}
                </button>
                {emojiPicker}
                {emojiName && (
                    <Button
                        type='button'
                        emphasis='tertiary'
                        size='sm'
                        data-testid='channel-emoji-remove'
                        disabled={disabled}
                        onClick={() => onChange('')}
                    >
                        <FormattedMessage
                            id='channel_settings.emoji.remove'
                            defaultMessage='Remove emoji'
                        />
                    </Button>
                )}
            </div>
            <div
                id={helpId}
                className='ChannelEmojiInput__help'
            >
                <FormattedMessage
                    id='channel_settings.emoji.help'
                    defaultMessage='Shown next to the channel name in the sidebar and channel header.'
                />
            </div>
        </div>
    );
}
