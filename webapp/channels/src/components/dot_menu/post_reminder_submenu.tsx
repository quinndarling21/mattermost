// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {ChevronRightIcon, ClockOutlineIcon} from '@mattermost/compass-icons/components';
import type {Post} from '@mattermost/types/posts';

import {addPostReminder} from 'mattermost-redux/actions/posts';

import {openModal} from 'actions/views/modals';

import * as Menu from 'components/menu';
import PostReminderCustomTimePicker from 'components/post_reminder_custom_time_picker_modal';
import PostReminderPresetMenuItems from 'components/post_reminder_preset_menu_items';

import {ModalIdentifiers} from 'utils/constants';
import {toUTCUnixInSeconds} from 'utils/datetime';
import {PostReminderPresets, getPostReminderPresetTargetTime} from 'utils/post_reminders';
import type {PostReminderPreset} from 'utils/post_reminders';

type Props = {
    userId: string;
    post: Post;
    isMilitaryTime: boolean;
    timezone?: string;
}

function PostReminderSubmenu(props: Props) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    function handlePostReminderMenuClick(preset: PostReminderPreset) {
        if (preset === PostReminderPresets.CUSTOM) {
            const postReminderCustomTimePicker = {
                modalId: ModalIdentifiers.POST_REMINDER_CUSTOM_TIME_PICKER,
                dialogType: PostReminderCustomTimePicker,
                dialogProps: {
                    postId: props.post.id,
                },
            };

            dispatch(openModal(postReminderCustomTimePicker));
        } else {
            const endTime = getPostReminderPresetTargetTime(preset, props.timezone);

            dispatch(addPostReminder(props.userId, props.post.id, toUTCUnixInSeconds(endTime.toDate())));
        }
    }

    return (
        <Menu.SubMenu
            id={`remind_post_${props.post.id}`}
            menuAriaLabel={formatMessage({
                id: 'post_info.post_reminder.sub_menu.header',
                defaultMessage: 'Set a reminder for:',
            })}
            labels={
                <FormattedMessage
                    id='post_info.post_reminder.menu'
                    defaultMessage='Remind me'
                />
            }
            leadingElement={<ClockOutlineIcon size={18}/>}
            trailingElements={<span className={'dot-menu__item-trailing-icon'}><ChevronRightIcon size={16}/></span>}
            menuId={`remind_post_${props.post.id}-menu`}
            subMenuHeader={
                <h5 className={'dot-menu__post-reminder-menu-header'}>
                    {formatMessage(
                        {
                            id: 'post_info.post_reminder.sub_menu.header',
                            defaultMessage: 'Set a reminder for:',
                        },
                    )}
                </h5>}
        >
            <PostReminderPresetMenuItems
                idPrefix='remind_post_options'
                isMilitaryTime={props.isMilitaryTime}
                timezone={props.timezone}
                onSelect={handlePostReminderMenuClick}
            />
        </Menu.SubMenu>
    );
}

export default memo(PostReminderSubmenu);
