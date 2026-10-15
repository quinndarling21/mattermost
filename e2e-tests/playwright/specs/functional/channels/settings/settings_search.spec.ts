// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, test} from '@mattermost/playwright-lib';

/**
 * @objective Filter Settings modal tabs by typing in the search field
 */
test('MAT-15 filters settings tabs from the search field', {tag: ['@settings']}, async ({pw}) => {
    const {user} = await pw.initSetup();
    const {channelsPage} = await pw.testBrowser.login(user);

    await channelsPage.goto();
    await channelsPage.toBeVisible();

    const settingsModal = await channelsPage.globalHeader.openSettings();
    await settingsModal.toBeVisible();

    // * Search is visible and not focused on open
    await expect(settingsModal.searchInput).toBeVisible();
    await expect(settingsModal.searchInput).not.toBeFocused();
    await expect(settingsModal.notificationsTab).toBeVisible();
    await expect(settingsModal.displayTab).toBeVisible();

    // # Search for theme
    await settingsModal.searchFor('theme');

    // * Only Display remains and is selected
    await expect(settingsModal.displayTab).toBeVisible();
    await expect(settingsModal.displayTab).toHaveAttribute('aria-selected', 'true');
    await expect(settingsModal.notificationsTab).toBeHidden();
    await expect(settingsModal.sidebarTab).toBeHidden();
    await expect(settingsModal.advancedTab).toBeHidden();
    await expect(settingsModal.displaySettings.container).toBeVisible();

    // # Search for something with no matches
    await settingsModal.searchFor('zzzz');

    // * Empty state is shown
    await expect(settingsModal.searchEmpty).toBeVisible();
    await expect(settingsModal.searchEmpty).toContainText('No settings match "zzzz"');
    await expect(settingsModal.displayTab).toBeHidden();

    // # Clear the search
    await settingsModal.searchEmpty.getByRole('button', {name: 'Clear search'}).click();

    // * Full tab list is restored
    await expect(settingsModal.searchInput).toHaveValue('');
    await expect(settingsModal.notificationsTab).toBeVisible();
    await expect(settingsModal.displayTab).toBeVisible();
    await expect(settingsModal.sidebarTab).toBeVisible();
    await expect(settingsModal.advancedTab).toBeVisible();
});
