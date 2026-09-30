// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import type {Channel} from '@mattermost/types/channels';

import {getChannelMessageCount} from 'mattermost-redux/selectors/entities/channels';

import Timestamp from 'components/timestamp';

import type {GlobalState} from 'types/store';

const Activity = styled.div`
    margin-bottom: 12px;
`;

const Heading = styled.div`
    color: rgba(var(--center-channel-color-rgb), 0.75);
    font-size: 11px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px;
    letter-spacing: 0.24px;
    text-transform: uppercase;
    padding: 4px 0;
`;

const Row = styled.div`
    color: rgba(var(--center-channel-color-rgb), 0.75);
    font-size: 14px;
    line-height: 20px;
`;

type Props = {
    channel: Channel;
};

const AboutAreaActivity = ({channel}: Props) => {
    const messageCount = useSelector((state: GlobalState) => getChannelMessageCount(state, channel.id)?.total ?? 0);
    const lastPostAt = channel.last_post_at || 0;
    const isEmpty = messageCount === 0 && lastPostAt === 0;

    return (
        <Activity data-testid='channel_info_rhs-activity'>
            <Heading>
                <FormattedMessage
                    id='channel_info_rhs.about_area.activity.heading'
                    defaultMessage='Activity'
                />
            </Heading>
            {isEmpty && (
                <Row>
                    <FormattedMessage
                        id='channel_info_rhs.about_area.activity.no_messages'
                        defaultMessage='No messages yet'
                    />
                </Row>
            )}
            {!isEmpty && (
                <>
                    <Row>
                        <FormattedMessage
                            id='channel_info_rhs.about_area.activity.message_count'
                            defaultMessage='{count, plural, one {# message} other {# messages}}'
                            values={{count: messageCount}}
                        />
                    </Row>
                    {lastPostAt > 0 && (
                        <Row>
                            <FormattedMessage
                                id='channel_info_rhs.about_area.activity.last_message'
                                defaultMessage='Last message {timestamp}'
                                values={{
                                    timestamp: (
                                        <Timestamp
                                            value={lastPostAt}
                                            units={['now', 'minute', 'hour', 'day', 'week', 'month', 'year']}
                                            useTime={false}
                                            style={'short'}
                                        />
                                    ),
                                }}
                            />
                        </Row>
                    )}
                </>
            )}
        </Activity>
    );
};

export default AboutAreaActivity;
