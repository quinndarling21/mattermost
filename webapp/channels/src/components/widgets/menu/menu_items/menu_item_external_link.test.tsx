// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {renderWithContext, screen, userEvent} from 'tests/react_testing_utils';

import {MenuItemExternalLinkImpl} from './menu_item_external_link';

describe('components/MenuItemExternalLink', () => {
    const baseProps = {
        url: 'http://test.com',
        text: 'Whatever',
    };

    test('should render an external link with the given url and text', () => {
        renderWithContext(<MenuItemExternalLinkImpl {...baseProps}/>);

        const link = screen.getByRole('link', {name: 'Whatever'});
        expect(link).toBeVisible();
        expect(link).toHaveAttribute('href', 'http://test.com');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');

        expect(screen.getByText('Whatever')).toHaveClass('MenuItem__primary-text');
    });

    test('should call onClick when the link is clicked', async () => {
        const onClick = jest.fn();

        renderWithContext(
            <MenuItemExternalLinkImpl
                {...baseProps}
                onClick={onClick}
            />,
        );

        await userEvent.click(screen.getByRole('link', {name: 'Whatever'}));

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
