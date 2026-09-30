// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {act, renderWithContext, screen, userEvent, waitFor} from 'tests/react_testing_utils';

import ReadingTime from './reading_time';

describe('ReadingTime', () => {
    test('renders the muted label for a one minute estimate', () => {
        renderWithContext(<ReadingTime minutes={1}/>);

        const label = screen.getByTestId('post-reading-time');
        expect(label).toHaveTextContent('· 1 min read');
        expect(label).toHaveClass('ReadingTime');
    });

    test('keeps min singular above one minute', () => {
        renderWithContext(<ReadingTime minutes={12}/>);

        expect(screen.getByTestId('post-reading-time')).toHaveTextContent('· 12 min read');
    });

    test.each([1, 12])('shows the reading-time tooltip for %s minutes', async (minutes) => {
        jest.useFakeTimers();

        renderWithContext(<ReadingTime minutes={minutes}/>);

        await userEvent.hover(screen.getByTestId('post-reading-time'), {advanceTimers: jest.advanceTimersByTime});
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
            expect(screen.getByText(`About ${minutes} minutes to read`)).toBeInTheDocument();
        });

        jest.useRealTimers();
    });
});
