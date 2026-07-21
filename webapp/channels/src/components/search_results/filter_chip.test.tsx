// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {fireEvent, renderWithContext, screen, userEvent} from 'tests/react_testing_utils';

import FilterChip from './filter_chip';

describe('components/search_results/FilterChip', () => {
    test('should render label and call onClick', async () => {
        const onClick = jest.fn();
        renderWithContext(
            <FilterChip
                label='In: #incident-response'
                onClick={onClick}
            />,
        );

        const chip = screen.getByRole('button', {name: 'In: #incident-response'});
        expect(chip).toHaveAttribute('aria-pressed', 'false');
        expect(chip).not.toHaveClass('selected');

        await userEvent.click(chip);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('should apply selected state', () => {
        renderWithContext(
            <FilterChip
                label='From: @quinn'
                selected={true}
            />,
        );

        const chip = screen.getByRole('button', {name: 'From: @quinn'});
        expect(chip).toHaveAttribute('aria-pressed', 'true');
        expect(chip).toHaveClass('selected');
    });

    test('should be keyboard focusable', () => {
        renderWithContext(
            <FilterChip label='After: last week'/>,
        );

        const chip = screen.getByRole('button', {name: 'After: last week'});
        chip.focus();
        expect(chip).toHaveFocus();
        fireEvent.keyDown(chip, {key: 'Enter'});
    });
});
