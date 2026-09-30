// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {renderWithContext, screen, within} from 'tests/react_testing_utils';

import {MenuItemExternalLinkImpl} from './menu_item_external_link';

describe('components/MenuItemExternalLink', () => {
    test('should render an external link with primary text', () => {
        renderWithContext(
            <MenuItemExternalLinkImpl
                url='http://test.com'
                text='Whatever'
            />,
        );

        const link = screen.getByRole('link', {name: 'Whatever'});
        expect(link).toBeVisible();
        expect(link).toHaveAttribute('href', 'http://test.com');
        expect(link).toHaveAttribute('location', 'menu_item_external_link');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');

        const primaryText = within(link).getByText('Whatever');
        expect(primaryText).toBeVisible();
        expect(primaryText).toHaveClass('MenuItem__primary-text');
    });
});
