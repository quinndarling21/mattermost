// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {getQuietHoursSchedule} from 'selectors/quiet_hours';

import {getMinutesUntilQuietHoursEnd, isWithinQuietHours} from 'utils/quiet_hours';

interface QuietHoursStatus {
    active: boolean;
    minutesUntilEnd: number;
}

// How often the quiet-hours status is recomputed, in milliseconds.
const REFRESH_INTERVAL_MS = 60 * 1000;

/**
 * Tracks whether the current user is inside their quiet window and how long
 * until it ends, refreshing once a minute.
 */
export function useQuietHours(): QuietHoursStatus {
    const schedule = useSelector(getQuietHoursSchedule);

    const [status, setStatus] = useState<QuietHoursStatus>(() => {
        const now = new Date();
        const active = schedule.enabled && isWithinQuietHours(schedule, now);
        return {
            active,
            minutesUntilEnd: active ? getMinutesUntilQuietHoursEnd(schedule, now) : 0,
        };
    });

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const active = schedule.enabled && isWithinQuietHours(schedule, now);
            setStatus({
                active,
                minutesUntilEnd: active ? getMinutesUntilQuietHoursEnd(schedule, now) : 0,
            });
        };

        update();
        setInterval(update, REFRESH_INTERVAL_MS);
    }, [schedule]);

    return status;
}
