// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useLayoutEffect} from 'react';
import type {MouseEvent} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import type {Emoji} from '@mattermost/types/emojis';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import useEmojiPicker from 'components/emoji_picker/use_emoji_picker';

import {A11yCustomEventTypes} from 'utils/constants';
import type {A11yFocusEventDetail} from 'utils/constants';

import {makeChannelEmojiPreference} from './utils';

type Props = {
    channelId: string;

    /** The sidebar row the picker is positioned against and returns focus to when it closes. */
    anchorId: string;
    show: boolean;
    setShow: (show: boolean) => void;
};

function stopPropagation(e: MouseEvent) {
    // The picker is portaled, but React still bubbles its clicks through the sidebar row's link.
    e.stopPropagation();
}

export default function ChannelEmojiPicker({channelId, anchorId, show, setShow}: Props) {
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);

    const setShowAndRestoreFocus = useCallback((nextShow: boolean) => {
        setShow(nextShow);

        const anchor = document.getElementById(anchorId);
        if (!nextShow && anchor) {
            document.dispatchEvent(new CustomEvent<A11yFocusEventDetail>(A11yCustomEventTypes.FOCUS, {
                detail: {target: anchor, keyboardOnly: true},
            }));
        }
    }, [anchorId, setShow]);

    const handleEmojiClick = useCallback((emoji: Emoji) => {
        const emojiName = 'short_name' in emoji ? emoji.short_name : emoji.name;
        dispatch(savePreferences(currentUserId, [makeChannelEmojiPreference(currentUserId, channelId, emojiName)]));
        setShowAndRestoreFocus(false);
    }, [channelId, currentUserId, dispatch, setShowAndRestoreFocus]);

    const {emojiPicker, setReference} = useEmojiPicker({
        showEmojiPicker: show,
        setShowEmojiPicker: setShowAndRestoreFocus,
        onEmojiClick: handleEmojiClick,
    });

    useLayoutEffect(() => {
        if (show) {
            setReference(document.getElementById(anchorId));
        }
    }, [anchorId, setReference, show]);

    if (!show) {
        return null;
    }

    return (
        <div
            className='ChannelEmojiPicker'
            role='presentation'
            onClick={stopPropagation}
        >
            {emojiPicker}
        </div>
    );
}
