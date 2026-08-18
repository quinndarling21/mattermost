// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, test, EmojiGifPicker} from '@mattermost/playwright-lib';

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
                type: 'O',
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

        const emojiPicker = new EmojiGifPicker(channelsPage.page.locator('#emojiPicker'));
        await emojiPicker.toBeVisible();
        await emojiPicker.clickEmoji('slightly smiling face');
        await emojiPicker.notToBeVisible();

        // # Save the change
        await channelSettingsModal.save();
        await channelSettingsModal.close();

        // * The sidebar replaces the globe with the selected emoji
        await expect(sidebarItem.getByLabel(':slightly_smiling_face:')).toBeVisible();
        await expect(sidebarItem.locator('.icon-globe')).toHaveCount(0);

        // * The channel header also shows the emoji next to the name
        await expect(channelsPage.page.locator('#channelHeaderDropdownButton').getByLabel(':slightly_smiling_face:')).toBeVisible();
    },
);
