// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ALL_DAYS_ENABLED, DEFAULT_QUIET_HOURS_SCHEDULE} from 'types/quiet_hours';
import type {QuietHoursSchedule} from 'types/quiet_hours';

import {
    parseTimeToMinutes,
    formatMinutesToTime,
    isWithinQuietHours,
    getMinutesUntilQuietHoursEnd,
    shouldSuppressNotification,
    formatScheduleSummary,
    getEnabledDayLabels,
    parseScheduleFromPreference,
} from './quiet_hours';

function makeSchedule(overrides: Partial<QuietHoursSchedule> = {}): QuietHoursSchedule {
    return {
        ...DEFAULT_QUIET_HOURS_SCHEDULE,
        days: [...ALL_DAYS_ENABLED],
        ...overrides,
    };
}

describe('quiet_hours', () => {
    describe('parseTimeToMinutes', () => {
        it('parses an evening time', () => {
            expect(parseTimeToMinutes('22:00')).toBe(1320);
        });

        it('parses a morning time with minutes', () => {
            expect(parseTimeToMinutes('07:30')).toBe(450);
        });

        it('parses midnight', () => {
            expect(parseTimeToMinutes('00:00')).toBe(0);
        });

        it('falls back to 0 for malformed input', () => {
            expect(parseTimeToMinutes('not-a-time')).toBe(0);
        });
    });

    describe('formatMinutesToTime', () => {
        it('formats morning time in 12-hour mode', () => {
            expect(formatMinutesToTime(570, false)).toBe('9:30 AM');
        });

        it('formats evening time in 12-hour mode', () => {
            expect(formatMinutesToTime(1320, false)).toBe('10:00 PM');
        });

        it('formats time in 24-hour mode', () => {
            expect(formatMinutesToTime(1320, true)).toBe('22:00');
            expect(formatMinutesToTime(570, true)).toBe('09:30');
        });
    });

    describe('isWithinQuietHours', () => {
        it('returns true during an overnight window after start', () => {
            const schedule = makeSchedule({startMinutes: 22 * 60, endMinutes: 7 * 60});
            const date = new Date(2025, 0, 6, 23, 0); // Monday 23:00
            expect(isWithinQuietHours(schedule, date)).toBe(true);
        });

        it('returns true during an overnight window before end', () => {
            const schedule = makeSchedule({startMinutes: 22 * 60, endMinutes: 7 * 60});
            const date = new Date(2025, 0, 6, 2, 0); // Monday 02:00
            expect(isWithinQuietHours(schedule, date)).toBe(true);
        });

        it('returns false outside an overnight window', () => {
            const schedule = makeSchedule({startMinutes: 22 * 60, endMinutes: 7 * 60});
            const date = new Date(2025, 0, 6, 12, 0); // Monday noon
            expect(isWithinQuietHours(schedule, date)).toBe(false);
        });

        it('returns true inside a same-day window', () => {
            const schedule = makeSchedule({startMinutes: 9 * 60, endMinutes: 17 * 60});
            const date = new Date(2025, 0, 6, 10, 0);
            expect(isWithinQuietHours(schedule, date)).toBe(true);
        });

        it('returns false before a same-day window starts', () => {
            const schedule = makeSchedule({startMinutes: 9 * 60, endMinutes: 17 * 60});
            const date = new Date(2025, 0, 6, 8, 0);
            expect(isWithinQuietHours(schedule, date)).toBe(false);
        });
    });

    describe('getMinutesUntilQuietHoursEnd', () => {
        it('computes time remaining across midnight', () => {
            const schedule = makeSchedule({startMinutes: 22 * 60, endMinutes: 7 * 60});
            const date = new Date(2025, 0, 6, 23, 0);
            expect(getMinutesUntilQuietHoursEnd(schedule, date)).toBe(480);
        });

        it('computes time remaining same morning', () => {
            const schedule = makeSchedule({startMinutes: 22 * 60, endMinutes: 7 * 60});
            const date = new Date(2025, 0, 6, 6, 0);
            expect(getMinutesUntilQuietHoursEnd(schedule, date)).toBe(60);
        });
    });

    describe('shouldSuppressNotification', () => {
        const within = new Date(2025, 0, 6, 23, 0);

        it('does not suppress when disabled', () => {
            const schedule = makeSchedule({enabled: false, startMinutes: 22 * 60, endMinutes: 7 * 60});
            expect(shouldSuppressNotification(schedule, false, within)).toBe(false);
        });

        it('suppresses a normal message during quiet hours', () => {
            const schedule = makeSchedule({enabled: true, startMinutes: 22 * 60, endMinutes: 7 * 60});
            expect(shouldSuppressNotification(schedule, false, within)).toBe(true);
        });

        it('lets urgent messages through when allowUrgent is set', () => {
            const schedule = makeSchedule({enabled: true, allowUrgent: true, startMinutes: 22 * 60, endMinutes: 7 * 60});
            expect(shouldSuppressNotification(schedule, true, within)).toBe(false);
        });

        it('suppresses urgent messages when allowUrgent is off', () => {
            const schedule = makeSchedule({enabled: true, allowUrgent: false, startMinutes: 22 * 60, endMinutes: 7 * 60});
            expect(shouldSuppressNotification(schedule, true, within)).toBe(true);
        });
    });

    describe('formatScheduleSummary', () => {
        it('summarizes the default window', () => {
            expect(formatScheduleSummary(DEFAULT_QUIET_HOURS_SCHEDULE, false)).toBe('10:00 PM \u2013 7:00 AM');
        });
    });

    describe('getEnabledDayLabels', () => {
        it('returns a label for every enabled day', () => {
            const schedule = makeSchedule({days: [...ALL_DAYS_ENABLED]});
            expect(getEnabledDayLabels(schedule)).toHaveLength(7);
        });

        it('returns no labels when nothing is enabled', () => {
            const schedule = makeSchedule({days: [false, false, false, false, false, false, false]});
            expect(getEnabledDayLabels(schedule)).toHaveLength(0);
        });
    });

    describe('parseScheduleFromPreference', () => {
        it('returns defaults for empty input', () => {
            expect(parseScheduleFromPreference('')).toEqual(DEFAULT_QUIET_HOURS_SCHEDULE);
        });

        it('round-trips a serialized schedule', () => {
            const schedule = makeSchedule({enabled: true, startMinutes: 21 * 60, endMinutes: 6 * 60});
            expect(parseScheduleFromPreference(JSON.stringify(schedule))).toEqual(schedule);
        });

        it('returns defaults for malformed JSON', () => {
            expect(parseScheduleFromPreference('{not json')).toEqual(DEFAULT_QUIET_HOURS_SCHEDULE);
        });
    });
});
