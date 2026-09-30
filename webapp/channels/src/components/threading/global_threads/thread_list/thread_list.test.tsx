// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {ComponentProps} from 'react';

import type {UserThreadList} from '@mattermost/types/threads';
import type {DeepPartial} from '@mattermost/types/utilities';

import {getThreadsForCurrentTeam, markAllThreadsInTeamRead} from 'mattermost-redux/actions/threads';
import type {ActionResult} from 'mattermost-redux/types/actions';

import {closeModal, openModal} from 'actions/views/modals';

import {act, fireEvent, renderWithContext, screen, userEvent, waitFor, within} from 'tests/react_testing_utils';
import {ModalIdentifiers} from 'utils/constants';

import type {ModalData} from 'types/actions';
import type {GlobalState} from 'types/store';

import ThreadList, {ThreadFilter} from './thread_list';

import MarkAllThreadsAsReadModal from '../mark_all_threads_as_read_modal';
import type {MarkAllThreadsAsReadModalProps} from '../mark_all_threads_as_read_modal';

jest.mock('mattermost-redux/actions/threads', () => ({
    ...jest.requireActual('mattermost-redux/actions/threads'),
    getThreadsForCurrentTeam: jest.fn(),
    markAllThreadsInTeamRead: jest.fn(() => ({type: 'MOCK_MARK_ALL_THREADS_IN_TEAM_READ'})),
}));

// Keep the real action creators so the store's modal state reflects what the user did.
jest.mock('actions/views/modals', () => {
    const actual = jest.requireActual('actions/views/modals');
    return {
        ...actual,
        openModal: jest.fn(actual.openModal),
        closeModal: jest.fn(actual.closeModal),
    };
});

// The global AutoSizer mock is shorter than a single row, so give the list room for every row plus the trailing item.
jest.mock('react-virtualized-auto-sizer', () => ({
    __esModule: true,
    default: ({children}: {children: (size: {height: number; width: number}) => React.ReactNode}) => (
        <>{children({height: 500, width: 500})}</>
    ),
}));

jest.mock('../thread_item', () => ({
    __esModule: true,
    default: ({threadId, isSelected}: {threadId: string; isSelected: boolean}) => (
        <div
            role='link'
            aria-label={`Thread ${threadId}`}
            aria-current={isSelected ? 'true' : undefined}
        />
    ),
}));

const mockRouting = {
    currentUserId: 'uid',
    currentTeamId: 'tid',
    clear: jest.fn(),
    goToInChannel: jest.fn(),
    select: jest.fn(),
};
jest.mock('../../hooks', () => {
    return {
        useThreadRouting: () => mockRouting,
    };
});

const emptyThreadList: UserThreadList = {
    total: 0,
    total_unread_threads: 0,
    total_unread_mentions: 0,
    threads: [],
};

