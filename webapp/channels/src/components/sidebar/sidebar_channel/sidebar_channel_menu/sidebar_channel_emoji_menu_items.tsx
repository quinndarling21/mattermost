// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {EmoticonHappyOutlineIcon} from '@mattermost/compass-icons/components';
import type {Emoji} from '@mattermost/types/emojis';

import useEmojiPicker from 'components/emoji_picker/use_emoji_picker';
import * as Menu from 'components/menu';

type Props = {
    channelId: string;
    sidebarEmoji?: string;
    onSetSidebarEmoji: (emojiName: string) => void;
    onRemoveSidebarEmoji: () => void;
    onMenuToggle: (open: boolean) => void;
}

const SidebarChannelEmojiMenuItems = ({
    channelId,
    sidebarEmoji,
    onSetSidebarEmoji,
    onRemoveSidebarEmoji,
    onMenuToggle,
}: Props) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleEmojiClick = useCallback((emoji: Emoji) => {
        onSetSidebarEmoji(emoji.name);
        setShowEmojiPicker(false);
    }, [onSetSidebarEmoji]);

    const {
        emojiPicker,
        setReference,
    } = useEmojiPicker({
        showEmojiPicker,
        setShowEmojiPicker,
        onEmojiClick: handleEmojiClick,
    });

    useEffect(() => {
        if (!showEmojiPicker) {
            return;
        }

        const menuButton = document.getElementById(`SidebarChannelMenu-Button-${channelId}`);
        if (menuButton) {
            setReference(menuButton);
        }
    }, [channelId, setReference, showEmojiPicker]);

    const handleOpenEmojiPicker = () => {
        onMenuToggle(false);
        setShowEmojiPicker(true);
    };

    const handleRemoveEmoji = () => {
        onRemoveSidebarEmoji();
    };

    return (
        <>
            <Menu.Item
                id={`setChannelEmoji-${channelId}`}
                onClick={handleOpenEmojiPicker}
                leadingElement={<EmoticonHappyOutlineIcon size={18}/>}
                labels={sidebarEmoji ? (
                    <FormattedMessage
                        id='sidebar_left.sidebar_channel_menu.changeChannelEmoji'
                        defaultMessage='Change Channel Emoji'
                    />
                ) : (
                    <FormattedMessage
                        id='sidebar_left.sidebar_channel_menu.setChannelEmoji'
                        defaultMessage='Set Channel Emoji'
                    />
                )}
            />
            {sidebarEmoji && (
                <Menu.Item
                    id={`removeChannelEmoji-${channelId}`}
                    onClick={handleRemoveEmoji}
                    leadingElement={<EmoticonHappyOutlineIcon size={18}/>}
                    labels={(
                        <FormattedMessage
                            id='sidebar_left.sidebar_channel_menu.removeChannelEmoji'
                            defaultMessage='Remove Channel Emoji'
                        />
                    )}
                />
            )}
            {emojiPicker}
        </>
    );
};

export default SidebarChannelEmojiMenuItems;
