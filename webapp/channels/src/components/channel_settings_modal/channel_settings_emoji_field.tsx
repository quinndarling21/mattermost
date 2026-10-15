// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';
import {useIntl} from 'react-intl';

import {Button} from '@mattermost/shared/components/button';
import type {Emoji} from '@mattermost/types/emojis';

import RenderEmoji from 'components/emoji/render_emoji';
import useEmojiPicker from 'components/emoji_picker/use_emoji_picker';

import './channel_settings_emoji_field.scss';

type Props = {
    emoji: string;
    onChange: (emoji: string) => void;
    disabled?: boolean;
};

export default function ChannelSettingsEmojiField({emoji, onChange, disabled}: Props) {
    const {formatMessage} = useIntl();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleEmojiClick = useCallback((selected: Emoji) => {
        setShowEmojiPicker(false);
        onChange('short_name' in selected ? selected.short_name : selected.name);
    }, [onChange]);

    const handleRemove = useCallback(() => onChange(''), [onChange]);

    const toggleEmojiPicker = useCallback(() => setShowEmojiPicker((prev) => !prev), []);

    const {emojiPicker, getReferenceProps, setReference} = useEmojiPicker({
        showEmojiPicker,
        setShowEmojiPicker,
        onEmojiClick: handleEmojiClick,
    });

    return (
        <div className='ChannelSettingsEmojiField'>
            <div className='ChannelSettingsEmojiField__label'>
                {formatMessage({id: 'channel_settings.emoji.label', defaultMessage: 'Channel emoji (optional)'})}
            </div>
            <div className='ChannelSettingsEmojiField__controls'>
                <Button
                    ref={setReference}
                    type='button'
                    emphasis='tertiary'
                    size='sm'
                    onClick={toggleEmojiPicker}
                    disabled={disabled}
                    data-testid='channelSettingsEmojiButton'
                    {...getReferenceProps()}
                >
                    {emoji ? (
                        <RenderEmoji
                            emojiName={emoji}
                            size={16}
                        />
                    ) : (
                        <i className='icon icon-emoticon-plus-outline'/>
                    )}
                    {emoji ? formatMessage({id: 'channel_settings.emoji.change', defaultMessage: 'Change emoji'}) : formatMessage({id: 'channel_settings.emoji.add', defaultMessage: 'Add emoji'})}
                </Button>
                {emoji && !disabled && (
                    <Button
                        type='button'
                        emphasis='quaternary'
                        size='sm'
                        onClick={handleRemove}
                        data-testid='channelSettingsEmojiRemove'
                    >
                        {formatMessage({id: 'channel_settings.emoji.remove', defaultMessage: 'Remove emoji'})}
                    </Button>
                )}
                {emojiPicker}
            </div>
            <div className='Input___customMessage Input___info'>
                <span>{formatMessage({id: 'channel_settings.emoji.help_text', defaultMessage: 'Appears next to the channel name in the sidebar.'})}</span>
            </div>
        </div>
    );
}
