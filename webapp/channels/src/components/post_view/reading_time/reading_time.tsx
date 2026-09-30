// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {useIntl} from 'react-intl';

import {WithTooltip} from '@mattermost/shared/components/tooltip';

import './reading_time.scss';

type Props = {
    minutes: number;
};

function ReadingTime({minutes}: Props) {
    const {formatMessage} = useIntl();

    const label = formatMessage(
        {
            id: 'post.reading_time.label',
            defaultMessage: '· {minutes} min read',
        },
        {minutes},
    );
    const tooltip = formatMessage(
        {
            id: 'post.reading_time.tooltip',
            defaultMessage: 'About {minutes} minutes to read',
        },
        {minutes},
    );

    return (
        <WithTooltip title={tooltip}>
            <span
                className='ReadingTime'
                data-testid='post-reading-time'
            >
                {label}
            </span>
        </WithTooltip>
    );
}

export default memo(ReadingTime);
