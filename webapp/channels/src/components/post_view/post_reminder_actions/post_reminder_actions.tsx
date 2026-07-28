// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {CheckIcon, ChevronDownIcon, ClockOutlineIcon} from '@mattermost/compass-icons/components';
import {Button, buttonClassNames} from '@mattermost/shared/components/button';
import type {Post} from '@mattermost/types/posts';

import {addPostReminder, dismissPostReminder} from 'mattermost-redux/actions/posts';
import {Preferences} from 'mattermost-redux/constants';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {openModal} from 'actions/views/modals';

import * as Menu from 'components/menu';
import PostReminderCustomTimePicker from 'components/post_reminder_custom_time_picker_modal';
import PostReminderPresetMenuItems from 'components/post_reminder_preset_menu_items';

import {ModalIdentifiers} from 'utils/constants';
import {toUTCUnixInSeconds} from 'utils/datetime';
import {PostReminderPresets, getPostReminderPresetTargetTime} from 'utils/post_reminders';
import type {PostReminderPreset} from 'utils/post_reminders';

import type {GlobalState} from 'types/store';

import './post_reminder_actions.scss';

type Props = {

    // The reminder DM post from the system bot.
    post: Post;
}

// Done and Snooze actions shown on a reminder DM from the system bot. Done
// dismisses the reminder message; Snooze re-offers the preset menu and
// schedules a new reminder for the original post.
export default function PostReminderActions({post}: Props) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const userId = useSelector(getCurrentUserId);
    const timezone = useSelector(getCurrentTimezone);
    const isMilitaryTime = useSelector((state: GlobalState) => getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.USE_MILITARY_TIME, false));

    const targetPostId = typeof post.props?.post_id === 'string' ? post.props.post_id : '';

    const handleDone = useCallback(() => {
        dispatch(dismissPostReminder(post.id));
    }, [dispatch, post.id]);

    const handleSnooze = useCallback((preset: PostReminderPreset) => {
        if (preset === PostReminderPresets.CUSTOM) {
            // The custom picker schedules on confirm; the reminder DM stays
            // visible so the user can still mark it done if they cancel.
            dispatch(openModal({
                modalId: ModalIdentifiers.POST_REMINDER_CUSTOM_TIME_PICKER,
                dialogType: PostReminderCustomTimePicker,
                dialogProps: {
                    postId: targetPostId,
                },
            }));
            return;
        }

        const endTime = getPostReminderPresetTargetTime(preset, timezone);
        dispatch(addPostReminder(userId, targetPostId, toUTCUnixInSeconds(endTime.toDate())));
        dispatch(dismissPostReminder(post.id));
    }, [dispatch, post.id, targetPostId, timezone, userId]);

    return (
        <div className='PostReminderActions'>
            <Button
                emphasis='tertiary'
                size='sm'
                onClick={handleDone}
                data-testid={`post_reminder_done_${post.id}`}
            >
                <CheckIcon size={16}/>
                <FormattedMessage
                    id='post_info.post_reminder.done'
                    defaultMessage='Done'
                />
            </Button>
            {targetPostId && (
                <Menu.Container
                    menuButton={{
                        id: `post_reminder_snooze_${post.id}`,
                        dataTestId: `post_reminder_snooze_${post.id}`,
                        class: buttonClassNames({emphasis: 'tertiary', size: 'sm'}),
                        children: (
                            <>
                                <ClockOutlineIcon size={16}/>
                                <FormattedMessage
                                    id='post_info.post_reminder.snooze'
                                    defaultMessage='Snooze'
                                />
                                <ChevronDownIcon size={16}/>
                            </>
                        ),
                        'aria-label': formatMessage({
                            id: 'post_info.post_reminder.snooze.aria_label',
                            defaultMessage: 'Snooze this reminder',
                        }),
                    }}
                    menu={{
                        id: `post_reminder_snooze_${post.id}-menu`,
                        'aria-label': formatMessage({
                            id: 'post_info.post_reminder.snooze_menu.header',
                            defaultMessage: 'Snooze until:',
                        }),
                    }}
                    menuHeader={
                        <h5 className='PostReminderActions__menuHeader'>
                            {formatMessage({
                                id: 'post_info.post_reminder.snooze_menu.header',
                                defaultMessage: 'Snooze until:',
                            })}
                        </h5>
                    }
                >
                    <PostReminderPresetMenuItems
                        idPrefix={`post_reminder_snooze_options_${post.id}`}
                        isMilitaryTime={isMilitaryTime}
                        timezone={timezone}
                        onSelect={handleSnooze}
                    />
                </Menu.Container>
            )}
        </div>
    );
}
