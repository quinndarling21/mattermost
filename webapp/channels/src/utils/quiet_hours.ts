// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {QuietHoursSchedule} from 'types/quiet_hours';
import {DEFAULT_QUIET_HOURS_SCHEDULE} from 'types/quiet_hours';

const MINUTES_PER_DAY = 24 * 60;

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Parses a "HH:MM" 24-hour time string into minutes from midnight.
 * @param value - Time string such as "22:00" or "07:30"
 * @returns Minutes from midnight (0-1439)
 */
export function parseTimeToMinutes(value: string): number {
    const [hoursPart, minutesPart] = value.split(':');
    const hours = parseInt(hoursPart, 10);
    const minutes = parseInt(minutesPart, 10);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return 0;
    }

    return (hours * 60) + minutes;
}

/**
 * Formats minutes from midnight into a displayable time string.
 * @param minutes - Minutes from midnight (0-1439)
 * @param militaryTime - Whether to use 24-hour formatting
 * @returns Formatted time like "10:00 PM" or "22:00"
 */
export function formatMinutesToTime(minutes: number, militaryTime: boolean): string {
    const normalized = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    const hours = Math.floor(normalized / 60);
    const mins = normalized % 60;

    if (militaryTime) {
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12;

    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

/**
 * Returns whether the given date falls within the schedule's quiet window.
 * Handles windows that span midnight (start later than end).
 * @param schedule - The quiet hours schedule
 * @param date - The point in time to test
 */
export function isWithinQuietHours(schedule: QuietHoursSchedule, date: Date): boolean {
    if (!schedule.days[date.getDay()]) {
        return false;
    }

    const minutesNow = (date.getHours() * 60) + date.getMinutes();
    const {startMinutes, endMinutes} = schedule;

    // Window that spans midnight, e.g. 22:00 -> 07:00.
    if (startMinutes > endMinutes) {
        return minutesNow >= startMinutes || minutesNow < endMinutes;
    }

    return minutesNow >= startMinutes && minutesNow < endMinutes;
}

/**
 * Returns the number of minutes remaining until the quiet window ends.
 * @param schedule - The quiet hours schedule
 * @param date - The current point in time
 */
export function getMinutesUntilQuietHoursEnd(schedule: QuietHoursSchedule, date: Date): number {
    const minutesNow = (date.getHours() * 60) + date.getMinutes();
    let diff = schedule.endMinutes - minutesNow;

    if (diff <= 0) {
        diff += MINUTES_PER_DAY;
    }

    return diff;
}

/**
 * Determines whether a notification should be suppressed right now.
 * @param schedule - The quiet hours schedule
 * @param isUrgent - Whether the incoming message is flagged urgent
 * @param date - The current point in time
 */
export function shouldSuppressNotification(schedule: QuietHoursSchedule, isUrgent: boolean, date: Date): boolean {
    if (!schedule.enabled) {
        return false;
    }

    if (isUrgent && schedule.allowUrgent) {
        return false;
    }

    return isWithinQuietHours(schedule, date);
}

/**
 * Builds a human readable summary of the quiet window, e.g. "10:00 PM – 7:00 AM".
 * @param schedule - The quiet hours schedule
 * @param militaryTime - Whether to use 24-hour formatting
 */
export function formatScheduleSummary(schedule: QuietHoursSchedule, militaryTime: boolean): string {
    const start = formatMinutesToTime(schedule.startMinutes, militaryTime);
    const end = formatMinutesToTime(schedule.endMinutes, militaryTime);

    return `${start} \u2013 ${end}`;
}

/**
 * Returns short labels for the days the schedule is active on.
 * @param schedule - The quiet hours schedule
 */
export function getEnabledDayLabels(schedule: QuietHoursSchedule): string[] {
    return schedule.days.
        map((enabled, index) => (enabled ? DAY_LABELS[index] : null)).
        filter((label): label is string => label !== null);
}

/**
 * Parses a stored preference value into a schedule, falling back to defaults
 * for any missing or malformed fields.
 * @param raw - The raw JSON string stored in preferences
 */
export function parseScheduleFromPreference(raw: string): QuietHoursSchedule {
    if (!raw) {
        return {...DEFAULT_QUIET_HOURS_SCHEDULE};
    }

    try {
        const parsed = JSON.parse(raw) as Partial<QuietHoursSchedule>;

        return {
            enabled: parsed.enabled ?? DEFAULT_QUIET_HOURS_SCHEDULE.enabled,
            startMinutes: parsed.startMinutes ?? DEFAULT_QUIET_HOURS_SCHEDULE.startMinutes,
            endMinutes: parsed.endMinutes ?? DEFAULT_QUIET_HOURS_SCHEDULE.endMinutes,
            days: parsed.days ?? DEFAULT_QUIET_HOURS_SCHEDULE.days,
            allowUrgent: parsed.allowUrgent ?? DEFAULT_QUIET_HOURS_SCHEDULE.allowUrgent,
            autoReplyMessage: parsed.autoReplyMessage ?? DEFAULT_QUIET_HOURS_SCHEDULE.autoReplyMessage,
        };
    } catch {
        return {...DEFAULT_QUIET_HOURS_SCHEDULE};
    }
}
