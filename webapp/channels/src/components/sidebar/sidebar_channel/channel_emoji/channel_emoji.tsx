// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';

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
    const emojiName = useSelector((state: GlobalState) => getChannelEmojiName(state, channel.id));
    const emojiExists = useSelector((state: GlobalState) => Boolean(emojiName) && getEmojiMap(state).has(emojiName));

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
