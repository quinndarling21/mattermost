// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {ComponentProps} from 'react';

import {renderWithContext, screen} from 'tests/react_testing_utils';
import {Constants} from 'utils/constants';

import Row from './virtualized_thread_list_row';

jest.mock('../thread_item', () => ({
    __esModule: true,
    default: ({threadId, isSelected, isFirstThreadInList}: {threadId: string; isSelected: boolean; isFirstThreadInList: boolean}) => (
        <div
            role='link'
            aria-label={`Thread ${threadId}`}
            aria-current={isSelected ? 'true' : undefined}
            data-first-thread-in-list={isFirstThreadInList}
        />
    ),
}));

describe('components/threading/global_threads/thread_list/virtualized_thread_list_row', () => {
    let props: ComponentProps<typeof Row>;

    beforeEach(() => {
        props = {
            data: {
                ids: ['1', '2', '3'],
                selectedThreadId: undefined,
            },
            index: 1,
            style: {},
        };
    });

    test('should render the thread item for the given index', () => {
        renderWithContext(<Row {...props}/>);

        const threadItem = screen.getByRole('link', {name: 'Thread 2'});
        expect(threadItem).toBeVisible();
        expect(threadItem).not.toHaveAttribute('aria-current');
        expect(threadItem).toHaveAttribute('data-first-thread-in-list', 'false');

        expect(screen.queryByRole('link', {name: 'Thread 1'})).not.toBeInTheDocument();
        expect(screen.queryByRole('link', {name: 'Thread 3'})).not.toBeInTheDocument();
    });

    test('should flag the first thread in the list', () => {
        renderWithContext(
            <Row
                {...props}
                index={0}
            />,
        );

        expect(screen.getByRole('link', {name: 'Thread 1'})).toHaveAttribute('data-first-thread-in-list', 'true');
    });

    test('should mark the selected thread', () => {
        renderWithContext(
            <Row
                {...props}
                data={{ids: props.data.ids, selectedThreadId: '2'}}
            />,
        );

        expect(screen.getByRole('link', {name: 'Thread 2'})).toHaveAttribute('aria-current', 'true');
    });

    test('should support item loading indicator', () => {
        const {container} = renderWithContext(
            <Row
                {...props}
                data={{ids: [...props.data.ids, Constants.THREADS_LOADING_INDICATOR_ITEM_ID], selectedThreadId: undefined}}
                index={3}
            />,
        );

        expect(container.querySelector('.loading-screen')).toBeVisible();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.queryByText('That’s the end of the list')).not.toBeInTheDocument();
    });

    test('should support item search guidance', () => {
        const {container} = renderWithContext(
            <Row
                {...props}
                data={{ids: [...props.data.ids, Constants.THREADS_NO_RESULTS_ITEM_ID], selectedThreadId: undefined}}
                index={3}
            />,
        );

        expect(screen.getByRole('heading', {name: 'That’s the end of the list'})).toBeVisible();
        expect(screen.getByText(/If you’re looking for older conversations, try searching with/)).toBeVisible();
        expect(screen.getByText('F')).toBeVisible();

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(container.querySelector('.loading-screen')).not.toBeInTheDocument();
    });
});
