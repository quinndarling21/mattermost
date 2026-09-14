// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';
import {useIntl} from 'react-intl';

import {ChevronDownIcon, EmoticonPlusOutlineIcon} from '@mattermost/compass-icons/components';
import {Button} from '@mattermost/shared/components/button';
import type {Emoji} from '@mattermost/types/emojis';

import RenderEmoji from 'components/emoji/render_emoji';
import useEmojiPicker from 'components/emoji_picker/use_emoji_picker';

import {trimmedEmojiName} from 'utils/emoji_utils';

type Props = {
    value?: string;
    onChange: (emoji: string) => void;
    disabled?: boolean;
};

function ChannelSettingsEmojiSelector({value, onChange, disabled}: Props) {
    const {formatMessage} = useIntl();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const emojiName = value ? trimmedEmojiName(value) : '';

    const handleEmojiClick = useCallback((selectedEmoji: Emoji) => {
        setShowEmojiPicker(false);
        const name = ('short_name' in selectedEmoji) ? selectedEmoji.short_name : selectedEmoji.name;
        onChange(name);
    }, [onChange]);

    const handleClear = useCallback(() => {
        onChange('');
    }, [onChange]);

    const {
        emojiPicker,
        getReferenceProps,
        setReference,
    } = useEmojiPicker({
        showEmojiPicker: showEmojiPicker && !disabled,
        setShowEmojiPicker,
        onEmojiClick: handleEmojiClick,
    });

    return (
        <div className='ChannelSettingsModal__emojiSelector'>
            <div className='ChannelSettingsModal__emojiSelectorLabel'>
                {formatMessage({id: 'channel_settings.emoji.label', defaultMessage: 'Channel icon emoji'})}
            </div>
            <div className='ChannelSettingsModal__emojiSelectorControl'>
                <button
                    ref={setReference}
                    type='button'
                    disabled={disabled}
                    aria-label={formatMessage({id: 'channel_settings.emoji.select', defaultMessage: 'Select a channel emoji'})}
                    className='ChannelSettingsModal__emojiSelectorButton'
                    {...getReferenceProps()}
                >
                    {emojiName ? (
                        <RenderEmoji
                            emojiName={emojiName}
                            size={20}
                        />
                    ) : (
                        <EmoticonPlusOutlineIcon size={20}/>
                    )}
                    <ChevronDownIcon size={16}/>
                </button>
                {emojiPicker}
                {emojiName && !disabled && (
                    <Button
                        type='button'
                        emphasis='tertiary'
                        size='sm'
                        onClick={handleClear}
                    >
                        {formatMessage({id: 'channel_settings.emoji.remove', defaultMessage: 'Remove emoji'})}
                    </Button>
                )}
            </div>
            <div className='Input___customMessage Input___info'>
                <span>
                    {formatMessage({id: 'channel_settings.emoji.description', defaultMessage: 'Show a custom emoji instead of the default icon next to this channel in the sidebar.'})}
                </span>
            </div>
        </div>
    );
}

export default ChannelSettingsEmojiSelector;
