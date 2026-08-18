// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {ChannelType} from '@mattermost/types/channels';

import RenderEmoji from 'components/emoji/render_emoji';

import Constants from 'utils/constants';

import './sidebar_base_channel_icon.scss';

type Props = {
    channelType: ChannelType;
    emoji?: string;
}

const SidebarBaseChannelIcon = ({
    channelType,
    emoji,
}: Props) => {
    let channelTypeIcon = null;
    if (channelType === Constants.OPEN_CHANNEL) {
        channelTypeIcon = (
            <i className='icon icon-globe'/>
        );
    } else if (channelType === Constants.PRIVATE_CHANNEL) {
        channelTypeIcon = (
            <i className='icon icon-lock-outline'/>
        );
    }

    if (!emoji) {
        return channelTypeIcon;
    }

    return (
        <span
            className='SidebarBaseChannelIcon'
            aria-hidden='true'
        >
            <RenderEmoji
                emojiName={emoji}
                size={16}
            />
            <span className='SidebarBaseChannelIcon__fallback'>
                {channelTypeIcon}
            </span>
        </span>
    );
};

export default SidebarBaseChannelIcon;
