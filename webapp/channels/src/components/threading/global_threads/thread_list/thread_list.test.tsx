// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {ComponentProps} from 'react';

import {getThreadsForCurrentTeam} from 'mattermost-redux/actions/threads';
import initialState from 'mattermost-redux/store/initial_state';

import mergeObjects from 'packages/mattermost-redux/test/merge_objects';
import {act, renderWithContext, screen, userEvent, waitFor} from 'tests/react_testing_utils';
import {ModalIdentifiers} from 'utils/constants';

import ThreadList, {ThreadFilter} from './thread_list';

jest.mock('react-virtualized-auto-sizer', () => ({
    __esModule: true,
    default: ({children}: {children: (size: {height: number; width: number}) => React.ReactNode}) => (
        children({height: 400, width: 300})
    ),
}));

jest.mock('mattermost-redux/actions/threads', () => ({
    ...jest.requireActual('mattermost-redux/actions/threads'),
    getThreadsForCurrentTeam: jest.fn(() => () => Promise.resolve({data: true})),
}));

const mockedGetThreads = getThreadsForCurrentTeam as jest.Mock;

describe('components/threading/global_threads/thread_list', () => {
    let props: ComponentProps<typeof ThreadList>;

    beforeEach(() => {
        props = {
            currentFilter: ThreadFilter.none,
            someUnread: true,
            ids: ['1', '2', '3'],
            unreadIds: ['2'],
            setFilter: jest.fn(),
        };

        mockedGetThreads.mockImplementation(() => () => Promise.resolve({data: true}));
    });

    function renderList(total = 0, totalUnread = 0) {
        const state = mergeObjects(initialState, {
            entities: {
                teams: {
                    currentTeamId: 'tid',
                },
                users: {
                    currentUserId: 'uid',
                },
                threads: {
                    countsIncludingDirect: {
                        tid: {
                            total,
                            total_unread_threads: totalUnread,
                            total_unread_mentions: 0,
                        },
                    },
                },
            },
        });

        return renderWithContext(<ThreadList {...props}/>, state);
    }

    test('should render the followed-threads list', () => {
        const {container} = renderList();

        const list = document.getElementById('threads-list-container');
        expect(list).toBeVisible();
        expect(list).toHaveClass('ThreadList');
        expect(list).toHaveAttribute('tabindex', '0');

        expect(document.getElementById('tutorial-threads-mobile-header')).toBeVisible();

        const tablist = screen.getByRole('tablist', {name: 'Filter visible threads'});
        expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
        expect(tablist).toHaveClass('tab-buttons-list');

        const followed = screen.getByRole('tab', {name: 'Followed threads'});
        expect(followed).toHaveAttribute('id', 'threads-list-filter-none');
        expect(followed).toHaveAttribute('aria-selected', 'true');
        expect(followed).toHaveAttribute('aria-controls', 'threads-list');
        expect(followed).toHaveAttribute('tabindex', '0');
        expect(followed).toHaveClass('is-active', 'Button___large', 'Margined');

        const unreads = screen.getByRole('tab', {name: 'Unreads'});
        expect(unreads).toHaveAttribute('id', 'threads-list-filter-unread');
        expect(unreads).toHaveAttribute('aria-selected', 'false');
        expect(unreads).toHaveAttribute('aria-controls', 'threads-list');
        expect(unreads).toHaveAttribute('tabindex', '-1');
        expect(unreads).not.toHaveClass('is-active');
        expect(unreads.querySelector('.dot')).toBeVisible();
        expect(document.getElementById('threads-list-unread-button')).toContainElement(unreads);

        const markAllRead = screen.getByRole('button', {name: 'Mark all threads as read'});
        expect(markAllRead).toBeVisible();
        expect(markAllRead).toHaveAttribute('id', 'threads-list__mark-all-as-read');
        expect(markAllRead).toHaveClass('Button___large', 'Button___icon');
        expect(markAllRead.querySelector('.Button_label')).toHaveClass('margin_top');
        expect(markAllRead.querySelector('.icon svg')).toHaveAttribute('width', '18');

        const panel = screen.getByRole('tabpanel');
        expect(panel).toHaveAttribute('id', 'threads-list');
        expect(panel).toHaveClass('threads');
        expect(panel).toHaveAttribute('data-testid', 'threads_list');

        const virtualList = container.querySelector('.virtualized-thread-list');
        expect(virtualList).toBeVisible();
        expect(virtualList?.firstElementChild).toHaveStyle({height: '399px'});
        expect(screen.queryByText('That\u2019s the end of the list')).not.toBeInTheDocument();
        expect(container.querySelector('.loading-screen')).not.toBeInTheDocument();
    });

    test('should support filter:all', async () => {
        renderList();

        await userEvent.click(screen.getByRole('tab', {name: 'Followed threads'}));

        expect(props.setFilter).toHaveBeenCalledWith(ThreadFilter.none);
    });

    test('should support filter:unread', async () => {
        renderList();

        await userEvent.click(screen.getByRole('tab', {name: 'Unreads'}));

        expect(props.setFilter).toHaveBeenCalledWith(ThreadFilter.unread);
    });

    test('should show the caught-up state when there are no unread threads', () => {
        props.currentFilter = ThreadFilter.unread;
        props.someUnread = false;
        props.unreadIds = [];

        renderList(3, 0);

        expect(screen.getByRole('heading', {name: 'No unread threads'})).toBeVisible();
        expect(screen.getByText('You\'re all caught up')).toBeVisible();
    });

    test('should support openModal', async () => {
        const {store} = renderList();

        await userEvent.click(screen.getByRole('button', {name: 'Mark all threads as read'}));

        expect(store.getState().views.modals.modalState[ModalIdentifiers.MARK_ALL_THREADS_AS_READ]).toEqual(expect.objectContaining({
            open: true,
        }));
    });

    test('should support getThreads', async () => {
        let resolveLoad: (value: {data: boolean}) => void = () => {};
        const pending = new Promise<{data: boolean}>((resolve) => {
            resolveLoad = resolve;
        });
        mockedGetThreads.mockImplementation(() => () => pending);

        const {container} = renderList(40, 0);

        await waitFor(() => {
            expect(mockedGetThreads).toHaveBeenCalledWith({unread: false, before: '3'});
        });
        expect(container.querySelector('.loading-screen')).toBeVisible();

        await act(async () => {
            resolveLoad({data: true});
        });

        await waitFor(() => {
            expect(container.querySelector('.loading-screen')).not.toBeInTheDocument();
        });
        expect(mockedGetThreads).toHaveBeenCalledTimes(1);
    });
});
