// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {selectPostFromRightHandSideSearch} from 'actions/views/rhs';

import {renderWithContext, screen, userEvent} from 'tests/react_testing_utils';
import {TestHelper} from 'utils/test_helper';

import TopAnswerCard from './top_answer_card';

jest.mock('actions/views/rhs', () => ({
    selectPostFromRightHandSideSearch: jest.fn(() => ({type: 'MOCK_SELECT_POST'})),
}));

describe('components/search_results/TopAnswerCard', () => {
    const user = TestHelper.getUserMock({id: 'user1', username: 'casey'});
    const channel = TestHelper.getChannelMock({id: 'channel1', name: 'incident-response', display_name: 'Incident Response'});
    const post = TestHelper.getPostMock({
        id: 'post1',
        user_id: user.id,
        channel_id: channel.id,
        message: 'Rollback steps for a failed deploy.',
        create_at: new Date('2026-06-12T12:00:00Z').getTime(),
    });

    const baseState = {
        entities: {
            users: {
                currentUserId: 'user1',
                profiles: {[user.id]: user},
            },
            channels: {
                currentChannelId: channel.id,
                channels: {[channel.id]: channel},
            },
            general: {
                config: {},
                license: {},
            },
            preferences: {myPreferences: {}},
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render best match content and jump to the post', async () => {
        renderWithContext(
            <TopAnswerCard post={post}/>,
            baseState,
        );

        expect(screen.getByText('Best Match')).toBeInTheDocument();
        expect(screen.getByText(/@casey/)).toBeInTheDocument();
        expect(screen.getByText(/#incident-response/)).toBeInTheDocument();
        expect(screen.getByText('Rollback steps for a failed deploy.')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', {name: 'Jump to message'}));
        expect(jest.mocked(selectPostFromRightHandSideSearch)).toHaveBeenCalledWith(post);
    });
});
