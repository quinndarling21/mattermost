// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {renderWithContext, screen, userEvent} from 'tests/react_testing_utils';

import {MenuItemActionImpl} from './menu_item_action';

describe('components/MenuItemAction', () => {
    test('should render a button with the primary text', () => {
        renderWithContext(
            <MenuItemActionImpl
                onClick={jest.fn()}
                text='Whatever'
            />,
        );

        const button = screen.getByRole('button', {name: 'Whatever'});
        expect(button).toBeVisible();
        expect(button).toHaveClass('style--none');
        expect(button).not.toHaveClass('MenuItem__with-help');

        expect(screen.getByText('Whatever')).toHaveClass('MenuItem__primary-text');
        expect(screen.queryByText('Extra Text')).not.toBeInTheDocument();
    });

    test('should render extra text as help text', () => {
        renderWithContext(
            <MenuItemActionImpl
                onClick={jest.fn()}
                text='Whatever'
                extraText='Extra Text'
            />,
        );

        const button = screen.getByRole('button', {name: /Whatever/});
        expect(button).toHaveClass('style--none', 'MenuItem__with-help');

        expect(screen.getByText('Whatever')).toHaveClass('MenuItem__primary-text');

        const extraText = screen.getByText('Extra Text');
        expect(extraText).toBeVisible();
        expect(extraText).toHaveClass('MenuItem__help-text');
    });

    test('should call onClick when the button is clicked', async () => {
        const onClick = jest.fn();

        renderWithContext(
            <MenuItemActionImpl
                onClick={onClick}
                text='Whatever'
            />,
        );

        await userEvent.click(screen.getByRole('button', {name: 'Whatever'}));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('should not call onClick when disabled', async () => {
        const onClick = jest.fn();

        renderWithContext(
            <MenuItemActionImpl
                onClick={onClick}
                text='Whatever'
                disabled={true}
            />,
        );

        const button = screen.getByRole('button', {name: 'Whatever'});
        expect(button).toBeDisabled();

        await userEvent.click(button);

        expect(onClick).not.toHaveBeenCalled();
    });
});
