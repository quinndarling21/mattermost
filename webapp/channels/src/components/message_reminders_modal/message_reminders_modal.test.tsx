// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {PostReminderListItem} from '@mattermost/types/posts';

import {Client4} from 'mattermost-redux/client';

import {renderWithContext, screen, userEvent, waitFor} from 'tests/react_testing_utils';
import {TestHelper} from 'utils/test_helper';

import MessageRemindersModal from './message_reminders_modal';

describe('components/message_reminders_modal/MessageRemindersModal', () => {
    const currentUserId = 'current_user_id';

    const reminders: PostReminderListItem[] = [
        {
            post_id: 'post_id_1',
            target_time: 1700000000,
            message: 'Please review the launch checklist',
            username: 'sara',
            team_name: 'team-1',
            channel_id: 'channel_id_1',
        },
        {
            post_id: 'post_id_2',
            target_time: 1700003600,
            message: 'Standup notes',
            username: 'devon',
            team_name: 'team-1',
            channel_id: 'channel_id_2',
        },
    ];

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

    const baseProps = {
        onExited: jest.fn(),
    };

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test('should render the pending reminders', async () => {
        jest.spyOn(Client4, 'getPostRemindersForUser').mockResolvedValue(reminders);

        renderWithContext(<MessageRemindersModal {...baseProps}/>, initialState);

        expect(await screen.findByText('Please review the launch checklist')).toBeInTheDocument();
        expect(screen.getByText('Standup notes')).toBeInTheDocument();
    });

    test('should render the empty state when there are no reminders', async () => {
        jest.spyOn(Client4, 'getPostRemindersForUser').mockResolvedValue([]);

        renderWithContext(<MessageRemindersModal {...baseProps}/>, initialState);

        expect(await screen.findByText('No pending reminders')).toBeInTheDocument();
    });

    test('should cancel a reminder and remove it from the list', async () => {
        jest.spyOn(Client4, 'getPostRemindersForUser').mockResolvedValue(reminders);
        const deletePostReminder = jest.spyOn(Client4, 'deletePostReminder').mockResolvedValue({status: 'OK'});

        renderWithContext(<MessageRemindersModal {...baseProps}/>, initialState);

        expect(await screen.findByText('Please review the launch checklist')).toBeInTheDocument();

        userEvent.click(screen.getByTestId('cancel_reminder_post_id_1'));

        await waitFor(() => {
            expect(deletePostReminder).toHaveBeenCalledWith(currentUserId, 'post_id_1');
        });
        await waitFor(() => {
            expect(screen.queryByText('Please review the launch checklist')).not.toBeInTheDocument();
        });
        expect(screen.getByText('Standup notes')).toBeInTheDocument();
    });
});
