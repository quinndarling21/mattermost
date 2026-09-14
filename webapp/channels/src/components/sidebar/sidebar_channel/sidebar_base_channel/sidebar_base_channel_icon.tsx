// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import type {ChannelType} from '@mattermost/types/channels';

import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import {getEmojiMap} from 'selectors/emojis';

import RenderEmoji from 'components/emoji/render_emoji';

import Constants from 'utils/constants';
import {trimmedEmojiName} from 'utils/emoji_utils';

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
    const emojiName = emoji ? trimmedEmojiName(emoji) : '';
    const resolvedEmoji = emojiName ? emojiMap.get(emojiName) : undefined;
    const canRenderEmoji = Boolean(resolvedEmoji && getEmojiImageUrl(resolvedEmoji));

    if (canRenderEmoji && emojiName) {
        return (
            <span
                className='SidebarBaseChannelIcon'
                aria-hidden={true}
            >
                <RenderEmoji
                    emojiName={emojiName}
                    size={16}
                />
            </span>
        );
    }

    return getChannelTypeIcon(channelType);
};

export default SidebarBaseChannelIcon;
