// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {PreferencesType} from '@mattermost/types/preferences';
import type {UserProfile} from '@mattermost/types/users';

import type {PluginConfiguration} from 'types/plugins/user_settings';
import type {UserSettingsSearchFilter} from 'utils/user_settings_search';
import {isUserSettingsSectionVisible} from 'utils/user_settings_search';

import AdvancedTab from './advanced';
import DisplayTab from './display';
import GeneralTab from './general';
import NotificationsTab from './notifications';
import PluginTab from './plugin';
import SecurityTab from './security';
import SidebarTab from './sidebar';
import UserSettingsSearchEmpty from './search/user_settings_search_empty';

export type Props = {
    user: UserProfile;
    activeTab?: string;
    activeSection: string;
    updateSection: (section?: string) => void;
    updateTab: (notifications: string) => void;
    closeModal: () => void;
    collapseModal: () => void;
    setRequireConfirm: () => void;
    pluginSettings: {[tabName: string]: PluginConfiguration};
    userPreferences?: PreferencesType;
    adminMode?: boolean;
    searchFilter?: UserSettingsSearchFilter;
};

function hasVisibleSections(tab: string, searchFilter: UserSettingsSearchFilter, sectionIds: string[]) {
    if (!searchFilter.query) {
        return true;
    }

    return sectionIds.some((section) => isUserSettingsSectionVisible(tab, section, searchFilter));
}

export default function UserSettings(props: Props) {
    const searchFilter = props.searchFilter ?? {query: '', matchingSections: null};

    if (props.activeTab === 'profile') {
        if (!hasVisibleSections('profile', searchFilter, ['name', 'email', 'nickname', 'username', 'position', 'picture'])) {
            return <UserSettingsSearchEmpty/>;
        }

        return (
            <div>
                <GeneralTab
                    user={props.user}
                    activeSection={props.activeSection}
                    updateSection={props.updateSection}
                    updateTab={props.updateTab}
                    closeModal={props.closeModal}
                    collapseModal={props.collapseModal}
                    searchFilter={searchFilter}
                />
            </div>
        );
    } else if (props.activeTab === 'security') {
        if (!hasVisibleSections('security', searchFilter, ['password', 'signin', 'mfa', 'tokens', 'apps'])) {
            return <UserSettingsSearchEmpty/>;
        }

        return (
            <div>
                <SecurityTab
                    user={props.user}
                    activeSection={props.activeSection}
                    updateSection={props.updateSection}
                    closeModal={props.closeModal}
                    collapseModal={props.collapseModal}
                    setRequireConfirm={props.setRequireConfirm}
                    searchFilter={searchFilter}
                />
            </div>
        );
    } else if (props.activeTab === 'notifications') {
        if (!hasVisibleSections('notifications', searchFilter, [
            'desktopAndMobile',
            'desktopNotificationSound',
            'email',
            'keywordsAndMentions',
            'keywordsAndHighlight',
            'replyNotifications',
            'autoResponder',
        ])) {
            return <UserSettingsSearchEmpty/>;
        }

        return (
            <div>
                <NotificationsTab
                    user={props.user}
                    activeSection={props.activeSection}
                    updateSection={props.updateSection}
                    closeModal={props.closeModal}
                    collapseModal={props.collapseModal}
                    adminMode={props.adminMode}
                    userPreferences={props.userPreferences}
                    searchFilter={searchFilter}
                />
            </div>
        );
    } else if (props.activeTab === 'display') {
        if (!hasVisibleSections('display', searchFilter, [
            'theme',
            'languages',
            'timezone',
            'clock',
            'collapse',
            'linkpreview',
            'lastactive',
            'availabilityStatus',
            'renderEmoticonsAsEmoji',
            'name_format',
            'message_display',
            'channel_display_mode',
            'collapsed_reply_threads',
            'click_to_reply',
            'one_click_reactions_enabled',
        ])) {
            return <UserSettingsSearchEmpty/>;
        }

        return (
            <div>
                <DisplayTab
                    user={props.user}
                    activeSection={props.activeSection}
                    updateSection={props.updateSection}
                    closeModal={props.closeModal}
                    collapseModal={props.collapseModal}
                    setRequireConfirm={props.setRequireConfirm}
                    adminMode={props.adminMode}
                    userPreferences={props.userPreferences}
                    searchFilter={searchFilter}
                />
            </div>
        );
    } else if (props.activeTab === 'sidebar') {
        if (!hasVisibleSections('sidebar', searchFilter, ['showUnreadsCategory', 'limitVisibleGMsDMs'])) {
            return <UserSettingsSearchEmpty/>;
        }

        return (
            <div>
                <SidebarTab
                    activeSection={props.activeSection}
                    updateSection={props.updateSection}
                    closeModal={props.closeModal}
                    collapseModal={props.collapseModal}
                    adminMode={props.adminMode}
                    userId={props.user.id}
                    userPreferences={props.userPreferences}
                    searchFilter={searchFilter}
                />
            </div>
        );
    } else if (props.activeTab === 'advanced') {
        if (!hasVisibleSections('advanced', searchFilter, [
            'advancedCtrlSend',
            'formatting',
            'unread_scroll_position',
            'syncDrafts',
            'joinLeave',
            'performanceDebugging',
            'deactivateAccount',
        ])) {
            return <UserSettingsSearchEmpty/>;
        }

        return (
            <div>
                <AdvancedTab
                    activeSection={props.activeSection}
                    updateSection={props.updateSection}
                    closeModal={props.closeModal}
                    collapseModal={props.collapseModal}
                    adminMode={props.adminMode}
                    user={props.user}
                    userPreferences={props.userPreferences}
                    searchFilter={searchFilter}
                />
            </div>
        );
    } else if (props.activeTab && props.pluginSettings[props.activeTab]) {
        const plugin = props.pluginSettings[props.activeTab];
        const pluginSections = [plugin.id, ...plugin.sections.map((section) => section.title)];
        if (!hasVisibleSections(props.activeTab, searchFilter, pluginSections)) {
            return <UserSettingsSearchEmpty/>;
        }

        return (
            <div>
                <PluginTab
                    activeSection={props.activeSection}
                    updateSection={props.updateSection}
                    closeModal={props.closeModal}
                    collapseModal={props.collapseModal}
                    settings={plugin}
                    searchFilter={searchFilter}
                />
            </div>
        );
    }

    return null;
}
