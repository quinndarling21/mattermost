// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {FormattedDate, FormattedMessage, FormattedTime, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {ClockOutlineIcon, TrashCanOutlineIcon} from '@mattermost/compass-icons/components';
import {GenericModal} from '@mattermost/components';
import {Button} from '@mattermost/shared/components/button';
import {WithTooltip} from '@mattermost/shared/components/tooltip';
import type {PostReminderListItem} from '@mattermost/types/posts';

import {deletePostReminder, getPostRemindersForUser} from 'mattermost-redux/actions/posts';
import {Preferences} from 'mattermost-redux/constants';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {closeModal} from 'actions/views/modals';

import LoadingSpinner from 'components/widgets/loading/loading_spinner';

import {getHistory} from 'utils/browser_history';
import {ModalIdentifiers} from 'utils/constants';

import type {GlobalState} from 'types/store';

import './message_reminders_modal.scss';

type Props = {
    onExited: () => void;
}

// A simple list of the user's pending message reminders, with the option to
// jump to the original message or cancel a reminder before it is delivered.
export default function MessageRemindersModal({onExited}: Props) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const userId = useSelector(getCurrentUserId);
    const timezone = useSelector(getCurrentTimezone);
    const isMilitaryTime = useSelector((state: GlobalState) => getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.USE_MILITARY_TIME, false));
    const currentTeamName = useSelector(getCurrentTeam)?.name ?? '';

    const [reminders, setReminders] = useState<PostReminderListItem[] | undefined>();

    useEffect(() => {
        let mounted = true;
        dispatch(getPostRemindersForUser(userId)).then(({data}) => {
            if (mounted) {
                setReminders(data ?? []);
            }
        });
        return () => {
            mounted = false;
        };
    }, [dispatch, userId]);

    const handleCancelReminder = useCallback(async (postId: string) => {
        const {error} = await dispatch(deletePostReminder(userId, postId));
        if (!error) {
            setReminders((prev) => prev?.filter((reminder) => reminder.post_id !== postId));
        }
    }, [dispatch, userId]);

    const handleViewMessage = useCallback((reminder: PostReminderListItem) => {
        getHistory().push(`/${reminder.team_name || currentTeamName}/pl/${reminder.post_id}`);
        dispatch(closeModal(ModalIdentifiers.MESSAGE_REMINDERS));
    }, [currentTeamName, dispatch]);

    let content;
    if (reminders === undefined) {
        content = (
            <div className='MessageRemindersModal__loading'>
                <LoadingSpinner/>
            </div>
        );
    } else if (reminders.length === 0) {
        content = (
            <div className='MessageRemindersModal__empty'>
                <ClockOutlineIcon size={40}/>
                <h2 className='MessageRemindersModal__empty-title'>
                    <FormattedMessage
                        id='message_reminders_modal.empty.title'
                        defaultMessage='No pending reminders'
                    />
                </h2>
                <p className='MessageRemindersModal__empty-subtitle'>
                    <FormattedMessage
                        id='message_reminders_modal.empty.subtitle'
                        defaultMessage='Select Remind me from a message’s actions menu and Mattermost will send you a direct message about it at the time you choose.'
                    />
                </p>
            </div>
        );
    } else {
        content = (
            <ul className='MessageRemindersModal__list'>
                {reminders.map((reminder) => {
                    const dueTime = new Date(reminder.target_time * 1000);

                    return (
                        <li
                            className='MessageRemindersModal__item'
                            key={reminder.post_id}
                            data-testid={`message_reminder_${reminder.post_id}`}
                        >
                            <div className='MessageRemindersModal__item-content'>
                                <span className='MessageRemindersModal__item-message'>{reminder.message}</span>
                                <span className='MessageRemindersModal__item-meta'>
                                    <FormattedMessage
                                        id='message_reminders_modal.item_meta'
                                        defaultMessage='From @{username} • Due {date} at {time}'
                                        values={{
                                            username: reminder.username,
                                            date: (
                                                <FormattedDate
                                                    value={dueTime}
                                                    weekday='short'
                                                    day='numeric'
                                                    month='short'
                                                    timeZone={timezone}
                                                />
                                            ),
                                            time: (
                                                <FormattedTime
                                                    value={dueTime}
                                                    timeStyle='short'
                                                    hour12={!isMilitaryTime}
                                                    timeZone={timezone}
                                                />
                                            ),
                                        }}
                                    />
                                </span>
                            </div>
                            <div className='MessageRemindersModal__item-actions'>
                                <Button
                                    emphasis='tertiary'
                                    size='sm'
                                    onClick={() => handleViewMessage(reminder)}
                                >
                                    <FormattedMessage
                                        id='message_reminders_modal.view_message'
                                        defaultMessage='View message'
                                    />
                                </Button>
                                <WithTooltip
                                    title={
                                        <FormattedMessage
                                            id='message_reminders_modal.cancel_reminder'
                                            defaultMessage='Cancel reminder'
                                        />
                                    }
                                >
                                    <Button
                                        emphasis='tertiary'
                                        size='sm'
                                        variant='destructive'
                                        className='MessageRemindersModal__cancel'
                                        onClick={() => handleCancelReminder(reminder.post_id)}
                                        aria-label={formatMessage({
                                            id: 'message_reminders_modal.cancel_reminder',
                                            defaultMessage: 'Cancel reminder',
                                        })}
                                        data-testid={`cancel_reminder_${reminder.post_id}`}
                                    >
                                        <TrashCanOutlineIcon size={16}/>
                                    </Button>
                                </WithTooltip>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <GenericModal
            id='messageRemindersModal'
            className='MessageRemindersModal'
            modalHeaderText={
                <FormattedMessage
                    id='message_reminders_modal.title'
                    defaultMessage='Message reminders'
                />
            }
            ariaLabel={formatMessage({
                id: 'message_reminders_modal.title',
                defaultMessage: 'Message reminders',
            })}
            compassDesign={true}
            onExited={onExited}
        >
            {content}
        </GenericModal>
    );
}
