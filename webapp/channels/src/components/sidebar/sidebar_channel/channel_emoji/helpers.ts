// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {PreferenceType} from '@mattermost/types/preferences';

import {Preferences} from 'mattermost-redux/constants';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import type {GlobalState} from 'types/store';

/**
 * Emoji name the current user assigned to this channel.
 * Empty when the marker has not been set.
 */
export function getChannelEmojiName(state: GlobalState, channelId: string): string {
    return get(state, Preferences.CATEGORY_CHANNEL_EMOJI, channelId, '').trim();
}

/**
 * Preference identity for a channel emoji. The channel ID is the name so one
 * user can store a single marker per channel. Deleting this preference removes
 * the marker.
 */
export function makeChannelEmojiPreference(userId: string, channelId: string, emojiName = ''): PreferenceType {
    return {
        user_id: userId,
        category: Preferences.CATEGORY_CHANNEL_EMOJI,
        name: channelId,
        value: emojiName,
    };
}
