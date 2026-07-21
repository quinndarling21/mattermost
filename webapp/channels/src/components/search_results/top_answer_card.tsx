// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl, FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {Button} from '@mattermost/shared/components/button';
import type {Post} from '@mattermost/types/posts';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import Tag from 'components/widgets/tag/tag';

import {getHistory} from 'utils/browser_history';

import type {GlobalState} from 'types/store';

import './top_answer_card.scss';

type Props = {
    currentTeamName: string;
    post: Post;
};

export default function TopAnswerCard({currentTeamName, post}: Props) {
    const intl = useIntl();
    const channel = useSelector((state: GlobalState) => getChannel(state, post.channel_id));
    const author = useSelector((state: GlobalState) => getUser(state, post.user_id));
    const date = intl.formatDate(post.create_at, {month: 'short', day: 'numeric'});
    const unknown = intl.formatMessage({
        id: 'search_results.best_match.unknown',
        defaultMessage: 'unknown',
    });
    const byline = intl.formatMessage({
        id: 'search_results.best_match.byline',
        defaultMessage: '@{username} · #{channel} · {date}',
    }, {
        username: author?.username || unknown,
        channel: channel?.display_name || channel?.name || unknown,
        date,
    });

    const jumpToMessage = () => {
        getHistory().push(`/${currentTeamName}/pl/${post.id}`);
    };

    return (
        <section
            className='TopAnswerCard'
            aria-labelledby='top-answer-label'
        >
            <div className='TopAnswerCard__meta'>
                <Tag
                    className='TopAnswerCard__tag'
                    text={
                        <span id='top-answer-label'>
                            <FormattedMessage
                                id='search_results.best_match'
                                defaultMessage='Best match'
                            />
                        </span>
                    }
                    uppercase={true}
                    variant='success'
                    size='sm'
                />
                <span className='TopAnswerCard__byline'>
                    {byline}
                </span>
            </div>
            <p className='TopAnswerCard__message'>{post.message}</p>
            <Button
                emphasis='secondary'
                size='sm'
                onClick={jumpToMessage}
            >
                <FormattedMessage
                    id='search_results.jump_to_message'
                    defaultMessage='Jump to message'
                />
            </Button>
        </section>
    );
}
