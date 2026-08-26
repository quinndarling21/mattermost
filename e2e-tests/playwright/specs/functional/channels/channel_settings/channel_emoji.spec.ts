// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, test} from '@mattermost/playwright-lib';
import type {Page} from '@playwright/test';

async function pickFirstVisibleEmoji(page: Page): Promise<string> {
    const picker = page.locator('#emojiPicker');
    await expect(picker).toBeVisible();

    const firstEmoji = picker.getByTestId('emojiItem').first();
    await expect(firstEmoji).toBeVisible();
    const ariaLabel = await firstEmoji.getAttribute('aria-label');
    if (!ariaLabel) {
        throw new Error('Expected the first emoji picker item to have an accessible name');
    }
    const emojiName = ariaLabel.replace(/ emoji$/i, '').replaceAll(' ', '_');

    await firstEmoji.click();
    await expect(picker).not.toBeVisible();
    return emojiName;
}

/**
 * @objective Assign a channel emoji from channel settings and show it in the left sidebar.
 * @reference MAT-9
 */
test(
    'MAT-9_1 should show a chosen channel emoji in the sidebar',
    {tag: ['@channel_settings', '@emoji']},
    async ({pw}) => {
        // # Initialize a test user and create a public channel
        const {team, user, userClient} = await pw.initSetup();
        const channel = await userClient.createChannel(
            pw.random.channel({
                teamId: team.id,
                name: 'emoji-public',
                displayName: 'Emoji Public',
                type: 'O',
                unique: true,
            }),
        );

        // # Log in and open the channel
        const {channelsPage} = await pw.testBrowser.login(user);
        await channelsPage.goto(team.name, channel.name);
        await channelsPage.toBeVisible();

        // * Sidebar still shows the public-channel globe before an emoji is set
        const sidebarItem = channelsPage.sidebarLeft.getChannelItem(channel.name);
        await expect(sidebarItem.locator('.icon-globe')).toBeVisible();

        // # Open channel settings and pick an emoji
        const channelSettingsModal = await channelsPage.openChannelSettings();
        const infoSettings = await channelSettingsModal.openInfoTab();
        await expect(infoSettings.emojiButton).toBeVisible();
        await infoSettings.emojiButton.click();
        const emojiName = await pickFirstVisibleEmoji(channelsPage.page);

        // # Save the change
        await channelSettingsModal.save();
        await channelSettingsModal.close();

        // * The sidebar replaces the globe with the selected emoji
        await expect(sidebarItem.getByLabel(`:${emojiName}:`)).toBeVisible();
        await expect(sidebarItem.locator('.icon-globe')).toHaveCount(0);

        // * The channel header also shows the emoji next to the name
        await expect(channelsPage.page.locator('#channelHeaderDropdownButton').getByLabel(`:${emojiName}:`)).toBeVisible();
    },
);

/**
 * @objective Clear a channel emoji and restore the type icon in the sidebar and header.
 * @reference MAT-9
 */
test(
    'MAT-9_2 should restore the type icon after the channel emoji is removed',
    {tag: ['@channel_settings', '@emoji']},
    async ({pw}) => {
        const {team, user, userClient} = await pw.initSetup();
        const channel = await userClient.createChannel(
            pw.random.channel({
                teamId: team.id,
                name: 'emoji-clear',
                displayName: 'Emoji Clear',
                type: 'O',
                unique: true,
                emoji: 'slightly_smiling_face',
            }),
        );

        const {channelsPage} = await pw.testBrowser.login(user);
        await channelsPage.goto(team.name, channel.name);
        await channelsPage.toBeVisible();

        const sidebarItem = channelsPage.sidebarLeft.getChannelItem(channel.name);
        await expect(sidebarItem.getByLabel(':slightly_smiling_face:')).toBeVisible();

        const channelSettingsModal = await channelsPage.openChannelSettings();
        const infoSettings = await channelSettingsModal.openInfoTab();
        await expect(infoSettings.removeEmojiButton).toBeVisible();
        await infoSettings.removeEmojiButton.click();
        await channelSettingsModal.save();
        await channelSettingsModal.close();

        await expect(sidebarItem.locator('.icon-globe')).toBeVisible();
        await expect(sidebarItem.getByLabel(':slightly_smiling_face:')).toHaveCount(0);
        await expect(channelsPage.page.locator('#channelHeaderDropdownButton').getByLabel(':slightly_smiling_face:')).toHaveCount(0);
    },
);

/**
 * @objective Assign a channel emoji on a private channel and replace the lock icon.
 * @reference MAT-9
 */
test(
    'MAT-9_3 should replace the private-channel lock with the chosen emoji',
    {tag: ['@channel_settings', '@emoji']},
    async ({pw}) => {
        const {team, user, userClient} = await pw.initSetup();
        const channel = await userClient.createChannel(
            pw.random.channel({
                teamId: team.id,
                name: 'emoji-private',
                displayName: 'Emoji Private',
                type: 'P',
                unique: true,
            }),
        );

        const {channelsPage} = await pw.testBrowser.login(user);
        await channelsPage.goto(team.name, channel.name);
        await channelsPage.toBeVisible();

        const sidebarItem = channelsPage.sidebarLeft.getChannelItem(channel.name);
        await expect(sidebarItem.locator('.icon-lock-outline')).toBeVisible();

        const channelSettingsModal = await channelsPage.openChannelSettings();
        const infoSettings = await channelSettingsModal.openInfoTab();
        await infoSettings.emojiButton.click();
        const emojiName = await pickFirstVisibleEmoji(channelsPage.page);

        await channelSettingsModal.save();
        await channelSettingsModal.close();

        await expect(sidebarItem.getByLabel(`:${emojiName}:`)).toBeVisible();
        await expect(sidebarItem.locator('.icon-lock-outline')).toHaveCount(0);
        await expect(channelsPage.page.locator('#channelHeaderDropdownButton').getByLabel(`:${emojiName}:`)).toBeVisible();
    },
);
