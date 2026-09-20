// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';
import type {Emoji} from '@mattermost/types/emojis';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getEmojiName} from 'mattermost-redux/utils/emoji_utils';

import useEmojiPicker from 'components/emoji_picker/use_emoji_picker';

import {makeChannelEmojiPreference} from './helpers';

type Props = {
    channel: Channel;
    setShow: (show: boolean) => void;

    /**
     * The sidebar channel row that the picker is anchored to. Focus returns to
     * this element after selection or dismissal since the menu item that opened
     * the picker unmounts when the channel menu closes.
     */
    anchorRef: React.RefObject<HTMLElement>;
}

/**
 * Controller for the emoji picker opened from the sidebar channel menu's
 * "Set/Change Channel Emoji" action. Only mounted while the picker is open.
 */
export default function ChannelEmojiPicker({channel, setShow, anchorRef}: Props) {
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);

    const hidePicker = useCallback((show: boolean) => {
        if (!show) {
            setShow(false);

            // Restore focus to the channel row once the picker has unmounted
            window.requestAnimationFrame(() => anchorRef.current?.focus());
        }
    }, [setShow, anchorRef]);

    const handleEmojiClick = useCallback((emoji: Emoji) => {
        const emojiName = getEmojiName(emoji);
        if (emojiName) {
            // savePreferences applies the preference optimistically and rolls it
            // back if the server rejects it, so the marker updates immediately.
            dispatch(savePreferences(currentUserId, [
                makeChannelEmojiPreference(currentUserId, channel.id, emojiName),
            ]));
        }
        hidePicker(false);
    }, [dispatch, currentUserId, channel.id, hidePicker]);

    const {emojiPicker, setReference} = useEmojiPicker({
        showEmojiPicker: true,
        setShowEmojiPicker: hidePicker,
        onEmojiClick: handleEmojiClick,
    });

    useEffect(() => {
        setReference(anchorRef.current);
    }, [setReference, anchorRef]);

    return <>{emojiPicker}</>;
}
