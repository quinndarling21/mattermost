// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {ComponentProps} from 'react';

import type {UserThread} from '@mattermost/types/threads';

import initialState from 'mattermost-redux/store/initial_state';

import mergeObjects from 'packages/mattermost-redux/test/merge_objects';
import {renderWithContext, screen} from 'tests/react_testing_utils';
import {Constants} from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import Row from './virtualized_thread_list_row';

describe('components/threading/global_threads/thread_list/virtualized_thread_list_row', () => {
    const author = TestHelper.getUserMock({id: 'author_id', username: 'ada'});
    const channel = TestHelper.getChannelMock({
        id: 'channel_id',
        display_name: 'Town Square',
        name: 'town-square',
        team_id: 'tid',
    });

    let props: ComponentProps<typeof Row>;

    beforeEach(() => {
        props = {
            data: {
                ids: ['1', '2', '3'],
                selectedThreadId: undefined,
            },
            index: 1,
            style: {top: '133px'},
        };
    });

    function stateForThread(id: string) {
        const post = TestHelper.getPostMock({
            id,
            message: `Body of thread ${id}`,
            user_id: author.id,
            channel_id: channel.id,
            type: '',
            create_at: 1610486901110,
        });
        const thread = {
            id,
            reply_count: 2,
            last_reply_at: 1610486901110,
            participants: [{id: author.id}],
            unread_replies: 0,
            unread_mentions: 0,
            is_following: true,
            post,
        } as UserThread;

        return mergeObjects(initialState, {
            entities: {
                teams: {
                    currentTeamId: 'tid',
                },
                users: {
                    currentUserId: 'uid',
                    profiles: {
                        [author.id]: author,
                    },
                },
                channels: {
                    channels: {
                        [channel.id]: channel,
                    },
                },
                posts: {
                    posts: {
                        [id]: post,
                    },
                },
                threads: {
                    threads: {
                        [id]: thread,
                    },
                },
            },
        });
    }

    test('should render the thread at the given index', () => {
        renderWithContext(<Row {...props}/>, stateForThread('2'));

        const thread = screen.getByRole('link', {name: 'Thread by ada'});
        expect(thread).toBeVisible();
        expect(thread).toHaveClass('ThreadItem');
        expect(thread).not.toHaveClass('is-selected');
        expect(thread).toHaveAttribute('tabindex', '0');
        expect(thread).not.toHaveAttribute('id', 'tutorial-threads-mobile-list');
        expect(thread).toHaveStyle({top: '133px'});
        expect(screen.getByText('Body of thread 2')).toBeVisible();
        expect(screen.getByText('Town Square')).toBeVisible();
        expect(screen.getByText('2 replies')).toBeVisible();
    });

    test('should mark the selected thread and identify the first thread', () => {
        props.data.selectedThreadId = '1';
        props.index = 0;

        renderWithContext(<Row {...props}/>, stateForThread('1'));

        const thread = screen.getByRole('link', {name: 'Thread by ada'});
        expect(thread).toHaveClass('is-selected');
        expect(thread).toHaveAttribute('tabindex', '-1');
        expect(thread).toHaveAttribute('id', 'tutorial-threads-mobile-list');
        expect(screen.getByText('Body of thread 1')).toBeVisible();
    });

    test('should support item loading indicator', () => {
        const {container} = renderWithContext(
            <Row
                {...props}
                data={{ids: [...props.data.ids, Constants.THREADS_LOADING_INDICATOR_ITEM_ID], selectedThreadId: undefined}}
                index={3}
            />,
        );

        const loading = container.querySelector('.loading-screen');
        expect(loading).toBeVisible();
        expect(loading).toHaveStyle({position: 'relative', top: '133px'});
        expect(loading?.querySelectorAll('.round')).toHaveLength(3);
        expect(screen.queryByText('Loading')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', {name: 'Thread by ada'})).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', {name: 'That\u2019s the end of the list'})).not.toBeInTheDocument();
    });

    test('should support item search guidance', () => {
        const {container} = renderWithContext(
            <Row
                {...props}
                data={{ids: [...props.data.ids, Constants.THREADS_NO_RESULTS_ITEM_ID], selectedThreadId: undefined}}
                index={3}
            />,
        );

        const title = screen.getByRole('heading', {name: 'That\u2019s the end of the list'});
        expect(title).toBeVisible();
        expect(title).toHaveClass('thread-no-results-title', 'no-results__title');

        const subtitle = container.querySelector('.thread-no-results-subtitle');
        expect(subtitle).toBeVisible();
        expect(subtitle).toHaveTextContent('If you\u2019re looking for older conversations, try searching with');

        const shortcut = subtitle?.querySelector('.thread-no-results-subtitle-shortcut');
        expect(shortcut).toBeVisible();
        expect(shortcut).toHaveTextContent('Ctrl');
        expect(shortcut).toHaveTextContent('Shift');
        expect(shortcut).toHaveTextContent('F');
        expect(shortcut?.querySelector('.shortcut-key--contrast')).toBeVisible();

        const searchIcon = screen.getByRole('img', {name: 'Search Icon'});
        expect(searchIcon).toBeVisible();
        expect(searchIcon.parentElement).toHaveClass('no-results__icon');

        const wrapper = title.closest('.no-results__wrapper');
        expect(wrapper).toHaveClass('horizontal-layout');
        expect(wrapper).toHaveStyle({
            top: '133px',
            padding: '16px 16px 16px 24px',
            background: 'rgba(var(--center-channel-color-rgb), 0.04)',
        });
        expect(container.querySelector('.loading-screen')).not.toBeInTheDocument();
    });
});
