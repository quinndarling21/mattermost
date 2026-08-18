// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export {filterUserSettings, groupSearchMatchesByTab, normalizeSearchText} from './filter_user_settings';
export {
    buildUserSettingsSearchItems,
    getFirstPartyProductSettingSectionIds,
    getFirstPartyProfileSettingSectionIds,
} from './user_settings_search_metadata';
export type {UserSettingsSearchAvailability, BuildUserSettingsSearchItemsOptions} from './user_settings_search_metadata';
export type {UserSettingsSearchItem, UserSettingsSearchMatch} from './types';
