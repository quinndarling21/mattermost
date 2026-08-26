// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {lazy} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {UserProfile} from '@mattermost/types/users';

import {getUserPreferences} from 'mattermost-redux/actions/preferences';
import {getUser, sendVerificationEmail} from 'mattermost-redux/actions/users';
import {getConfig, getCustomProfileAttributes} from 'mattermost-redux/selectors/entities/general';
import {getUserPreferences as getUserPreferencesSelector} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser, getUser as getUserSelector} from 'mattermost-redux/selectors/entities/users';
import {hasUserAccessTokenRole, isSystemAdmin} from 'mattermost-redux/utils/user_utils';

import {getPluginUserSettings} from 'selectors/plugins';

import {makeAsyncComponent} from 'components/async_load';
import type {UserSettingsSearchAvailability} from 'components/user_settings/search';

import Constants from 'utils/constants';

import type {GlobalState} from 'types/store';

const UserSettingsModalAsync = makeAsyncComponent('UserSettingsModal', lazy(() => import('./user_settings_modal')));

import type {OwnProps} from './user_settings_modal';

function getSearchAvailability(
    state: GlobalState,
    ownProps: OwnProps,
    user?: UserProfile,
): UserSettingsSearchAvailability {
    const config = getConfig(state);
    const mfaEnabled = config.EnableMultifactorAuthentication === 'true';
    const tokensEnabled = config.EnableUserAccessTokens === 'true';

    return {
        enableThemeSelection: config.EnableThemeSelection === 'true',
        adminMode: Boolean(ownProps.adminMode),
        enableLinkPreviews: config.EnableLinkPreviews === 'true',
        lastActiveTimeEnabled: config.EnableLastActiveTime === 'true',
        enableAutoResponder: config.ExperimentalEnableAutomaticReplies === 'true',
        enableUserDeactivation: config.EnableUserDeactivation === 'true',
        userAuthService: user?.auth_service ?? '',
        mfaAvailable: Boolean(
            user &&
            mfaEnabled &&
            (user.auth_service === '' || user.auth_service === Constants.LDAP_SERVICE),
        ),
        enableOAuthServiceProvider: config.EnableOAuthServiceProvider === 'true',
        canUseAccessTokens: Boolean(
            user &&
            tokensEnabled &&
            (hasUserAccessTokenRole(user.roles) || isSystemAdmin(user.roles)),
        ),
    };
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const config = getConfig(state);

    const sendEmailNotifications = config.SendEmailNotifications === 'true';
    const requireEmailVerification = config.RequireEmailVerification === 'true';

    const user = ownProps.adminMode && ownProps.userID ? getUserSelector(state, ownProps.userID) : getCurrentUser(state);

    return {
        user,
        userPreferences: ownProps.adminMode && ownProps.userID ? getUserPreferencesSelector(state, ownProps.userID) : undefined,
        sendEmailNotifications,
        requireEmailVerification,
        pluginSettings: getPluginUserSettings(state),
        customProfileAttributeFields: getCustomProfileAttributes(state),
        searchAvailability: getSearchAvailability(state, ownProps, user),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            sendVerificationEmail,
            getUserPreferences,
            getUser,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsModalAsync);
