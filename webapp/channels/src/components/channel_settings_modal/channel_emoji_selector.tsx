// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {ChevronDownIcon, GlobeIcon, LockOutlineIcon} from '@mattermost/compass-icons/components';
import type {Emoji} from '@mattermost/types/emojis';

import useEmojiPicker from 'components/emoji_picker/use_emoji_picker';
import RenderEmoji from 'components/emoji/render_emoji';

import Constants from 'utils/constants';
import {trimmedEmojiName} from 'utils/emoji_utils';

import './channel_emoji_selector.scss';

type Props = {
    emoji: string;
    onChange: (emoji: string) => void;
    disabled?: boolean;
    channelType: string;
};

const ChannelEmojiSelector = ({
    emoji,
    onChange,
    disabled = false,
    channelType,
}: Props) => {
    const {formatMessage} = useIntl();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const emojiName = emoji ? trimmedEmojiName(emoji) : '';

    const handleEmojiClick = useCallback((selectedEmoji: Emoji) => {
        setShowEmojiPicker(false);
        const name = ('short_name' in selectedEmoji) ? selectedEmoji.short_name : selectedEmoji.name;
        onChange(`:${name}:`);
    }, [onChange]);

    const handleClear = useCallback(() => {
        onChange('');
    }, [onChange]);

    const {
        emojiPicker,
        getReferenceProps,
        setReference,
    } = useEmojiPicker({
        showEmojiPicker,
        setShowEmojiPicker,
        onEmojiClick: handleEmojiClick,
    });

    const defaultIcon = channelType === Constants.PRIVATE_CHANNEL ?
        <LockOutlineIcon size={20}/> :
        <GlobeIcon size={20}/>;

    return (
        <div className='ChannelEmojiSelector'>
            <label className='ChannelEmojiSelector__label'>
                <FormattedMessage
                    id='channel_settings.emoji.label'
                    defaultMessage='Channel Emoji'
                />
            </label>
            <p className='ChannelEmojiSelector__help'>
                <FormattedMessage
                    id='channel_settings.emoji.description'
                    defaultMessage='Choose an emoji to display in the sidebar next to this channel.'
                />
            </p>
            <div className='ChannelEmojiSelector__controls'>
                <button
                    ref={setReference}
                    type='button'
                    className='ChannelEmojiSelector__button'
                    disabled={disabled}
                    aria-label={formatMessage({id: 'channel_settings.emoji.select', defaultMessage: 'Select channel emoji'})}
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    {...getReferenceProps()}
                >
                    <span className='ChannelEmojiSelector__icon'>
                        {emojiName ? (
                            <RenderEmoji
                                emojiName={emojiName}
                                size={20}
                            />
                        ) : defaultIcon}
                    </span>
                    <ChevronDownIcon size={12}/>
                </button>
                {emojiPicker}
                {emoji && (
                    <button
                        type='button'
                        className='ChannelEmojiSelector__clear'
                        disabled={disabled}
                        onClick={handleClear}
                    >
                        <FormattedMessage
                            id='channel_settings.emoji.clear'
                            defaultMessage='Remove emoji'
                        />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ChannelEmojiSelector;
