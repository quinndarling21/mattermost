// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {isUserSettingsSectionVisible} from 'utils/user_settings_search';
import type {UserSettingsSearchFilter} from 'utils/user_settings_search';

type Props = {
    tab: string;
    section: string;
    searchFilter: UserSettingsSearchFilter;
    children: React.ReactNode;
};

export default function UserSettingsSearchSection(props: Props) {
    if (!isUserSettingsSectionVisible(props.tab, props.section, props.searchFilter)) {
        return null;
    }

    return <>{props.children}</>;
}