describe('components/threading/global_threads/thread_list', () => {
    let props: ComponentProps<typeof ThreadList>;

    function getInitialState(counts: {total?: number; totalUnread?: number} = {}): DeepPartial<GlobalState> {
        return {
            entities: {
                users: {
                    currentUserId: 'uid',
                },
                teams: {
                    currentTeamId: 'tid',
                },
                threads: {
                    countsIncludingDirect: {
                        tid: {
                            total: counts.total ?? 3,
                            total_unread_threads: counts.totalUnread ?? 1,
                            total_unread_mentions: 0,
                        },
                    },
                },
            },
        };
    }

    function getOpenedModalProps() {
        const [modalData] = jest.mocked(openModal).mock.calls[0] as [ModalData<MarkAllThreadsAsReadModalProps>];
        return modalData.dialogProps!;
    }

    beforeEach(() => {
        jest.mocked(getThreadsForCurrentTeam).mockImplementation(() => () => Promise.resolve({data: emptyThreadList}));

        props = {
            currentFilter: ThreadFilter.none,
            someUnread: true,
            ids: ['1', '2', '3'],
            unreadIds: ['2'],
            setFilter: jest.fn(),
        };
    });

    test('should show the filter tabs, the mark all as read button, and the followed threads', () => {
        renderWithContext(<ThreadList {...props}/>, getInitialState());

        const tabList = screen.getByRole('tablist', {name: 'Filter visible threads'});
        expect(tabList).toBeVisible();

        const followedTab = within(tabList).getByRole('tab', {name: 'Followed threads'});
        expect(followedTab).toHaveAttribute('aria-selected', 'true');
        expect(followedTab).toHaveAttribute('aria-controls', 'threads-list');

        const unreadsTab = within(tabList).getByRole('tab', {name: 'Unreads'});
        expect(unreadsTab).toHaveAttribute('aria-selected', 'false');
        expect(unreadsTab).toHaveAttribute('aria-controls', 'threads-list');
        expect(unreadsTab.querySelector('.dot')).toBeVisible();

        expect(screen.getByRole('button', {name: 'Mark all threads as read'})).toBeVisible();

        const tabPanel = screen.getByRole('tabpanel');
        expect(tabPanel).toHaveAttribute('id', 'threads-list');
        expect(within(tabPanel).getByRole('link', {name: 'Thread 1'})).toBeVisible();
        expect(within(tabPanel).getByRole('link', {name: 'Thread 2'})).toBeVisible();
        expect(within(tabPanel).getByRole('link', {name: 'Thread 3'})).toBeVisible();
    });

    test('should not show the unread dot when no threads are unread', () => {
        renderWithContext(
            <ThreadList
                {...props}
                someUnread={false}
            />,
            getInitialState(),
        );

        expect(screen.getByRole('tab', {name: 'Unreads'}).querySelector('.dot')).not.toBeInTheDocument();
    });

    test('should mark the selected thread', () => {
        renderWithContext(
            <ThreadList
                {...props}
                selectedThreadId='2'
            />,
            getInitialState(),
        );

        expect(screen.getByRole('link', {name: 'Thread 1'})).not.toHaveAttribute('aria-current');
        expect(screen.getByRole('link', {name: 'Thread 2'})).toHaveAttribute('aria-current', 'true');
        expect(screen.getByRole('link', {name: 'Thread 3'})).not.toHaveAttribute('aria-current');
    });

    test('should only show unread threads when the unread filter is active', () => {
        renderWithContext(
            <ThreadList
                {...props}
                currentFilter={ThreadFilter.unread}
            />,
            getInitialState(),
        );

        expect(screen.getByRole('tab', {name: 'Followed threads'})).toHaveAttribute('aria-selected', 'false');
        expect(screen.getByRole('tab', {name: 'Unreads'})).toHaveAttribute('aria-selected', 'true');

        expect(screen.getByRole('link', {name: 'Thread 2'})).toBeVisible();
        expect(screen.queryByRole('link', {name: 'Thread 1'})).not.toBeInTheDocument();
        expect(screen.queryByRole('link', {name: 'Thread 3'})).not.toBeInTheDocument();
    });

    test('should show an empty state when the unread filter is active and nothing is unread', () => {
        renderWithContext(
            <ThreadList
                {...props}
                currentFilter={ThreadFilter.unread}
                someUnread={false}
                unreadIds={[]}
            />,
            getInitialState({totalUnread: 0}),
        );

        expect(screen.getByRole('heading', {name: 'No unread threads'})).toBeVisible();
        expect(screen.getByText('You\'re all caught up')).toBeVisible();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    test('should support filter:all', async () => {
        renderWithContext(
            <ThreadList
                {...props}
                currentFilter={ThreadFilter.unread}
            />,
            getInitialState(),
        );

        await userEvent.click(screen.getByRole('tab', {name: 'Followed threads'}));

        expect(props.setFilter).toHaveBeenCalledTimes(1);
        expect(props.setFilter).toHaveBeenCalledWith('');
    });

    test('should support filter:unread', async () => {
        renderWithContext(<ThreadList {...props}/>, getInitialState());

        await userEvent.click(screen.getByRole('tab', {name: 'Unreads'}));

        expect(props.setFilter).toHaveBeenCalledTimes(1);
        expect(props.setFilter).toHaveBeenCalledWith('unread');
    });

    test('should move between filters with the arrow keys', async () => {
        const {rerender} = renderWithContext(<ThreadList {...props}/>, getInitialState());

        screen.getByRole('tab', {name: 'Followed threads'}).focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(props.setFilter).toHaveBeenLastCalledWith('unread');

        rerender(
            <ThreadList
                {...props}
                currentFilter={ThreadFilter.unread}
            />,
        );

        await userEvent.keyboard('{ArrowLeft}');
        expect(props.setFilter).toHaveBeenLastCalledWith('');

        expect(props.setFilter).toHaveBeenCalledTimes(2);
    });

    test('should support openModal', async () => {
        const {store} = renderWithContext(<ThreadList {...props}/>, getInitialState());

        await userEvent.click(screen.getByRole('button', {name: 'Mark all threads as read'}));

        expect(openModal).toHaveBeenCalledTimes(1);
        expect(openModal).toHaveBeenCalledWith(expect.objectContaining({
            modalId: ModalIdentifiers.MARK_ALL_THREADS_AS_READ,
            dialogType: MarkAllThreadsAsReadModal,
        }));
        expect(store.getState().views.modals.modalState[ModalIdentifiers.MARK_ALL_THREADS_AS_READ]?.open).toBe(true);
    });

    test('should mark all threads in the team as read when the modal is confirmed', async () => {
        const {store} = renderWithContext(<ThreadList {...props}/>, getInitialState());

        await userEvent.click(screen.getByRole('button', {name: 'Mark all threads as read'}));
        act(() => {
            getOpenedModalProps().onConfirm();
        });

        expect(markAllThreadsInTeamRead).toHaveBeenCalledTimes(1);
        expect(markAllThreadsInTeamRead).toHaveBeenCalledWith('uid', 'tid');
        expect(mockRouting.clear).not.toHaveBeenCalled();
        expect(closeModal).toHaveBeenCalledWith(ModalIdentifiers.MARK_ALL_THREADS_AS_READ);
        expect(store.getState().views.modals.modalState[ModalIdentifiers.MARK_ALL_THREADS_AS_READ]).toBeUndefined();
    });

    test('should clear the selected thread after marking all as read while filtering unreads', async () => {
        renderWithContext(
            <ThreadList
                {...props}
                currentFilter={ThreadFilter.unread}
            />,
            getInitialState(),
        );

        await userEvent.click(screen.getByRole('button', {name: 'Mark all threads as read'}));
        act(() => {
            getOpenedModalProps().onConfirm();
        });

        expect(markAllThreadsInTeamRead).toHaveBeenCalledWith('uid', 'tid');
        expect(mockRouting.clear).toHaveBeenCalledTimes(1);
    });

    test('should not mark anything as read when the modal is cancelled', async () => {
        const {store} = renderWithContext(<ThreadList {...props}/>, getInitialState());

        await userEvent.click(screen.getByRole('button', {name: 'Mark all threads as read'}));
        act(() => {
            getOpenedModalProps().onCancel();
        });

        expect(markAllThreadsInTeamRead).not.toHaveBeenCalled();
        expect(closeModal).toHaveBeenCalledWith(ModalIdentifiers.MARK_ALL_THREADS_AS_READ);
        expect(store.getState().views.modals.modalState[ModalIdentifiers.MARK_ALL_THREADS_AS_READ]).toBeUndefined();
    });

    test('should support getThreads', async () => {
        const {container} = renderWithContext(<ThreadList {...props}/>, getInitialState({total: 5}));

        expect(getThreadsForCurrentTeam).toHaveBeenCalledTimes(1);
        expect(getThreadsForCurrentTeam).toHaveBeenCalledWith({unread: false, before: '3'});

        await waitFor(() => {
            expect(container.querySelector('.loading-screen')).not.toBeInTheDocument();
        });
        expect(screen.getAllByRole('link')).toHaveLength(3);
    });

    test('should show a loading indicator until older threads have loaded', async () => {
        let resolveLoad: (result: ActionResult<UserThreadList>) => void = () => {};
        jest.mocked(getThreadsForCurrentTeam).mockImplementationOnce(() => () => new Promise((resolve) => {
            resolveLoad = resolve;
        }));

        const {container} = renderWithContext(<ThreadList {...props}/>, getInitialState({total: 5}));

        expect(getThreadsForCurrentTeam).toHaveBeenCalledWith({unread: false, before: '3'});
        expect(screen.getAllByRole('link')).toHaveLength(3);
        expect(container.querySelector('.loading-screen')).toBeVisible();

        await act(async () => {
            resolveLoad({data: emptyThreadList});
        });

        expect(container.querySelector('.loading-screen')).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', {name: 'That’s the end of the list'})).not.toBeInTheDocument();
    });

    test('should show search guidance once every followed thread has loaded', async () => {
        const {container, rerender} = renderWithContext(<ThreadList {...props}/>, getInitialState({total: 5}));

        await waitFor(() => {
            expect(container.querySelector('.loading-screen')).not.toBeInTheDocument();
        });

        rerender(
            <ThreadList
                {...props}
                ids={['1', '2', '3', '4', '5']}
            />,
        );

        expect(screen.getAllByRole('link')).toHaveLength(5);
        expect(screen.getByRole('heading', {name: 'That’s the end of the list'})).toBeVisible();
        expect(getThreadsForCurrentTeam).toHaveBeenCalledTimes(1);
    });

    test('should skip the selected thread when requesting older threads', async () => {
        const {container} = renderWithContext(
            <ThreadList
                {...props}
                selectedThreadId='3'
            />,
            getInitialState({total: 5}),
        );

        expect(getThreadsForCurrentTeam).toHaveBeenCalledTimes(1);
        expect(getThreadsForCurrentTeam).toHaveBeenCalledWith({unread: false, before: '2'});

        await waitFor(() => {
            expect(container.querySelector('.loading-screen')).not.toBeInTheDocument();
        });
    });

    test('should request older unread threads when the unread filter is active', async () => {
        const {container} = renderWithContext(
            <ThreadList
                {...props}
                currentFilter={ThreadFilter.unread}
            />,
            getInitialState({totalUnread: 4}),
        );

        expect(getThreadsForCurrentTeam).toHaveBeenCalledTimes(1);
        expect(getThreadsForCurrentTeam).toHaveBeenCalledWith({unread: true, before: '2'});

        await waitFor(() => {
            expect(container.querySelector('.loading-screen')).not.toBeInTheDocument();
        });
        expect(screen.queryByRole('heading', {name: 'That’s the end of the list'})).not.toBeInTheDocument();
    });

    test('should not request more threads when every thread is already loaded', () => {
        renderWithContext(<ThreadList {...props}/>, getInitialState());

        expect(getThreadsForCurrentTeam).not.toHaveBeenCalled();
    });

    test('should select the next and previous threads with the arrow keys', () => {
        renderWithContext(
            <ThreadList
                {...props}
                selectedThreadId='2'
            />,
            getInitialState(),
        );

        fireEvent.keyDown(document, {key: 'ArrowDown', keyCode: 40});
        expect(mockRouting.select).toHaveBeenLastCalledWith('3');

        fireEvent.keyDown(document, {key: 'ArrowUp', keyCode: 38});
        expect(mockRouting.select).toHaveBeenLastCalledWith('1');

        expect(mockRouting.select).toHaveBeenCalledTimes(2);
    });

    test('should select the first thread with the arrow keys when nothing is selected', () => {
        renderWithContext(<ThreadList {...props}/>, getInitialState());

        fireEvent.keyDown(document, {key: 'ArrowDown', keyCode: 40});

        expect(mockRouting.select).toHaveBeenCalledTimes(1);
        expect(mockRouting.select).toHaveBeenCalledWith('1');
    });

    test('should not change the selected thread with the arrow keys while typing in an input', () => {
        renderWithContext(
            <>
                <input aria-label='Search'/>
                <ThreadList
                    {...props}
                    selectedThreadId='2'
                />
            </>,
            getInitialState(),
        );

        fireEvent.keyDown(screen.getByRole('textbox', {name: 'Search'}), {key: 'ArrowDown', keyCode: 40});

        expect(mockRouting.select).not.toHaveBeenCalled();
    });
});
