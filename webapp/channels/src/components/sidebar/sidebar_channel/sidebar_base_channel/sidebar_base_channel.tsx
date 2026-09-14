// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';

import {loadCustomEmojisIfNeeded} from 'actions/emoji_actions';

import LeaveChannelModal from 'components/leave_channel_modal';
import SidebarChannelLink from 'components/sidebar/sidebar_channel/sidebar_channel_link';

import Constants, {ModalIdentifiers} from 'utils/constants';
import {trimmedEmojiName} from 'utils/emoji_utils';

import SidebarBaseChannelIcon from './sidebar_base_channel_icon';

import type {PropsFromRedux} from './index';

export interface Props extends PropsFromRedux {
    channel: Channel;
    currentTeamName: string;
}

const SidebarBaseChannel = ({
    channel,
    currentTeamName,
    actions,
}: Props) => {
    const intl = useIntl();
    const dispatch = useDispatch();

    const handleLeavePublicChannel = useCallback((callback: () => void) => {
        actions.leaveChannel(channel.id);
        callback();
    }, [channel.id, actions.leaveChannel]);

    const handleLeaveWithConfirmation = useCallback((callback: () => void) => {
        actions.openModal({modalId: ModalIdentifiers.LEAVE_PRIVATE_CHANNEL_MODAL, dialogType: LeaveChannelModal, dialogProps: {channel}});
        callback();
    }, [channel, actions.openModal]);

    let channelLeaveHandler = null;
    if (channel.type === Constants.OPEN_CHANNEL && channel.name !== Constants.DEFAULT_CHANNEL) {
        channelLeaveHandler = channel.policy_enforced ? handleLeaveWithConfirmation : handleLeavePublicChannel;
    } else if (channel.type === Constants.PRIVATE_CHANNEL) {
        channelLeaveHandler = handleLeaveWithConfirmation;
    }

    const emojiName = channel.emoji ? trimmedEmojiName(channel.emoji) : '';

    // #region agent log
    if (channel.name === Constants.DEFAULT_CHANNEL) {
        fetch('http://127.0.0.1:8765', {method: 'POST', mode: 'no-cors', body: JSON.stringify({hypothesisId: 'A,E', location: 'sidebar_base_channel.tsx:render', message: 'Town Square sidebar channel prop', data: {channelId: channel.id, channelEmoji: channel.emoji ?? null, normalizedEmoji: emojiName}, timestamp: Date.now()})}).catch(() => {});
    }
    // #endregion
    useEffect(() => {
        if (emojiName) {
            // #region agent log
            if (channel.name === Constants.DEFAULT_CHANNEL) {
                fetch('http://127.0.0.1:8765', {method: 'POST', mode: 'no-cors', body: JSON.stringify({hypothesisId: 'C', location: 'sidebar_base_channel.tsx:effect', message: 'Dispatching emoji load check', data: {channelId: channel.id, emojiName}, timestamp: Date.now()})}).catch(() => {});
            }
            // #endregion
            dispatch(loadCustomEmojisIfNeeded([emojiName]));
        }
    }, [channel.id, channel.name, dispatch, emojiName]);

    const channelIcon = (
        <SidebarBaseChannelIcon
            channelType={channel.type}
            emoji={emojiName}
        />
    );

    let ariaLabelPrefix;
    if (channel.type === Constants.OPEN_CHANNEL) {
        ariaLabelPrefix = intl.formatMessage({id: 'accessibility.sidebar.types.public', defaultMessage: 'public channel'});
    } else if (channel.type === Constants.PRIVATE_CHANNEL) {
        ariaLabelPrefix = intl.formatMessage({id: 'accessibility.sidebar.types.private', defaultMessage: 'private channel'});
    }

    return (
        <SidebarChannelLink
            channel={channel}
            link={`/${currentTeamName}/channels/${channel.name}`}
            label={channel.display_name}
            ariaLabelPrefix={ariaLabelPrefix}
            channelLeaveHandler={channelLeaveHandler!}
            icon={channelIcon}
            isSharedChannel={channel.shared}
        />
    );
};

export default SidebarBaseChannel;
