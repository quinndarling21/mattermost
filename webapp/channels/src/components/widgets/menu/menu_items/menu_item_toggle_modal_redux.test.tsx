// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {renderWithContext, screen, userEvent, within} from 'tests/react_testing_utils';

import {MenuItemToggleModalReduxImpl} from './menu_item_toggle_modal_redux';

describe('components/MenuItemToggleModalRedux', () => {
    const dialogType = jest.fn();
    const dialogProps = {test: 'test'};

    test('should render a modal toggle with primary text and open the modal when clicked', async () => {
        const {store} = renderWithContext(
            <MenuItemToggleModalReduxImpl
                modalId='test'
                dialogType={dialogType}
                dialogProps={dialogProps}
                text='Whatever'
            />,
        );

        const button = screen.getByRole('button', {name: 'Whatever'});
        expect(button).toBeVisible();
        expect(button).toHaveClass('style--none');
        expect(button).not.toHaveClass('MenuItem__with-help');

        const primaryText = within(button).getByText('Whatever');
        expect(primaryText).toBeVisible();
        expect(primaryText).toHaveClass('MenuItem__primary-text');
        expect(screen.queryByText('Extra text')).not.toBeInTheDocument();

        await userEvent.click(button);

        expect(store.getState().views.modals.modalState.test).toEqual({
            open: true,
            dialogProps,
            dialogType,
        });
    });

    test('should render extra help text', () => {
        renderWithContext(
            <MenuItemToggleModalReduxImpl
                modalId='test'
                dialogType={dialogType}
                dialogProps={dialogProps}
                text='Whatever'
                extraText='Extra text'
            />,
        );

        const button = screen.getByRole('button', {name: 'Whatever Extra text'});
        expect(button).toBeVisible();
        expect(button).toHaveClass('style--none', 'MenuItem__with-help');

        expect(within(button).getByText('Whatever')).toHaveClass('MenuItem__primary-text');

        const helpText = within(button).getByText('Extra text');
        expect(helpText).toBeVisible();
        expect(helpText).toHaveClass('MenuItem__help-text');
    });
});
