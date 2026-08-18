// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {render, screen} from '@testing-library/react';
import React from 'react';

import HighlightMatches from './highlight_matches';

describe('HighlightMatches', () => {
    it('renders plain text when the query does not match', () => {
        render(
            <HighlightMatches
                text='Theme'
                query='dark'
            />,
        );
        expect(screen.getByText('Theme')).toBeInTheDocument();
        expect(screen.queryByRole('mark')).not.toBeInTheDocument();
    });

    it('highlights case-insensitive matches', () => {
        render(
            <HighlightMatches
                text='Desktop notifications'
                query='notif'
            />,
        );
        expect(screen.getByText('notif')).toHaveClass('SettingsSidebar__searchHighlight');
    });

    it('highlights every occurrence', () => {
        const {container} = render(
            <HighlightMatches
                text='Notification notification'
                query='Notification'
            />,
        );
        expect(container.querySelectorAll('mark')).toHaveLength(2);
    });
});
