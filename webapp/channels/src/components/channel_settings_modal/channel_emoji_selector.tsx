// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {ChevronDownIcon, EmoticonHappyOutlineIcon} from '@mattermost/compass-icons/components';
import {Button} from '@mattermost/shared/components/button';
import type {Emoji} from '@mattermost/types/emojis';

import RenderEmoji from 'components/emoji/render_emoji';
import useEmojiPicker from 'components/emoji_picker/use_emoji_picker';

import Constants, {A11yCustomEventTypes, type A11yFocusEventDetail} from 'utils/constants';
import {trimmedEmojiName} from 'utils/emoji_utils';
import {isKeyPressed} from 'utils/keyboard';

import './channel_emoji_selector.scss';

type Props = {
    emoji: string;
    onChange: (emoji: string) => void;
    disabled?: boolean;
};

const ChannelEmojiSelector = ({
    emoji,
    onChange,
    disabled = false,
}: Props) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const targetRef = useRef<HTMLButtonElement | null>(null);

    const refocusEmojiButton = () => {
        if (!targetRef.current) {
            return;
        }

        document.dispatchEvent(new CustomEvent<A11yFocusEventDetail>(
            A11yCustomEventTypes.FOCUS, {
                detail: {
                    target: targetRef.current,
                    keyboardOnly: true,
                },
            },
        ));
    };

    const handleEmojiClick = useCallback((selectedEmoji: Emoji) => {
        setShowEmojiPicker(false);
        const emojiName = ('short_name' in selectedEmoji) ? selectedEmoji.short_name : selectedEmoji.name;
        onChange(trimmedEmojiName(emojiName));
        refocusEmojiButton();
    }, [onChange]);

    const handleEmojiClear = useCallback(() => {
        onChange('');
    }, [onChange]);

    const handleEmojiKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            e.stopPropagation();
        }
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

    const setButtonRefs = useCallback((node: HTMLButtonElement | null) => {
        targetRef.current = node;
        setReference(node);
    }, [setReference]);

    const emojiName = emoji ? trimmedEmojiName(emoji) : '';

    return (
        <div className='ChannelEmojiSelector'>
            <div
                id='channel-emoji-label'
                className='ChannelEmojiSelector__label'
            >
                <FormattedMessage
                    id='channel_settings.emoji.label'
                    defaultMessage='Channel emoji'
                />
            </div>
            <div
                id='channel-emoji-description'
                className='ChannelEmojiSelector__description'
            >
                <FormattedMessage
                    id='channel_settings.emoji.description'
                    defaultMessage='Choose an emoji to show next to this channel in the sidebar.'
                />
            </div>
            <div className='ChannelEmojiSelector__controls'>
                <button
                    ref={setButtonRefs}
                    type='button'
                    disabled={disabled}
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    onKeyDown={handleEmojiKeyDown}
                    aria-labelledby='channel-emoji-label'
                    aria-describedby='channel-emoji-description'
                    className='ChannelEmojiSelector__pickerButton emoji-picker__container'
                    {...getReferenceProps()}
                >
                    {emojiName ? (
                        <RenderEmoji
                            emojiName={emojiName}
                            size={24}
                        />
                    ) : (
                        <EmoticonHappyOutlineIcon size={24}/>
                    )}
                    <ChevronDownIcon size={12}/>
                </button>
                {emojiPicker}
                <Button
                    type='button'
                    className='ChannelEmojiSelector__clear'
                    emphasis='quaternary'
                    size='xs'
                    hidden={!emoji || disabled}
                    onClick={handleEmojiClear}
                >
                    <FormattedMessage
                        id='channel_settings.emoji.clear'
                        defaultMessage='Remove emoji'
                    />
                </Button>
            </div>
        </div>
    );
};

export default ChannelEmojiSelector;
