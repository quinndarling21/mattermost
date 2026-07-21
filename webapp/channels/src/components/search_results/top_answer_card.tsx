// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {Button} from '@mattermost/shared/components/button';
import type {Post} from '@mattermost/types/posts';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import {selectPostFromRightHandSideSearch} from 'actions/views/rhs';

import Tag from 'components/widgets/tag/tag';

import type {GlobalState} from 'types/store';

import './top_answer_card.scss';

type Props = {
    post: Post;
};

export default function TopAnswerCard({post}: Props) {
    const {formatDate} = useIntl();
    const dispatch = useDispatch();

    const user = useSelector((state: GlobalState) => getUser(state, post.user_id));
    const channel = useSelector((state: GlobalState) => getChannel(state, post.channel_id));

    const username = user?.username ? `@${user.username}` : '';
    const channelName = channel?.name ? `#${channel.name}` : '';
    const dateLabel = formatDate(post.create_at, {
        month: 'short',
        day: 'numeric',
    });

    const metaParts = [username, channelName, dateLabel].filter(Boolean);

    const handleJump = useCallback(() => {
        dispatch(selectPostFromRightHandSideSearch(post));
    }, [dispatch, post]);

    return (
        <div className='TopAnswerCard'>
            <div className='TopAnswerCard__tagRow'>
                <Tag
                    className='TopAnswerCard__tag'
                    text={
                        <FormattedMessage
                            id='search_results.best_match'
                            defaultMessage='Best Match'
                        />
                    }
                    uppercase={true}
                    size='sm'
                />
                {metaParts.length > 0 && (
                    <span className='TopAnswerCard__meta'>
                        {metaParts.join(' · ')}
                    </span>
                )}
            </div>
            <p className='TopAnswerCard__snippet'>
                {post.message}
            </p>
            <div className='TopAnswerCard__actions'>
                <Button
                    type='button'
                    emphasis='secondary'
                    size='sm'
                    onClick={handleJump}
                >
                    <FormattedMessage
                        id='search_results.jump_to_message'
                        defaultMessage='Jump to message'
                    />
                </Button>
            </div>
        </div>
    );
}
