// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {PreferenceType} from '@mattermost/types/preferences';

import {Preferences} from 'mattermost-redux/constants';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import type {GlobalState} from 'types/store';

/**
 * Returns the emoji name that the current user assigned to the given channel,
 * or an empty string when no channel emoji has been set.
 */
export function getChannelEmojiName(state: GlobalState, channelId: string): string {
    return get(state, Preferences.CATEGORY_CHANNEL_EMOJI, channelId, '');
}

/**
 * Builds the preference identity used to save or delete a channel emoji marker.
 * The channel ID is the preference name and the stable emoji name is the value.
 */
export function makeChannelEmojiPreference(userId: string, channelId: string, emojiName = ''): PreferenceType {
    return {
        user_id: userId,
        category: Preferences.CATEGORY_CHANNEL_EMOJI,
        name: channelId,
        value: emojiName,
    };
}
