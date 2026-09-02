// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// QuietHoursSchedule represents a user's configured quiet hours window during
// which desktop and push notifications are suppressed.
export type QuietHoursSchedule = {

    // Whether quiet hours are enabled at all.
    enabled: boolean;

    // Start of the quiet window, expressed as minutes from midnight (0-1439).
    startMinutes: number;

    // End of the quiet window, expressed as minutes from midnight (0-1439).
    // When endMinutes is less than or equal to startMinutes the window is
    // treated as spanning midnight (e.g. 22:00 -> 07:00).
    endMinutes: number;

    // The days the schedule is active on. Index 0 is Sunday, matching
    // JavaScript's Date.getDay().
    days: boolean[];

    // When true, messages flagged as urgent still notify during quiet hours.
    allowUrgent: boolean;

    // Optional auto-reply shown to people who message you during quiet hours.
    autoReplyMessage: string;
};

export const ALL_DAYS_ENABLED: boolean[] = [true, true, true, true, true, true, true];

export const WEEKDAYS_ONLY: boolean[] = [false, true, true, true, true, true, false];

// 22:00 -> 07:00, every day, urgent messages allowed through.
export const DEFAULT_QUIET_HOURS_SCHEDULE: QuietHoursSchedule = {
    enabled: false,
    startMinutes: 22 * 60,
    endMinutes: 7 * 60,
    days: ALL_DAYS_ENABLED,
    allowUrgent: true,
    autoReplyMessage: '',
};
