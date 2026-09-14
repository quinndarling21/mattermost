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

    // #region agent log
    if (emoji) {
        fetch('http://127.0.0.1:8765', {method: 'POST', mode: 'no-cors', body: JSON.stringify({hypothesisId: 'B,D,E', location: 'sidebar_base_channel_icon.tsx:render', message: 'Sidebar emoji resolution', data: {emoji, customEmojiCount: emojiMap.customEmojis.size, mapHasEmoji: emojiMap.has(emoji), mapHasSystemEmoji: emojiMap.hasSystemEmoji(emoji), resolved: Boolean(resolvedEmoji), resolvedKind: resolvedEmoji && 'short_name' in resolvedEmoji ? 'system' : resolvedEmoji ? 'custom' : 'none', imageUrl, renderEmojiBranch: Boolean(emoji && resolvedEmoji && imageUrl)}, timestamp: Date.now()})}).catch(() => {});
    }
    // #endregion

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
