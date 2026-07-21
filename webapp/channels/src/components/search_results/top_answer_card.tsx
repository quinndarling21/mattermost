// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedDate, FormattedMessage} from 'react-intl';
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
    post: Post;
    teamName: string;
};

const TopAnswerCard = ({post, teamName}: Props) => {
    const author = useSelector((state: GlobalState) => getUser(state, post.user_id));
    const channel = useSelector((state: GlobalState) => getChannel(state, post.channel_id));

    const handleJump = useCallback(() => {
        if (teamName) {
            getHistory().push(`/${teamName}/pl/${post.id}`);
        }
    }, [teamName, post.id]);

    return (
        <div className='TopAnswerCard'>
            <div className='TopAnswerCard__meta'>
                <Tag
                    variant='success'
                    size='sm'
                    uppercase={true}
                    text={
                        <FormattedMessage
                            id='top_answer_card.best_match'
                            defaultMessage='Best match'
                        />
                    }
                />
                <span className='TopAnswerCard__meta-detail'>
                    {author && <span className='TopAnswerCard__author'>{`@${author.username}`}</span>}
                    {channel && <span className='TopAnswerCard__channel'>{`#${channel.display_name}`}</span>}
                    <span className='TopAnswerCard__date'>
                        <FormattedDate
                            value={post.create_at}
                            month='short'
                            day='numeric'
                        />
                    </span>
                </span>
            </div>
            <div className='TopAnswerCard__snippet'>
                {post.message}
            </div>
            <Button
                emphasis='secondary'
                size='sm'
                onClick={handleJump}
            >
                <FormattedMessage
                    id='top_answer_card.jump_to_message'
                    defaultMessage='Jump to message'
                />
            </Button>
        </div>
    );
};

export default TopAnswerCard;
