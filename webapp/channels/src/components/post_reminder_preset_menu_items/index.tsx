// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedDate, FormattedMessage, FormattedTime} from 'react-intl';

import * as Menu from 'components/menu';

import {PostReminderPresets, getPostReminderPresetTargetTime, postReminderPresetLabels} from 'utils/post_reminders';
import type {PostReminderPreset} from 'utils/post_reminders';

type Props = {
    idPrefix: string;
    isMilitaryTime: boolean;
    timezone?: string;
    onSelect: (preset: PostReminderPreset) => void;
}

// Renders the shared preset options (30 mins, 1 hour, 3 hours, tomorrow at
// 9:00 AM, and custom) used by both the "Remind me" submenu and the reminder
// DM's "Snooze" menu.
export default function PostReminderPresetMenuItems({idPrefix, isMilitaryTime, timezone, onSelect}: Props) {
    return (
        <>
            {Object.values(PostReminderPresets).map((preset) => {
                let trailingElements = null;
                if (preset === PostReminderPresets.TOMORROW) {
                    const tomorrow = getPostReminderPresetTargetTime(PostReminderPresets.TOMORROW, timezone).toDate();

                    trailingElements = (
                        <span>
                            <FormattedDate
                                value={tomorrow}
                                weekday='short'
                                timeZone={timezone}
                            />
                            {', '}
                            <FormattedTime
                                value={tomorrow}
                                timeStyle='short'
                                hour12={!isMilitaryTime}
                                timeZone={timezone}
                            />
                        </span>
                    );
                }

                return (
                    <Menu.Item
                        id={`${idPrefix}_${preset}`}
                        key={`${idPrefix}_${preset}`}
                        labels={<FormattedMessage {...postReminderPresetLabels[preset]}/>}
                        trailingElements={trailingElements}
                        onClick={() => onSelect(preset)}
                    />
                );
            })}
        </>
    );
}
