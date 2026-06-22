// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {DeepPartial} from '@mattermost/types/utilities';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import type {GlobalState} from 'types/store';

import DocsLink, {LOCAL_DOCS_URL} from './docs_link';

describe('components/global_header/center_controls/docs_link', () => {
    const initialState: DeepPartial<GlobalState> = {
        entities: {
            general: {
                config: {},
                license: {},
            },
            users: {
                currentUserId: 'currentUserId',
            },
        },
    };

    test('links to the local documentation site', () => {
        renderWithContext(
            <DocsLink/>,
            initialState,
        );

        const link = screen.getByRole('link', {name: 'Docs'});

        expect(link).toHaveAttribute('href', LOCAL_DOCS_URL);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
});
