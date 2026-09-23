// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {EmoticonPlusOutlineIcon} from '@mattermost/compass-icons/components';
import {Button} from '@mattermost/shared/components/button';
import type {Emoji} from '@mattermost/types/emojis';

import {getEmojiName} from 'mattermost-redux/utils/emoji_utils';

import RenderEmoji from 'components/emoji/render_emoji';
import useEmojiPicker from 'components/emoji_picker/use_emoji_picker';

import './channel_emoji_field.scss';

type Props = {

    /** Emoji name without surrounding colons, or an empty string when no emoji is set. */
    value: string;
    onChange: (emojiName: string) => void;
    disabled?: boolean;
};

export default function ChannelEmojiField({value, onChange, disabled}: Props) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleEmojiClick = useCallback((emoji: Emoji) => {
        setShowEmojiPicker(false);
        onChange(getEmojiName(emoji));
    }, [onChange]);

    const handleRemove = useCallback(() => {
        onChange('');
    }, [onChange]);

    const {emojiPicker, getReferenceProps, setReference} = useEmojiPicker({
        showEmojiPicker,
        setShowEmojiPicker,
        onEmojiClick: handleEmojiClick,
    });

    return (
        <div className='ChannelEmojiField'>
            <span
                id='channelEmojiFieldLabel'
                className='ChannelEmojiField__label'
            >
                <FormattedMessage
                    id='channel_settings.emoji.label'
                    defaultMessage='Channel emoji (optional)'
                />
            </span>
            <div className='ChannelEmojiField__controls'>
                <Button
                    ref={setReference}
                    type='button'
                    emphasis='tertiary'
                    className='ChannelEmojiField__pickerButton'
                    aria-describedby='channelEmojiFieldLabel'
                    data-testid='channelEmojiPickerButton'
                    disabled={disabled}
                    {...getReferenceProps()}
                >
                    {value ? (
                        <RenderEmoji
                            emojiName={value}
                            size={20}
                        />
                    ) : (
                        <EmoticonPlusOutlineIcon size={18}/>
                    )}
                    {value ? (
                        <FormattedMessage
                            id='channel_settings.emoji.change'
                            defaultMessage='Change emoji'
                        />
                    ) : (
                        <FormattedMessage
                            id='channel_settings.emoji.choose'
                            defaultMessage='Choose emoji'
                        />
                    )}
                </Button>
                {value && !disabled && (
                    <Button
                        type='button'
                        emphasis='quaternary'
                        onClick={handleRemove}
                        data-testid='channelEmojiRemoveButton'
                    >
                        <FormattedMessage
                            id='channel_settings.emoji.remove'
                            defaultMessage='Remove emoji'
                        />
                    </Button>
                )}
            </div>
            <div className='Input___customMessage Input___info'>
                <span>
                    <FormattedMessage
                        id='channel_settings.emoji.help'
                        defaultMessage='Appears next to the channel name in the sidebar for all channel members.'
                    />
                </span>
            </div>
            {emojiPicker}
        </div>
    );
}
