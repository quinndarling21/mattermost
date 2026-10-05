// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';
import type {Emoji} from '@mattermost/types/emojis';

import {getEmojiName} from 'mattermost-redux/utils/emoji_utils';

import useEmojiPicker from 'components/emoji_picker/use_emoji_picker';

import {saveChannelEmoji} from './actions';

type Props = {
    channel: Channel;
    setShow: (show: boolean) => void;

    /**
     * Row that opened the picker. The menu item unmounts when the menu closes,
     * so focus returns here after selection or dismissal.
     */
    anchorRef: React.RefObject<HTMLElement>;
}

export default function ChannelEmojiPicker({channel, setShow, anchorRef}: Props) {
    const dispatch = useDispatch();

    const hidePicker = useCallback((show: boolean) => {
        if (!show) {
            setShow(false);
        }
    }, [setShow]);

    const handleEmojiClick = useCallback((emoji: Emoji) => {
        const emojiName = getEmojiName(emoji);
        if (emojiName) {
            dispatch(saveChannelEmoji(channel.id, emojiName));
        }
        hidePicker(false);
    }, [dispatch, channel.id, hidePicker]);

    const {emojiPicker, setReference} = useEmojiPicker({
        showEmojiPicker: true,
        setShowEmojiPicker: hidePicker,
        onEmojiClick: handleEmojiClick,
    });

    useEffect(() => {
        if (anchorRef.current) {
            setReference(anchorRef.current);
        }
    }, [setReference, anchorRef]);

    useEffect(() => {
        const anchor = anchorRef.current;
        return () => {
            window.requestAnimationFrame(() => anchor?.focus());
        };
    }, [anchorRef]);

    return <>{emojiPicker}</>;
}
