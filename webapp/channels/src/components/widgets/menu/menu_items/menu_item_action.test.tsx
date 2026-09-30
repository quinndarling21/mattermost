// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {render, screen, userEvent, within} from 'tests/react_testing_utils';

import {MenuItemActionImpl} from './menu_item_action';

describe('components/MenuItemAction', () => {
    test('should render a button with primary text and call onClick', async () => {
        const onClick = jest.fn();

        render(
            <MenuItemActionImpl
                onClick={onClick}
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
        expect(screen.queryByText('Extra Text')).not.toBeInTheDocument();

        await userEvent.click(button);

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('should render extra help text', async () => {
        const onClick = jest.fn();

        render(
            <MenuItemActionImpl
                onClick={onClick}
                text='Whatever'
                extraText='Extra Text'
            />,
        );

        const button = screen.getByRole('button', {name: 'Whatever Extra Text'});
        expect(button).toBeVisible();
        expect(button).toHaveClass('style--none', 'MenuItem__with-help');

        expect(within(button).getByText('Whatever')).toHaveClass('MenuItem__primary-text');

        const helpText = within(button).getByText('Extra Text');
        expect(helpText).toBeVisible();
        expect(helpText).toHaveClass('MenuItem__help-text');

        await userEvent.click(button);

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
