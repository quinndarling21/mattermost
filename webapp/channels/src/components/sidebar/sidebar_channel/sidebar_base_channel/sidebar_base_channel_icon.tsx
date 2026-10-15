// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import type {ChannelType} from '@mattermost/types/channels';

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
    const hasEmoji = useSelector((state: GlobalState) => (emoji ? getEmojiMap(state).has(emoji) : false));

    if (emoji && hasEmoji) {
        return (
            <span
                className='SidebarChannelEmoji'
                data-testid='sidebarChannelEmoji'
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
