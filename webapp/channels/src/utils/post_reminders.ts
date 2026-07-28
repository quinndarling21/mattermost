// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Moment} from 'moment-timezone';
import {defineMessages} from 'react-intl';
import type {MessageDescriptor} from 'react-intl';

import {getCurrentMomentForTimezone} from 'utils/timezone';

export const PostReminderPresets = {
    THIRTY_MINUTES: 'thirty_minutes',
    ONE_HOUR: 'one_hour',
    THREE_HOURS: 'three_hours',
    TOMORROW: 'tomorrow',
    CUSTOM: 'custom',
} as const;

export type PostReminderPreset = typeof PostReminderPresets[keyof typeof PostReminderPresets];

export const postReminderPresetLabels: Record<PostReminderPreset, MessageDescriptor> = defineMessages({
    thirty_minutes: {
        id: 'post_info.post_reminder.sub_menu.thirty_minutes',
        defaultMessage: '30 mins',
    },
    one_hour: {
        id: 'post_info.post_reminder.sub_menu.one_hour',
        defaultMessage: '1 hour',
    },
    three_hours: {
        id: 'post_info.post_reminder.sub_menu.three_hours',
        defaultMessage: '3 hours',
    },
    tomorrow: {
        id: 'post_info.post_reminder.sub_menu.tomorrow',
        defaultMessage: 'Tomorrow',
    },
    custom: {
        id: 'post_info.post_reminder.sub_menu.custom',
        defaultMessage: 'Custom',
    },
});

// Returns the reminder target time for a non-custom preset, in the user's timezone.
export function getPostReminderPresetTargetTime(preset: PostReminderPreset, timezone?: string): Moment {
    const currentDate = getCurrentMomentForTimezone(timezone);

    switch (preset) {
    case PostReminderPresets.THIRTY_MINUTES:
        return currentDate.add(30, 'minutes');
    case PostReminderPresets.ONE_HOUR:
        return currentDate.add(1, 'hour');
    case PostReminderPresets.THREE_HOURS:
        return currentDate.add(3, 'hours');
    case PostReminderPresets.TOMORROW:
        return currentDate.add(1, 'day').set({hour: 9, minute: 0});
    default:
        return currentDate;
    }
}
