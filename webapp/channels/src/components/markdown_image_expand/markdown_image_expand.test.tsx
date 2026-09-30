// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {render, screen, userEvent} from 'tests/react_testing_utils';

import MarkdownImageExpand from './markdown_image_expand';

describe('components/MarkdownImageExpand', () => {
    const altText = 'Some alt text';
    const imageContent = 'An image to expand';
    const baseProps = {
        alt: altText,
        postId: 'abc',
        imageKey: '1',
    };

    function renderExpand(isExpanded: boolean) {
        const onToggle = jest.fn();
        const toggleInlineImageVisibility = jest.fn();

        const view = render(
            <MarkdownImageExpand
                {...baseProps}
                isExpanded={isExpanded}
                onToggle={onToggle}
                toggleInlineImageVisibility={toggleInlineImageVisibility}
            >
                {imageContent}
            </MarkdownImageExpand>,
        );

        return {onToggle, toggleInlineImageVisibility, ...view};
    }

    it('should show a collapsed embed with alt text and an expand button', () => {
        const {onToggle, toggleInlineImageVisibility} = renderExpand(false);

        const expandButton = screen.getByRole('button', {name: altText});
        expect(expandButton).toBeVisible();
        expect(expandButton).toHaveAttribute('type', 'button');
        expect(expandButton).toHaveClass('markdown-image-expand__expand-button');
        expect(expandButton.parentElement).toHaveClass('markdown-image-expand');
        expect(expandButton.parentElement).not.toHaveClass('markdown-image-expand--expanded');

        expect(expandButton.querySelector('.markdown-image-expand__expand-icon')).toHaveClass(
            'icon',
            'icon-menu-right',
            'markdown-image-expand__expand-icon',
        );
        expect(screen.getByText(altText)).toHaveClass('markdown-image-expand__alt-text');
        expect(screen.getByText(altText)).toBeVisible();
        expect(screen.queryByText(imageContent)).not.toBeInTheDocument();
        expect(screen.getAllByRole('button')).toHaveLength(1);

        expect(onToggle).toHaveBeenCalledWith(false);
        expect(toggleInlineImageVisibility).not.toHaveBeenCalled();
    });

    it('should show an expanded embed with image content and a collapse button', () => {
        const {onToggle, toggleInlineImageVisibility} = renderExpand(true);

        const collapseButton = screen.getByRole('button');
        expect(collapseButton).toBeVisible();
        expect(collapseButton).toHaveAttribute('type', 'button');
        expect(collapseButton).toHaveClass('markdown-image-expand__collapse-button');
        expect(collapseButton.parentElement).toHaveClass('markdown-image-expand', 'markdown-image-expand--expanded');

        expect(collapseButton.querySelector('.icon')).toHaveClass('icon', 'icon-menu-down');
        expect(collapseButton.querySelector('.markdown-image-expand__expand-icon')).toBeNull();
        expect(screen.getByText(imageContent)).toBeVisible();
        expect(screen.queryByText(altText)).not.toBeInTheDocument();
        expect(screen.getAllByRole('button')).toHaveLength(1);

        expect(onToggle).toHaveBeenCalledWith(true);
        expect(toggleInlineImageVisibility).not.toHaveBeenCalled();
    });

    it('should emit toggle action on collapse button click', async () => {
        const {onToggle, toggleInlineImageVisibility} = renderExpand(true);

        await userEvent.click(screen.getByRole('button'));

        expect(toggleInlineImageVisibility).toHaveBeenCalledTimes(1);
        expect(toggleInlineImageVisibility).toHaveBeenCalledWith('abc', '1');
        expect(onToggle).toHaveBeenCalledTimes(1);
        expect(onToggle).toHaveBeenCalledWith(true);
    });

    it('should emit toggle action on expand button click', async () => {
        const {onToggle, toggleInlineImageVisibility} = renderExpand(false);

        await userEvent.click(screen.getByRole('button', {name: altText}));

        expect(toggleInlineImageVisibility).toHaveBeenCalledTimes(1);
        expect(toggleInlineImageVisibility).toHaveBeenCalledWith('abc', '1');
        expect(onToggle).toHaveBeenCalledTimes(1);
        expect(onToggle).toHaveBeenCalledWith(false);
    });
});
