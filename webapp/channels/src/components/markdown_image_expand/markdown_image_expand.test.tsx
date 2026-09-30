// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {render, screen, userEvent} from 'tests/react_testing_utils';

import MarkdownImageExpand from './markdown_image_expand';

describe('components/MarkdownImageExpand', () => {
    const baseProps = {
        alt: 'Some alt text',
        postId: 'abc',
        imageKey: '1',
        onToggle: jest.fn(),
        toggleInlineImageVisibility: jest.fn(),
    };

    test('should show the expand button with alt text and hide the image when collapsed', () => {
        const {container} = render(
            <MarkdownImageExpand
                {...baseProps}
                isExpanded={false}
            >
                {'An image to expand'}
            </MarkdownImageExpand>,
        );

        expect(screen.getByRole('button', {name: 'Some alt text'})).toBeVisible();
        expect(screen.queryByText('An image to expand')).not.toBeInTheDocument();
        expect(container.firstChild).not.toHaveClass('markdown-image-expand--expanded');
    });

    test('should show the collapse button and the image when expanded', () => {
        const {container} = render(
            <MarkdownImageExpand
                {...baseProps}
                isExpanded={true}
            >
                {'An image to expand'}
            </MarkdownImageExpand>,
        );

        expect(screen.getByRole('button')).toBeVisible();
        expect(screen.getByText('An image to expand')).toBeVisible();
        expect(screen.queryByText('Some alt text')).not.toBeInTheDocument();
        expect(container.firstChild).toHaveClass('markdown-image-expand--expanded');
    });

    test('should toggle image visibility on collapse button click', async () => {
        render(
            <MarkdownImageExpand
                {...baseProps}
                isExpanded={true}
            >
                {'An image to expand'}
            </MarkdownImageExpand>,
        );

        await userEvent.click(screen.getByRole('button'));

        expect(baseProps.toggleInlineImageVisibility).toHaveBeenCalledTimes(1);
        expect(baseProps.toggleInlineImageVisibility).toHaveBeenCalledWith('abc', '1');
    });

    test('should toggle image visibility on expand button click', async () => {
        render(
            <MarkdownImageExpand
                {...baseProps}
                isExpanded={false}
            >
                {'An image to expand'}
            </MarkdownImageExpand>,
        );

        await userEvent.click(screen.getByRole('button', {name: 'Some alt text'}));

        expect(baseProps.toggleInlineImageVisibility).toHaveBeenCalledTimes(1);
        expect(baseProps.toggleInlineImageVisibility).toHaveBeenCalledWith('abc', '1');
    });

    test('should notify onToggle with the current expanded state', () => {
        const {rerender} = render(
            <MarkdownImageExpand
                {...baseProps}
                isExpanded={false}
            >
                {'An image to expand'}
            </MarkdownImageExpand>,
        );

        expect(baseProps.onToggle).toHaveBeenCalledTimes(1);
        expect(baseProps.onToggle).toHaveBeenLastCalledWith(false);

        rerender(
            <MarkdownImageExpand
                {...baseProps}
                isExpanded={true}
            >
                {'An image to expand'}
            </MarkdownImageExpand>,
        );

        expect(baseProps.onToggle).toHaveBeenCalledTimes(2);
        expect(baseProps.onToggle).toHaveBeenLastCalledWith(true);
    });
});
