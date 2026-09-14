// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import type {ChannelType} from '@mattermost/types/channels';

import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import {getEmojiMap} from 'selectors/emojis';

import Constants from 'utils/constants';

import './sidebar_base_channel_icon.scss';

type Props = {
    channelType: ChannelType;
    emoji?: string;
}

function getChannelTypeIcon(channelType: ChannelType) {
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
}

const SidebarBaseChannelIcon = ({
    channelType,
    emoji,
}: Props) => {
    const emojiMap = useSelector(getEmojiMap);
    const resolvedEmoji = emoji ? emojiMap.get(emoji) : undefined;
    const imageUrl = resolvedEmoji ? getEmojiImageUrl(resolvedEmoji) : '';

    if (emoji && resolvedEmoji && imageUrl) {
        return (
            <span
                className='SidebarBaseChannelIcon'
                aria-hidden='true'
            >
                <span
                    className='emoticon'
                    data-emoticon={emoji}
                    style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'contain',
                        height: 16,
                        width: 16,
                        maxHeight: 16,
                        maxWidth: 16,
                        minHeight: 16,
                        minWidth: 16,
                        overflow: 'hidden',
                    }}
                />
            </span>
        );
    }

    return getChannelTypeIcon(channelType);
};

export default SidebarBaseChannelIcon;
