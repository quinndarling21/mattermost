// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {Channel} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users';
import type {DeepPartial} from '@mattermost/types/utilities';

import {renderWithContext, screen} from 'tests/react_testing_utils';
import Constants from 'utils/constants';

import type {GlobalState} from 'types/store';

import AboutArea from './about_area';
import type {DMUser} from './channel_info_rhs';

jest.mock('components/timestamp', () => (props: {value: number}) => (
    <span data-testid='mock-timestamp'>{props.value}</span>
));

const channelId = 'test-c-id';

const initialState: DeepPartial<GlobalState> = {
    entities: {
        channels: {
            messageCounts: {
                [channelId]: {total: 7, root: 7},
            },
        },
        general: {
            config: {PostEditTimeLimit: '-1'},
            license: {IsLicensed: 'false'},
        },
        preferences: {
            myPreferences: {},
        },
        users: {
            currentUserId: 'current_user_id',
            profiles: {
                'test-u-id': {id: 'test-u-id', username: 'other-user'},
            },
        },
        emojis: {customEmoji: {}},
        groups: {
            groups: {},
            syncables: {},
            myGroups: [],
            stats: {},
        },
        roles: {
            roles: {},
        },
        teams: {
            currentTeamId: 'team-id',
            teams: {},
        },
    },
};

const actions = {
    editChannelName: jest.fn(),
    editChannelPurpose: jest.fn(),
    editChannelHeader: jest.fn(),
};

describe('channel_info_rhs/about_area', () => {
    test.each([
        Constants.OPEN_CHANNEL,
        Constants.PRIVATE_CHANNEL,
    ])('should show activity summary for %s channels', (type) => {
        const channel = {
            id: channelId,
            name: 'my-channel',
            display_name: 'My Channel',
            header: '',
            purpose: '',
            type,
            last_post_at: 1700000000000,
        } as Channel;

        renderWithContext(
            <AboutArea
                channel={channel}
                canEditChannelProperties={false}
                actions={actions}
            />,
            initialState,
        );

        expect(screen.getByText('7 messages')).toBeVisible();
        expect(screen.getByText(/Last message/)).toBeVisible();
    });

    test('should show activity summary for DMs', () => {
        const channel = {
            id: channelId,
            name: 'current_user_id__test-u-id',
            display_name: 'Other User',
            header: '',
            type: Constants.DM_CHANNEL,
            last_post_at: 1700000000000,
        } as Channel;
        const dmUser = {
            user: {
                id: 'test-u-id',
                username: 'other-user',
                last_picture_update: 0,
            } as UserProfile,
            display_name: 'Other User',
            is_guest: false,
            status: 'online',
        } as DMUser;

        renderWithContext(
            <AboutArea
                channel={channel}
                dmUser={dmUser}
                canEditChannelProperties={false}
                actions={actions}
            />,
            initialState,
        );

        expect(screen.getByText('7 messages')).toBeVisible();
    });

    test('should show empty activity for a never-posted GM', () => {
        const channel = {
            id: 'empty-gm',
            name: 'gm-channel',
            display_name: 'gm',
            header: '',
            type: Constants.GM_CHANNEL,
            last_post_at: 0,
        } as Channel;

        renderWithContext(
            <AboutArea
                channel={channel}
                gmUsers={[{id: 'test-u-id', username: 'other-user'} as UserProfile]}
                canEditChannelProperties={false}
                actions={actions}
            />,
            initialState,
        );

        expect(screen.getByText('No messages yet')).toBeVisible();
    });
});
