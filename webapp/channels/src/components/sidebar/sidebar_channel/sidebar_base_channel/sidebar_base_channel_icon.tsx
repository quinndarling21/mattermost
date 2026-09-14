// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import type {ChannelType} from '@mattermost/types/channels';

import {loadCustomEmojisIfNeeded} from 'actions/emoji_actions';
import {getEmojiMap} from 'selectors/emojis';

import RenderEmoji from 'components/emoji/render_emoji';

import Constants from 'utils/constants';

import type {GlobalState} from 'types/store';

import './sidebar_base_channel_icon.scss';

type Props = {
    channelType: ChannelType;
    emoji?: string;
}

const SidebarBaseChannelIcon = ({
    channelType,
    emoji,
}: Props) => {
    const dispatch = useDispatch();

    // Custom emojis are loaded lazily, so an assigned emoji may not be in the
    // store yet. Until it resolves we fall back to the channel type icon.
    const hasEmoji = useSelector((state: GlobalState) => Boolean(emoji) && getEmojiMap(state).has(emoji!));

    useEffect(() => {
        if (emoji && !hasEmoji) {
            dispatch(loadCustomEmojisIfNeeded([emoji]));
        }
    }, [dispatch, emoji, hasEmoji]);

    if (emoji && hasEmoji) {
        return (
            <span
                className='SidebarChannelEmoji'
                data-testid='sidebar-channel-emoji'
            >
                <RenderEmoji
                    emojiName={emoji}
                    size={16}
                />
            </span>
        );
    }

    if (channelType === Constants.OPEN_CHANNEL) {
        return (
            <i className='icon icon-globe'/>
        );
    }
    if (channelType === Constants.PRIVATE_CHANNEL) {
        return (
            <i className='icon icon-lock-outline'/>
        );
    }
    return null;
};

export default SidebarBaseChannelIcon;
