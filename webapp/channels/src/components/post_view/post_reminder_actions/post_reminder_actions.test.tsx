// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {PostType} from '@mattermost/types/posts';

import {Client4} from 'mattermost-redux/client';

import {renderWithContext, screen, userEvent, waitFor} from 'tests/react_testing_utils';
import {TestHelper} from 'utils/test_helper';

import PostReminderActions from './post_reminder_actions';

describe('components/post_view/PostReminderActions', () => {
    const currentUserId = 'current_user_id';

    const post = TestHelper.getPostMock({
        id: 'reminder_dm_id',
        type: 'reminder' as PostType,
        props: {
            post_id: 'original_post_id',
            username: 'other_user',
            team_name: 'team-1',
        },
    });

    const initialState = {
        entities: {
            users: {
                currentUserId,
                profiles: {
                    [currentUserId]: TestHelper.getUserMock({id: currentUserId}),
                },
            },
        },
    };

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test('should render Done and Snooze actions', () => {
        renderWithContext(<PostReminderActions post={post}/>, initialState);

        expect(screen.getByText('Done')).toBeInTheDocument();
        expect(screen.getByText('Snooze')).toBeInTheDocument();
    });

    test('should not render Snooze without an original post id', () => {
        const postWithoutTarget = {...post, props: {}};
        renderWithContext(<PostReminderActions post={postWithoutTarget}/>, initialState);

        expect(screen.getByText('Done')).toBeInTheDocument();
        expect(screen.queryByText('Snooze')).not.toBeInTheDocument();
    });

    test('should dismiss the reminder DM when Done is clicked', async () => {
        const dismissPostReminder = jest.spyOn(Client4, 'dismissPostReminder').mockResolvedValue({status: 'OK'});

        renderWithContext(<PostReminderActions post={post}/>, initialState);

        userEvent.click(screen.getByText('Done'));

        await waitFor(() => {
            expect(dismissPostReminder).toHaveBeenCalledWith(post.id);
        });
    });

    test('should schedule a new reminder for the original post and dismiss the DM when snoozing', async () => {
        const addPostReminder = jest.spyOn(Client4, 'addPostReminder').mockResolvedValue({status: 'OK'});
        const dismissPostReminder = jest.spyOn(Client4, 'dismissPostReminder').mockResolvedValue({status: 'OK'});

        renderWithContext(<PostReminderActions post={post}/>, initialState);

        userEvent.click(screen.getByText('Snooze'));

        expect(await screen.findByText('Snooze until:')).toBeInTheDocument();
        expect(screen.getByText('30 mins')).toBeInTheDocument();
        expect(screen.getByText('1 hour')).toBeInTheDocument();
        expect(screen.getByText('3 hours')).toBeInTheDocument();
        expect(screen.getByText('Tomorrow')).toBeInTheDocument();
        expect(screen.getByText('Custom')).toBeInTheDocument();

        userEvent.click(screen.getByText('1 hour'));

        await waitFor(() => {
            expect(addPostReminder).toHaveBeenCalledWith(currentUserId, 'original_post_id', expect.any(Number));
        });
        await waitFor(() => {
            expect(dismissPostReminder).toHaveBeenCalledWith(post.id);
        });
    });
});
