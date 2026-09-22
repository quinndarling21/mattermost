// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {openModal} from 'actions/views/modals';

import {renderWithContext, screen, userEvent} from 'tests/react_testing_utils';
import {ModalIdentifiers} from 'utils/constants';

import CreateCategoryButton from './create_category_button';

jest.mock('actions/views/modals', () => ({
    openModal: jest.fn(() => ({type: 'MOCKED_OPEN_MODAL'})),
}));

describe('components/sidebar/create_category_button', () => {
    const preferenceKey = 'sidebar_settings--show_unread_section';

    const baseState = {
        entities: {
            general: {
                config: {
                    ExperimentalGroupUnreadChannels: 'default_off',
                },
            },
            preferences: {
                myPreferences: {
                    [preferenceKey]: {
                        category: 'sidebar_settings',
                        name: 'show_unread_section',
                        user_id: 'current_user_id',
                        value: 'false',
                    },
                },
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {
                    current_user_id: {roles: 'system_user'},
                },
            },
            teams: {
                currentTeamId: 'current_team_id',
            },
        },
        views: {
            channelSidebar: {
                unreadFilterEnabled: false,
            },
        },
    };

    beforeEach(() => {
        (openModal as jest.Mock).mockClear();
    });

    test('should render the create category button', () => {
        renderWithContext(<CreateCategoryButton/>, baseState);

        expect(screen.getByRole('button', {name: /create new category/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /create new category/i})).toHaveAttribute('id', 'createCategoryButton');
    });

    test('should return null when unread filter is enabled', () => {
        const unreadFilterState = {
            ...baseState,
            views: {
                channelSidebar: {
                    unreadFilterEnabled: true,
                },
            },
        };

        const {container} = renderWithContext(<CreateCategoryButton/>, unreadFilterState);

        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByRole('button', {name: /create new category/i})).not.toBeInTheDocument();
    });

    test('should open the edit category modal when clicked', async () => {
        renderWithContext(<CreateCategoryButton/>, baseState);

        await userEvent.click(screen.getByRole('button', {name: /create new category/i}));

        expect(openModal).toHaveBeenCalledWith(expect.objectContaining({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogProps: {focusOriginElement: 'createCategoryButton'},
        }));
    });
});
