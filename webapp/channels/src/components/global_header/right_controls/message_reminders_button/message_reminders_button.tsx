// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {WithTooltip} from '@mattermost/shared/components/tooltip';

import {openModal} from 'actions/views/modals';

import IconButton from 'components/global_header/header_icon_button';
import MessageRemindersModal from 'components/message_reminders_modal';

import {ModalIdentifiers} from 'utils/constants';

const MessageRemindersButton = (): JSX.Element | null => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const messageRemindersButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dispatch(openModal({
            modalId: ModalIdentifiers.MESSAGE_REMINDERS,
            dialogType: MessageRemindersModal,
        }));
    };

    return (
        <WithTooltip
            title={
                <FormattedMessage
                    id='global_header.message_reminders'
                    defaultMessage='Message reminders'
                />
            }
        >
            <IconButton
                icon={'clock-outline'}
                onClick={messageRemindersButtonClick}
                aria-label={formatMessage({id: 'global_header.message_reminders', defaultMessage: 'Message reminders'})}
            />
        </WithTooltip>
    );
};

export default MessageRemindersButton;
