// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';

import {Button} from '@mattermost/shared/components/button';
import type {Emoji} from '@mattermost/types/emojis';

import RenderEmoji from 'components/emoji/render_emoji';
import useEmojiPicker from 'components/emoji_picker/use_emoji_picker';

import {trimmedEmojiName} from 'utils/emoji_utils';

type Props = {

    /**
     * The currently selected emoji name. May be empty (no emoji) and may or
     * may not be wrapped in colons.
     */
    value: string;

    /**
     * Called with the bare emoji name (no colons) when the selection changes,
     * or with an empty string when the emoji is removed.
     */
    onChange: (emoji: string) => void;
    disabled?: boolean;
};

function ChannelSettingsEmojiSelector({value, onChange, disabled}: Props) {
    const {formatMessage} = useIntl();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleEmojiClick = (selectedEmoji: Emoji) => {
        setShowEmojiPicker(false);
        const emojiName = ('short_name' in selectedEmoji) ? selectedEmoji.short_name : selectedEmoji.name;
        onChange(emojiName);
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

    const toggleEmojiPicker = () => {
        if (disabled) {
            return;
        }
        setShowEmojiPicker((prev) => !prev);
    };

    const handleClear = () => {
        onChange('');
    };

    return (
        <div className='ChannelSettingsModal__emojiSelector'>
            <label className='ChannelSettingsModal__emojiSelectorLabel'>
                {formatMessage({id: 'channel_settings.emoji.label', defaultMessage: 'Channel Emoji'})}
            </label>
            <div className='ChannelSettingsModal__emojiSelectorRow'>
                <button
                    ref={setReference}
                    type='button'
                    className='ChannelSettingsModal__emojiButton style--none'
                    onClick={toggleEmojiPicker}
                    disabled={disabled}
                    aria-label={formatMessage({id: 'channel_settings.emoji.select_aria_label', defaultMessage: 'Select a channel emoji'})}
                    {...getReferenceProps()}
                >
                    {value ? (
                        <RenderEmoji
                            emojiName={trimmedEmojiName(value)}
                            size={20}
                        />
                    ) : (
                        <i className='icon icon-emoticon-plus-outline'/>
                    )}
                </button>
                {emojiPicker}
                {Boolean(value) && !disabled && (
                    <Button
                        type='button'
                        emphasis='tertiary'
                        size='sm'
                        className='ChannelSettingsModal__emojiClear'
                        onClick={handleClear}
                    >
                        {formatMessage({id: 'channel_settings.emoji.remove', defaultMessage: 'Remove emoji'})}
                    </Button>
                )}
            </div>
            <div className='ChannelSettingsModal__emojiSelectorHelp'>
                {formatMessage({id: 'channel_settings.emoji.help_text', defaultMessage: 'Shown next to the channel name in the sidebar to help categorize channels.'})}
            </div>
        </div>
    );
}

export default ChannelSettingsEmojiSelector;
