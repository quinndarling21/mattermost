// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';

import {loadCustomEmojisIfNeeded} from 'actions/emoji_actions';
import {getEmojiMap} from 'selectors/emojis';

import RenderEmoji from 'components/emoji/render_emoji';

import Constants from 'utils/constants';

import type {GlobalState} from 'types/store';

import {getChannelEmojiName} from './helpers';

import './channel_emoji.scss';

type Props = {
    channel: Channel;
}

/**
 * Personal emoji marker shown after the channel name. Decorative: the channel
 * link's accessible name already identifies the destination.
 */
export default function ChannelEmoji({channel}: Props) {
    const dispatch = useDispatch();
    const emojiName = useSelector((state: GlobalState) => getChannelEmojiName(state, channel.id));
    const emojiExists = useSelector((state: GlobalState) => Boolean(emojiName) && getEmojiMap(state).has(emojiName));

    useEffect(() => {
        // A miss in the emoji map is only "unavailable" after a fetch. Custom
        // names are not loaded at startup, so request this one or the marker
        // stays hidden across reloads.
        if (!emojiName || emojiExists) {
            return;
        }

        if (channel.type !== Constants.OPEN_CHANNEL && channel.type !== Constants.PRIVATE_CHANNEL) {
            return;
        }

        dispatch(loadCustomEmojisIfNeeded([emojiName]));
    }, [channel.type, dispatch, emojiExists, emojiName]);

    if (channel.type !== Constants.OPEN_CHANNEL && channel.type !== Constants.PRIVATE_CHANNEL) {
        return null;
    }

    if (!emojiName || !emojiExists) {
        return null;
    }

    return (
        <span
            className='ChannelEmoji'
            aria-hidden='true'
        >
            <RenderEmoji
                emojiName={emojiName}
                size={16}
            />
        </span>
    );
}
