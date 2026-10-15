// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {loadCustomEmojisIfNeeded} from 'actions/emoji_actions';
import {getEmojiMap} from 'selectors/emojis';

import RenderEmoji from 'components/emoji/render_emoji';

import type {GlobalState} from 'types/store';

import {getChannelEmoji} from './utils';

import './channel_emoji.scss';

type Props = {
    channelId: string;
};

function ChannelEmoji({channelId}: Props) {
    const dispatch = useDispatch();
    const emojiName = useSelector((state: GlobalState) => getChannelEmoji(state, channelId));
    const isResolvable = useSelector((state: GlobalState) => Boolean(emojiName) && getEmojiMap(state).has(emojiName));

    useEffect(() => {
        if (emojiName) {
            dispatch(loadCustomEmojisIfNeeded([emojiName]));
        }
    }, [dispatch, emojiName]);

    if (!isResolvable) {
        return null;
    }

    // The channel link's accessible name already identifies the channel, so the marker is decorative.
    return (
        <span
            className='ChannelEmoji'
            aria-hidden='true'
            data-testid='channelEmoji'
        >
            <RenderEmoji
                emojiName={emojiName}
                size={16}
            />
        </span>
    );
}

export default memo(ChannelEmoji);
