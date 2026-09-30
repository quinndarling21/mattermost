// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {ComponentProps} from 'react';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import VirtualizedThreadList from './virtualized_thread_list';

// The global AutoSizer mock is shorter than a single row, so give the list room for every row plus the trailing item.
jest.mock('react-virtualized-auto-sizer', () => ({
    __esModule: true,
    default: ({children}: {children: (size: {height: number; width: number}) => React.ReactNode}) => (
        <>{children({height: 500, width: 500})}</>
    ),
}));

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

describe('components/threading/global_threads/thread_list/virtualized_thread_list', () => {
    let props: ComponentProps<typeof VirtualizedThreadList>;
    let loadMoreItems: jest.Mock<Promise<void>, [number, number]>;

    beforeEach(() => {
        loadMoreItems = jest.fn<Promise<void>, [number, number]>(() => Promise.resolve());

        props = {
            ids: ['1', '2', '3'],
            loadMoreItems,
            selectedThreadId: '1',
            total: 3,
            isLoading: false,
            addNoMoreResultsItem: false,
        };
    });

    test('should render a thread item for each thread', () => {
        renderWithContext(<VirtualizedThreadList {...props}/>);

        const threadItems = screen.getAllByRole('link');
        expect(threadItems).toHaveLength(3);
        expect(threadItems[0]).toHaveAccessibleName('Thread 1');
        expect(threadItems[1]).toHaveAccessibleName('Thread 2');
        expect(threadItems[2]).toHaveAccessibleName('Thread 3');

        expect(threadItems[0]).toHaveAttribute('data-first-thread-in-list', 'true');
        expect(threadItems[1]).toHaveAttribute('data-first-thread-in-list', 'false');
        expect(threadItems[2]).toHaveAttribute('data-first-thread-in-list', 'false');
    });

    test('should mark only the selected thread', () => {
        renderWithContext(
            <VirtualizedThreadList
                {...props}
                selectedThreadId='2'
            />,
        );

        expect(screen.getByRole('link', {name: 'Thread 1'})).not.toHaveAttribute('aria-current');
        expect(screen.getByRole('link', {name: 'Thread 2'})).toHaveAttribute('aria-current', 'true');
        expect(screen.getByRole('link', {name: 'Thread 3'})).not.toHaveAttribute('aria-current');
    });

    test('should not request more threads when every thread is already loaded', () => {
        renderWithContext(<VirtualizedThreadList {...props}/>);

        expect(loadMoreItems).not.toHaveBeenCalled();
    });

    test('should request the threads that have not been loaded yet', () => {
        renderWithContext(
            <VirtualizedThreadList
                {...props}
                total={10}
            />,
        );

        expect(loadMoreItems).toHaveBeenCalledTimes(1);
        expect(loadMoreItems).toHaveBeenCalledWith(3, 9);
    });

    test('should show a loading indicator while more threads are loading', () => {
        const {container} = renderWithContext(
            <VirtualizedThreadList
                {...props}
                total={10}
                isLoading={true}
            />,
        );

        expect(screen.getAllByRole('link')).toHaveLength(3);
        expect(container.querySelector('.loading-screen')).toBeVisible();
    });

    test('should not show a loading indicator when every thread is already loaded', () => {
        const {container} = renderWithContext(
            <VirtualizedThreadList
                {...props}
                isLoading={true}
            />,
        );

        expect(screen.getAllByRole('link')).toHaveLength(3);
        expect(container.querySelector('.loading-screen')).not.toBeInTheDocument();
    });

    test('should show search guidance after the last thread once every thread is loaded', () => {
        renderWithContext(
            <VirtualizedThreadList
                {...props}
                addNoMoreResultsItem={true}
            />,
        );

        expect(screen.getAllByRole('link')).toHaveLength(3);
        expect(screen.getByRole('heading', {name: 'That’s the end of the list'})).toBeVisible();
        expect(screen.getByText(/If you’re looking for older conversations, try searching with/)).toBeVisible();
    });

    test('should not show search guidance while more threads remain', () => {
        renderWithContext(
            <VirtualizedThreadList
                {...props}
                total={10}
                addNoMoreResultsItem={true}
            />,
        );

        expect(screen.queryByRole('heading', {name: 'That’s the end of the list'})).not.toBeInTheDocument();
    });
});
