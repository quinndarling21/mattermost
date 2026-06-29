// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {DigestMemberActivity, TeamDigestPreview} from '@mattermost/types/teams';

import './team_digest_preview.scss';

type Props = {
    preview: TeamDigestPreview;
};

export default function TeamDigestPreviewPanel({preview}: Props) {
    return (
        <div className='team-digest-preview'>
            <div
                className='team-digest-preview__header'
                dangerouslySetInnerHTML={{__html: preview.header_html}}
            />
            <div className='team-digest-preview__members'>
                <div className='team-digest-preview__members-title'>
                    <FormattedMessage
                        id='team_digest.preview.members'
                        defaultMessage='Member activity'
                    />
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>
                                <FormattedMessage
                                    id='team_digest.preview.username'
                                    defaultMessage='Username'
                                />
                            </th>
                            <th>
                                <FormattedMessage
                                    id='team_digest.preview.posts'
                                    defaultMessage='Posts'
                                />
                            </th>
                            <th>
                                <FormattedMessage
                                    id='team_digest.preview.replies'
                                    defaultMessage='Replies'
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {preview.members.map((member: DigestMemberActivity) => (
                            <tr key={member.user_id}>
                                <td>{member.username}</td>
                                <td>{member.post_count}</td>
                                <td>{member.reply_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
