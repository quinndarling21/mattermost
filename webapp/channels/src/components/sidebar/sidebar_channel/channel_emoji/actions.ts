// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ServerError} from '@mattermost/types/errors';
import type {PreferenceType} from '@mattermost/types/preferences';

import {PreferenceTypes} from 'mattermost-redux/action_types';
import {logError, LogErrorBarMode} from 'mattermost-redux/actions/errors';
import {Client4} from 'mattermost-redux/client';
import {Preferences} from 'mattermost-redux/constants';
import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';

import {AnnouncementBarTypes} from 'utils/constants';

import type {ActionFuncAsync} from 'types/store';

import {makeChannelEmojiPreference} from './helpers';

const SAVE_ERROR_ID = 'sidebar_left.sidebar_channel_menu.saveChannelEmojiError';
const REMOVE_ERROR_ID = 'sidebar_left.sidebar_channel_menu.removeChannelEmojiError';

function previousChannelEmoji(preferences: Record<string, PreferenceType>, channelId: string): PreferenceType | undefined {
    return preferences[getPreferenceKey(Preferences.CATEGORY_CHANNEL_EMOJI, channelId)];
}

function reportChannelEmojiError(error: unknown, messageId: string) {
    const serverError = (error && typeof error === 'object') ? error as ServerError : {message: messageId};
    return logError({
        ...serverError,
        message: messageId,
        type: AnnouncementBarTypes.CRITICAL,
    }, {errorBarMode: LogErrorBarMode.Always});
}

/**
 * savePreferences deletes the new value when an update fails, which would
 * clear a marker the user already had, and it never raises the error bar.
 * This path keeps the previous preference and shows a dismissible error.
 */
export function saveChannelEmoji(channelId: string, emojiName: string): ActionFuncAsync {
    return async (dispatch, getState) => {
        const trimmedName = emojiName.trim();
        if (!trimmedName) {
            return {error: {message: SAVE_ERROR_ID}};
        }

        const state = getState();
        const userId = getCurrentUserId(state);
        if (!userId) {
            return {error: {message: SAVE_ERROR_ID}};
        }

        const previous = previousChannelEmoji(getMyPreferences(state), channelId);
        const next = makeChannelEmojiPreference(userId, channelId, trimmedName);

        dispatch({
            type: PreferenceTypes.RECEIVED_PREFERENCES,
            data: [next],
        });

        try {
            await Client4.savePreferences(userId, [next]);
            return {data: true};
        } catch (error) {
            if (previous) {
                dispatch({
                    type: PreferenceTypes.RECEIVED_PREFERENCES,
                    data: [previous],
                });
            } else {
                dispatch({
                    type: PreferenceTypes.DELETED_PREFERENCES,
                    data: [next],
                });
            }
            dispatch(reportChannelEmojiError(error, SAVE_ERROR_ID));
            return {error};
        }
    };
}

export function removeChannelEmoji(channelId: string): ActionFuncAsync {
    return async (dispatch, getState) => {
        const state = getState();
        const userId = getCurrentUserId(state);
        const previous = previousChannelEmoji(getMyPreferences(state), channelId);
        if (!userId || !previous) {
            return {data: true};
        }

        dispatch({
            type: PreferenceTypes.DELETED_PREFERENCES,
            data: [previous],
        });

        try {
            await Client4.deletePreferences(userId, [previous]);
            return {data: true};
        } catch (error) {
            dispatch({
                type: PreferenceTypes.RECEIVED_PREFERENCES,
                data: [previous],
            });
            dispatch(reportChannelEmojiError(error, REMOVE_ERROR_ID));
            return {error};
        }
    };
}
