// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {ChannelType} from '@mattermost/types/channels';

import RenderEmoji from 'components/emoji/render_emoji';

import Constants from 'utils/constants';
import {trimmedEmojiName} from 'utils/emoji_utils';

type Props = {
    channelType: ChannelType;
    emoji?: string;
}

const SidebarBaseChannelIcon = ({
    channelType,
    emoji,
}: Props) => {
    const emojiName = emoji ? trimmedEmojiName(emoji) : '';
    if (emojiName) {
        return (
            <RenderEmoji
                emojiName={emojiName}
                size={16}
            />
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
