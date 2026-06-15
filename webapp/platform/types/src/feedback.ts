// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type FeedbackType = 'feature' | 'bug';

export type SubmitFeedbackRequest = {
    type: FeedbackType;
    title: string;
    description: string;
};

export type SubmitFeedbackResponse = {
    identifier: string;
    title: string;
    url: string;
};
