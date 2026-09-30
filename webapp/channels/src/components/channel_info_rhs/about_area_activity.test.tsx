// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {Channel} from '@mattermost/types/channels';
import type {DeepPartial} from '@mattermost/types/utilities';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import type {GlobalState} from 'types/store';

import AboutAreaActivity from './about_area_activity';

jest.mock('components/timestamp', () => (props: {value: number}) => (
    <span data-testid='mock-timestamp'>{props.value}</span>
));

function getState(channelId: string, messageCount: number): DeepPartial<GlobalState> {
    return {
        entities: {
            channels: {
                messageCounts: {
                    [channelId]: {total: messageCount, root: messageCount},
                },
            },
            general: {
                config: {},
            },
            preferences: {
                myPreferences: {},
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {},
            },
        },
    };
}

describe('channel_info_rhs/about_area_activity', () => {
    const channelId = 'test-c-id';

    test('should show empty state when the channel has no messages', () => {
        const channel = {
            id: channelId,
            last_post_at: 0,
        } as Channel;

        renderWithContext(
            <AboutAreaActivity channel={channel}/>,
            getState(channelId, 0),
        );

        expect(screen.getByText('Activity')).toBeVisible();
        expect(screen.getByText('No messages yet')).toBeVisible();
        expect(screen.queryByText(/Last message/)).not.toBeInTheDocument();
        expect(screen.queryByTestId('mock-timestamp')).not.toBeInTheDocument();
    });

    test('should show message count and last activity from channel metadata', () => {
        const lastPostAt = 1700000000000;
        const channel = {
            id: channelId,
            last_post_at: lastPostAt,
        } as Channel;

        renderWithContext(
            <AboutAreaActivity channel={channel}/>,
            getState(channelId, 42),
        );

        expect(screen.getByText('42 messages')).toBeVisible();
        expect(screen.getByText(/Last message/)).toBeVisible();
        expect(screen.getByTestId('mock-timestamp')).toHaveTextContent(String(lastPostAt));
        expect(screen.queryByText('No messages yet')).not.toBeInTheDocument();
    });

    test('should singularize a single message', () => {
        const channel = {
            id: channelId,
            last_post_at: 1700000000000,
        } as Channel;

        renderWithContext(
            <AboutAreaActivity channel={channel}/>,
            getState(channelId, 1),
        );

        expect(screen.getByText('1 message')).toBeVisible();
    });

    test('should treat a missing message count as empty when last_post_at is unset', () => {
        const channel = {
            id: 'unknown-channel',
            last_post_at: 0,
        } as Channel;

        renderWithContext(
            <AboutAreaActivity channel={channel}/>,
            getState(channelId, 10),
        );

        expect(screen.getByText('No messages yet')).toBeVisible();
    });
});
