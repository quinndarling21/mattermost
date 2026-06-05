// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {FolderPlusOutlineIcon} from '@mattermost/compass-icons/components';
import {Button, buttonClassNames} from '@mattermost/shared/components/button';

import {openModal} from 'actions/views/modals';

import EditCategoryModal from 'components/edit_category_modal';

import {ModalIdentifiers} from 'utils/constants';

const CreateCategoryButton = (): JSX.Element => {
    const dispatch = useDispatch();
    const intl = useIntl();

    const handleCreateCategory = useCallback(() => {
        dispatch(openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
        }));
    }, [dispatch]);

    return (
        <div className='SidebarChannelNavigator_createCategorySticky'>
            <Button
                id='createCategoryCta'
                emphasis='tertiary'
                size='sm'
                className={buttonClassNames({emphasis: 'tertiary', size: 'sm'}, 'SidebarChannelNavigator__createCategoryLhsButton')}
                onClick={handleCreateCategory}
                aria-label={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.createCategory', defaultMessage: 'Create New Category'})}
            >
                <FolderPlusOutlineIcon size={18}/>
                <FormattedMessage
                    id='sidebar_left.sidebar_category_menu.createCategory'
                    defaultMessage='Create New Category'
                />
            </Button>
        </div>
    );
};

export default CreateCategoryButton;
