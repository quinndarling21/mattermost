// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useId, useRef, useState} from 'react';
import {useIntl} from 'react-intl';

import {CloseIcon, EmoticonPlusOutlineIcon} from '@mattermost/compass-icons/components';
import {WithTooltip} from '@mattermost/shared/components/tooltip';
import type {Emoji} from '@mattermost/types/emojis';

import RenderEmoji from 'components/emoji/render_emoji';
import useEmojiPicker from 'components/emoji_picker/use_emoji_picker';

import './channel_emoji_picker.scss';

type Props = {
    value?: string;
    onChange: (emoji: string) => void;
    disabled?: boolean;
};

const ChannelEmojiPicker = ({
    value = '',
    onChange,
    disabled = false,
}: Props) => {
    const {formatMessage} = useIntl();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const id = useId();
    const buttonId = `${id}-button`;
    const helpId = `${id}-help`;
    const selectLabel = value ? formatMessage({
        id: 'channel_emoji_picker.change',
        defaultMessage: 'Change channel emoji',
    }) : formatMessage({
        id: 'channel_emoji_picker.select',
        defaultMessage: 'Select channel emoji',
    });
    const removeLabel = formatMessage({
        id: 'channel_emoji_picker.remove',
        defaultMessage: 'Remove channel emoji',
    });

    const handleEmojiClick = (selectedEmoji: Emoji) => {
        const emojiName =
            'short_name' in selectedEmoji ? selectedEmoji.short_name : selectedEmoji.name;
        onChange(emojiName);
        setShowEmojiPicker(false);
        buttonRef.current?.focus();
    };

    const {emojiPicker, getReferenceProps, setReference} = useEmojiPicker({
        showEmojiPicker,
        setShowEmojiPicker,
        onEmojiClick: handleEmojiClick,
    });

    return (
        <div className='ChannelEmojiPicker'>
            <label
                className='ChannelEmojiPicker__label'
                htmlFor={buttonId}
            >
                {formatMessage({
                    id: 'channel_emoji_picker.label',
                    defaultMessage: 'Channel emoji',
                })}
            </label>
            <div className='ChannelEmojiPicker__controls'>
                <WithTooltip
                    title={selectLabel}
                >
                    <button
                        ref={(node) => {
                            buttonRef.current = node;
                            setReference(node);
                        }}
                        id={buttonId}
                        type='button'
                        className='ChannelEmojiPicker__button'
                        disabled={disabled}
                        aria-label={selectLabel}
                        aria-describedby={helpId}
                        {...getReferenceProps()}
                    >
                        {value ? (
                            <RenderEmoji
                                emojiName={value}
                                size={24}
                            />
                        ) : (
                            <EmoticonPlusOutlineIcon size={20}/>
                        )}
                    </button>
                </WithTooltip>
                {value && (
                    <WithTooltip
                        title={removeLabel}
                    >
                        <button
                            type='button'
                            className='ChannelEmojiPicker__clear'
                            onClick={() => onChange('')}
                            disabled={disabled}
                            aria-label={removeLabel}
                        >
                            <CloseIcon size={16}/>
                        </button>
                    </WithTooltip>
                )}
                {emojiPicker}
            </div>
            <span
                id={helpId}
                className='ChannelEmojiPicker__help'
            >
                {formatMessage({
                    id: 'channel_emoji_picker.help',
                    defaultMessage: 'Shown next to the channel in the sidebar.',
                })}
            </span>
        </div>
    );
};

export default ChannelEmojiPicker;
