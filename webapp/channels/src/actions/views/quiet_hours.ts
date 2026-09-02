// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {PreferenceType} from '@mattermost/types/preferences';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {Preferences} from 'utils/constants';

import type {QuietHoursSchedule} from 'types/quiet_hours';
import type {ActionFuncAsync} from 'types/store';

/**
 * Persists the current user's quiet hours schedule to their preferences.
 */
export function saveQuietHoursSchedule(schedule: QuietHoursSchedule): ActionFuncAsync {
    return async (dispatch, getState) => {
        const currentUserId = getCurrentUserId(getState());

        const preference: PreferenceType = {
            user_id: currentUserId,
            category: Preferences.CATEGORY_QUIET_HOURS,
            name: Preferences.QUIET_HOURS_SCHEDULE,
            value: JSON.stringify(schedule),
        };

        return dispatch(savePreferences(currentUserId, [preference]));
    };
}
