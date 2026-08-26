// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useRef, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import styled from 'styled-components';

import {ChevronDownIcon, EmoticonHappyOutlineIcon} from '@mattermost/compass-icons/components';
import type {Emoji} from '@mattermost/types/emojis';

import useEmojiPicker from 'components/emoji_picker/use_emoji_picker';
import RenderEmoji from 'components/emoji/render_emoji';

import Constants, {A11yCustomEventTypes, type A11yFocusEventDetail} from 'utils/constants';
import {trimmedEmojiName} from 'utils/emoji_utils';
import {isKeyPressed} from 'utils/keyboard';

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
    const {formatMessage} = useIntl();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const targetRef = useRef<HTMLButtonElement>(null);

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

    const handleEmojiResetKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
        if (isKeyPressed(e, Constants.KeyCodes.ENTER) || isKeyPressed(e, Constants.KeyCodes.SPACE)) {
            e.stopPropagation();
            handleEmojiClear();
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
        <Container>
            <Label>
                <FormattedMessage
                    id='channel_settings.emoji.label'
                    defaultMessage='Channel emoji'
                />
            </Label>
            <Description>
                <FormattedMessage
                    id='channel_settings.emoji.description'
                    defaultMessage='Choose an emoji to show next to this channel in the sidebar.'
                />
            </Description>
            <Controls>
                <PickerButton
                    ref={setButtonRefs}
                    type='button'
                    disabled={disabled}
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    onKeyDown={handleEmojiKeyDown}
                    aria-label={formatMessage({
                        id: 'channel_settings.emoji.button.ariaLabel',
                        defaultMessage: 'Select a channel emoji',
                    })}
                    className='emoji-picker__container'
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
                </PickerButton>
                {emojiPicker}
                <Clear
                    visible={Boolean(emoji) && !disabled}
                    tabIndex={0}
                    onClick={handleEmojiClear}
                    onKeyDown={handleEmojiResetKeyDown}
                >
                    <FormattedMessage
                        id='channel_settings.emoji.clear'
                        defaultMessage='Remove emoji'
                    />
                </Clear>
            </Controls>
        </Container>
    );
};

export default ChannelEmojiSelector;

const Container = styled.div`
    margin-bottom: 24px;
`;

const Label = styled.div`
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: var(--center-channel-color);
    margin-bottom: 4px;
`;

const Description = styled.div`
    font-size: 12px;
    line-height: 16px;
    color: rgba(var(--center-channel-color-rgb), 0.75);
    margin-bottom: 8px;
`;

const Controls = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const PickerButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 57px;
    height: 40px;
    border-radius: var(--radius-s);
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    background: var(--center-channel-bg);
    color: rgba(var(--center-channel-color-rgb), 0.64);
    padding: 0 6px;

    &:hover:not(:disabled) {
        background: rgba(var(--center-channel-color-rgb), 0.08);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const Clear = styled.a<{visible: boolean}>`
    font-size: 12px;
    visibility: ${({visible}) => (visible ? 'visible' : 'hidden')};
    color: var(--link-color);
    cursor: pointer;
`;
