// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'mattermost-redux/selectors/create_selector';
import {get as getPreference} from 'mattermost-redux/selectors/entities/preferences';

import {Preferences} from 'utils/constants';
import {isWithinQuietHours, parseScheduleFromPreference} from 'utils/quiet_hours';

import type {QuietHoursSchedule} from 'types/quiet_hours';
import type {GlobalState} from 'types/store';

const getRawQuietHoursPreference = (state: GlobalState): string => getPreference(
    state,
    Preferences.CATEGORY_QUIET_HOURS,
    Preferences.QUIET_HOURS_SCHEDULE,
    '',
);

/**
 * Returns the current user's quiet hours schedule, parsed from preferences.
 */
export const getQuietHoursSchedule: (state: GlobalState) => QuietHoursSchedule = createSelector(
    'getQuietHoursSchedule',
    getRawQuietHoursPreference,
    (raw) => parseScheduleFromPreference(raw),
);

/**
 * Returns whether quiet hours are enabled for the current user.
 */
export function isQuietHoursEnabled(state: GlobalState): boolean {
    return getQuietHoursSchedule(state).enabled;
}

/**
 * Returns whether the current user is inside their quiet window right now.
 */
export function isQuietHoursActiveNow(state: GlobalState): boolean {
    const schedule = getQuietHoursSchedule(state);

    if (!schedule.enabled) {
        return false;
    }

    return isWithinQuietHours(schedule, new Date());
}
