// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default function UserSettingsSearchEmpty() {
    return (
        <div
            className='user-settings-search-empty'
            data-testid='userSettingsSearchEmpty'
        >
            <FormattedMessage
                id='user.settings.search.noResults'
                defaultMessage='No settings match your search.'
            />
        </div>
    );
}
