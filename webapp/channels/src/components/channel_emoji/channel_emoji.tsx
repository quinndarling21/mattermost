// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';

import RenderEmoji from 'components/emoji/render_emoji';

import {trimmedEmojiName} from 'utils/emoji_utils';

type Props = {
    emoji?: string;
    size?: number;
    className?: string;
}

const ChannelEmoji = ({emoji, size = 16, className}: Props) => {
    const emojiName = emoji && trimmedEmojiName(emoji);

    if (!emojiName) {
        return null;
    }

    return (
        <span
            className={classNames('ChannelEmoji', className)}
            aria-hidden='true'
        >
            <RenderEmoji
                emojiName={emojiName}
                size={size}
            />
        </span>
    );
};

export default ChannelEmoji;
