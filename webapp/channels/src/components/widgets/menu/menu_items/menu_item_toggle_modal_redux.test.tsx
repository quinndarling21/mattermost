// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {renderWithContext, screen, userEvent} from 'tests/react_testing_utils';

import {MenuItemToggleModalReduxImpl} from './menu_item_toggle_modal_redux';

const TestModal = () => <div>{'Test modal'}</div>;

describe('components/MenuItemToggleModalRedux', () => {
    const baseProps = {
        modalId: 'test',
        dialogType: TestModal,
        dialogProps: {test: 'test'},
        text: 'Whatever',
    };

    test('should render a button with the primary text', () => {
        renderWithContext(<MenuItemToggleModalReduxImpl {...baseProps}/>);

        const button = screen.getByRole('button', {name: 'Whatever'});
        expect(button).toBeVisible();
        expect(button).not.toHaveClass('MenuItem__with-help');

        expect(screen.getByText('Whatever')).toHaveClass('MenuItem__primary-text');
        expect(screen.queryByText('Extra text')).not.toBeInTheDocument();
    });

    test('should render extra text as help text', () => {
        renderWithContext(
            <MenuItemToggleModalReduxImpl
                {...baseProps}
                extraText='Extra text'
            />,
        );

        const button = screen.getByRole('button', {name: /Whatever/});
        expect(button).toHaveClass('MenuItem__with-help');

        expect(screen.getByText('Whatever')).toHaveClass('MenuItem__primary-text');

        const extraText = screen.getByText('Extra text');
        expect(extraText).toBeVisible();
        expect(extraText).toHaveClass('MenuItem__help-text');
    });

    test('should open the modal when clicked', async () => {
        const {store} = renderWithContext(<MenuItemToggleModalReduxImpl {...baseProps}/>);

        await userEvent.click(screen.getByRole('button', {name: 'Whatever'}));

        expect(store.getState().views.modals.modalState.test).toEqual({
            open: true,
            dialogType: TestModal,
            dialogProps: {test: 'test'},
        });
    });
});
