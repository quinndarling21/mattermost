// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {ComponentProps} from 'react';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import VirtualizedThreadList from './virtualized_thread_list';

jest.mock('react-virtualized-auto-sizer', () => ({
    __esModule: true,
    default: ({children}: {children: (size: {height: number; width: number}) => React.ReactNode}) => (
        children({height: 400, width: 300})
    ),
}));

describe('components/threading/global_threads/thread_list/virtualized_thread_list', () => {
    let props: ComponentProps<typeof VirtualizedThreadList>;

    beforeEach(() => {
        props = {
            ids: ['1', '2', '3'],
            loadMoreItems: jest.fn(() => Promise.resolve()),
            selectedThreadId: '1',
            total: 3,
            isLoading: false,
            addNoMoreResultsItem: false,
        };
    });

    function listElement(container: HTMLElement) {
        const list = container.querySelector('.virtualized-thread-list');
        expect(list).toBeVisible();
        return list as HTMLElement;
    }

    test('should render a virtualized list of the given threads', () => {
        const {container} = renderWithContext(<VirtualizedThreadList {...props}/>);

        const list = listElement(container);
        expect(list).toHaveStyle({height: '400px', width: '300px', willChange: 'auto'});
        expect(list.firstElementChild).toHaveStyle({height: '399px'});
        expect(screen.queryByText('That\u2019s the end of the list')).not.toBeInTheDocument();
        expect(container.querySelector('.loading-screen')).not.toBeInTheDocument();
        expect(props.loadMoreItems).not.toHaveBeenCalled();
    });

    test('should show a loading row and request more threads when some are not loaded', () => {
        props.total = 40;
        props.isLoading = true;

        const {container} = renderWithContext(<VirtualizedThreadList {...props}/>);

        const list = listElement(container);
        expect(list.firstElementChild).toHaveStyle({height: '532px'});
        expect(container.querySelector('.loading-screen')).toBeVisible();
        expect(props.loadMoreItems).toHaveBeenCalled();
    });

    test('should show search guidance when there are no more results', () => {
        props.addNoMoreResultsItem = true;

        const {container} = renderWithContext(<VirtualizedThreadList {...props}/>);

        const list = listElement(container);
        expect(list.firstElementChild).toHaveStyle({height: '532px'});
        expect(screen.getByRole('heading', {name: 'That\u2019s the end of the list'})).toBeVisible();
        expect(props.loadMoreItems).not.toHaveBeenCalled();
    });
});
