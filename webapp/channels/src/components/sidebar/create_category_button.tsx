// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl, FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {FolderPlusOutlineIcon} from '@mattermost/compass-icons/components';

import EditCategoryModal from 'components/edit_category_modal';
import ToggleModalButton from 'components/toggle_modal_button';

import {isUnreadFilterEnabled} from 'selectors/views/channel_sidebar';
import {ModalIdentifiers} from 'utils/constants';

import type {GlobalState} from 'types/store';

type Props = {
    className?: string;
};

const CreateCategoryButton = (props: Props): JSX.Element | null => {
    const intl = useIntl();
    const unreadFilterEnabled = useSelector((state: GlobalState) => isUnreadFilterEnabled(state));

    if (unreadFilterEnabled) {
        return null;
    }

    return (
        <ToggleModalButton
            ariaLabel={intl.formatMessage({id: 'sidebarLeft.browserOrCreateChannelMenu.createCategoryMenuItem.primaryLabel', defaultMessage: 'Create new category'})}
            id='createCategoryButton'
            className={`intro-links color--link cursor--pointer${props.className ? ` ${props.className}` : ''}`}
            modalId={ModalIdentifiers.EDIT_CATEGORY}
            dialogType={EditCategoryModal}
            dialogProps={{focusOriginElement: 'createCategoryButton'}}
        >
            <div
                className='SidebarChannelNavigator__createCategoryLhsButton'
                aria-hidden={true}
            >
                <FolderPlusOutlineIcon
                    size={20}
                    color='rgba(var(--sidebar-text-rgb), 0.64)'
                />
                <FormattedMessage
                    id='sidebarLeft.browserOrCreateChannelMenu.createCategoryMenuItem.primaryLabel'
                    defaultMessage='Create new category'
                />
            </div>
        </ToggleModalButton>
    );
};

export default CreateCategoryButton;
