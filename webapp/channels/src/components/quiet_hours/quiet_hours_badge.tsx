// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {useIntl} from 'react-intl';

import {BellOffOutlineIcon} from '@mattermost/compass-icons/components';

import {useQuietHours} from 'hooks/useQuietHours';

import './quiet_hours.scss';

/**
 * A small badge shown while the current user's quiet hours are active. Displays
 * how much longer notifications will stay muted.
 */
const QuietHoursBadge = () => {
    const {formatMessage} = useIntl();
    const {active, minutesUntilEnd} = useQuietHours();

    if (!active) {
        return null;
    }

    const hours = Math.floor(minutesUntilEnd / 60);
    const minutes = minutesUntilEnd % 60;

    const label = hours > 0 ? formatMessage(
        {
            id: 'quiet_hours.badge.remaining_hours',
            defaultMessage: 'Quiet hours · {hours}h {minutes}m left',
        },
        {hours, minutes},
    ) : formatMessage(
        {
            id: 'quiet_hours.badge.remaining_minutes',
            defaultMessage: 'Quiet hours · {minutes}m left',
        },
        {minutes},
    );

    return (
        <div
            className='QuietHoursBadge'
            aria-label={label}
        >
            <BellOffOutlineIcon
                size={12}
                className='QuietHoursBadge__icon'
            />
            <span className='QuietHoursBadge__text'>{label}</span>
        </div>
    );
};

export default memo(QuietHoursBadge);
