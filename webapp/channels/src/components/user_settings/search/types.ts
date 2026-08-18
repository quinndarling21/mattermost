// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type UserSettingsSearchItem = {

    /** Stable unique id for list keys and tests */
    id: string;

    /** Settings tab id (e.g. display, notifications, plugin id) */
    tab: string;

    /** Localized tab label shown as the result group header */
    tabLabel: string;

    /** Section id used by activeSection / updateSection */
    section: string;

    /** Localized setting label shown in results */
    label: string;

    /** Optional localized help / description text used for matching */
    description?: string;

    /** Extra user language that may not appear verbatim in the UI */
    aliases: string[];

    /** True when the item comes from a plugin preference tab */
    isPlugin?: boolean;
};

export type UserSettingsSearchMatch = UserSettingsSearchItem & {
    score: number;
};
