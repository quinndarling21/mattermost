// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {PostType} from '@mattermost/types/posts';

import {Client4} from 'mattermost-redux/client';

import * as modalActions from 'actions/views/modals';

import {renderWithContext, screen, userEvent, waitFor} from 'tests/react_testing_utils';
import {ModalIdentifiers} from 'utils/constants';
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
        expect(addPostReminder.mock.invocationCallOrder[0]).toBeLessThan(dismissPostReminder.mock.invocationCallOrder[0]);
    });

    test('should not dismiss the reminder DM when snooze scheduling fails', async () => {
        jest.spyOn(Client4, 'addPostReminder').mockRejectedValue(new Error('failed'));
        const dismissPostReminder = jest.spyOn(Client4, 'dismissPostReminder').mockResolvedValue({status: 'OK'});

        renderWithContext(<PostReminderActions post={post}/>, initialState);

        userEvent.click(screen.getByText('Snooze'));
        userEvent.click(await screen.findByText('1 hour'));

        await waitFor(() => {
            expect(Client4.addPostReminder).toHaveBeenCalled();
        });
        expect(dismissPostReminder).not.toHaveBeenCalled();
    });

    test('should dismiss the reminder DM after a successful custom snooze', async () => {
        const openModal = jest.spyOn(modalActions, 'openModal');
        const dismissPostReminder = jest.spyOn(Client4, 'dismissPostReminder').mockResolvedValue({status: 'OK'});

        renderWithContext(<PostReminderActions post={post}/>, initialState);

        userEvent.click(screen.getByText('Snooze'));
        userEvent.click(await screen.findByText('Custom'));

        await waitFor(() => {
            expect(openModal).toHaveBeenCalledWith(expect.objectContaining({
                modalId: ModalIdentifiers.POST_REMINDER_CUSTOM_TIME_PICKER,
                dialogProps: expect.objectContaining({
                    postId: 'original_post_id',
                    onSuccess: expect.any(Function),
                }),
            }));
        });

        const {onSuccess} = openModal.mock.calls[0][0].dialogProps as {onSuccess: () => void};
        onSuccess();

        await waitFor(() => {
            expect(dismissPostReminder).toHaveBeenCalledWith(post.id);
        });
    });
});
