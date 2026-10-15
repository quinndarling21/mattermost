// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {PreferenceType} from '@mattermost/types/preferences';

import {Preferences} from 'mattermost-redux/constants';
import {get as getPreference} from 'mattermost-redux/selectors/entities/preferences';

import type {GlobalState} from 'types/store';

export function getChannelEmoji(state: GlobalState, channelId: string): string {
    return getPreference(state, Preferences.CATEGORY_CHANNEL_EMOJI, channelId, '');
}

export function makeChannelEmojiPreference(userId: string, channelId: string, emojiName = ''): PreferenceType {
    return {
        user_id: userId,
        category: Preferences.CATEGORY_CHANNEL_EMOJI,
        name: channelId,
        value: emojiName,
    };
}
