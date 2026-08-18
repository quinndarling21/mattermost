// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import type {ChannelType} from '@mattermost/types/channels';

import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import {getEmojiMap} from 'selectors/emojis';

import RenderEmoji from 'components/emoji/render_emoji';

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
    const canRenderEmoji = Boolean(resolvedEmoji && getEmojiImageUrl(resolvedEmoji));

    if (canRenderEmoji && emoji) {
        return (
            <span
                className='SidebarBaseChannelIcon'
                aria-hidden='true'
            >
                <RenderEmoji
                    emojiName={emoji}
                    size={16}
                />
            </span>
        );
    }

    return getChannelTypeIcon(channelType);
};

export default SidebarBaseChannelIcon;
