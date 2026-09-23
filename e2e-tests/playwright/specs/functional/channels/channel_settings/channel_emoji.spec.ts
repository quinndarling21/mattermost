// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, getAdminClient, test} from '@mattermost/playwright-lib';

const createdCustomEmojiIds: string[] = [];

test.afterEach(async () => {
    if (createdCustomEmojiIds.length === 0) {
        return;
    }
    const ids = createdCustomEmojiIds.splice(0);
    try {
        const {adminClient} = await getAdminClient({skipLog: true});
        await Promise.allSettled(ids.map((id) => adminClient.deleteCustomEmoji(id)));
    } catch {
        // Best-effort cleanup
    }
});

/**
 * @objective Verify that a channel emoji chosen from Channel Settings > Info with the emoji picker is shown before the
 * channel name in the sidebar for every channel member, updates live for other members, persists across reloads, and
 * can be removed again.
 */
test(
    'MAT-9 channel emoji set in Channel Settings shows in the sidebar for all members and can be removed',
    {tag: '@channel_emoji'},
    async ({pw}) => {
        // # Create a public channel as the admin and add a second member
        const {adminClient, adminUser, user, team} = await pw.initSetup();
        const channel = await adminClient.createChannel(
            pw.random.channel({
                teamId: team.id,
                name: 'channel-emoji',
                displayName: 'Channel Emoji',
                type: 'O',
                unique: true,
            }),
        );
        await adminClient.addToChannel(user.id, channel.id);

        // # Log in as the admin and open the channel
        const {page: adminPage, channelsPage: adminChannelsPage} = await pw.testBrowser.login(adminUser);
        await adminChannelsPage.goto(team.name, channel.name);
        await adminChannelsPage.toBeVisible();

        // # Log in as the second member in a separate browser context, viewing a different channel
        const {page: memberPage, channelsPage: memberChannelsPage} = await pw.testBrowser.login(user);
        await memberChannelsPage.goto(team.name, 'town-square');
        await memberChannelsPage.toBeVisible();

        // * Verify neither user sees a channel emoji in the sidebar yet
        await adminChannelsPage.sidebarLeft.toHaveNoChannelEmoji(channel.name);
        await memberChannelsPage.sidebarLeft.toHaveNoChannelEmoji(channel.name);

        // # Open Channel Settings > Info as the admin
        let channelSettingsModal = await adminChannelsPage.openChannelSettings();
        let infoSettings = await channelSettingsModal.openInfoTab();

        // * Verify the emoji field starts empty
        await infoSettings.assertNoEmoji();

        // # Open the emoji picker, search for "rocket", and pick it
        const emojiPicker = await infoSettings.openEmojiPicker();
        await emojiPicker.searchEmoji('rocket');
        await emojiPicker.selectEmoji('rocket');

        // * Verify the picker closes and the field previews the chosen emoji
        await emojiPicker.notToBeVisible();
        await infoSettings.assertEmoji('rocket');

        // # Save the change and close the modal
        await infoSettings.save();
        await channelSettingsModal.close();

        // * Verify the emoji is saved on the channel
        await expect.poll(async () => (await adminClient.getChannel(channel.id)).emoji).toBe('rocket');

        // * Verify the admin's sidebar shows the emoji before the channel name
        await adminChannelsPage.sidebarLeft.toHaveChannelEmoji(channel.name, 'rocket');

        // * Verify the second member's sidebar shows the emoji without reloading
        await memberChannelsPage.sidebarLeft.toHaveChannelEmoji(channel.name, 'rocket');

        // # Reload both pages
        await adminPage.reload();
        await adminChannelsPage.toBeVisible();
        await memberPage.reload();
        await memberChannelsPage.toBeVisible();

        // * Verify the emoji persists in both sidebars after reloading
        await adminChannelsPage.sidebarLeft.toHaveChannelEmoji(channel.name, 'rocket');
        await memberChannelsPage.sidebarLeft.toHaveChannelEmoji(channel.name, 'rocket');

        // # Reopen Channel Settings > Info as the admin
        channelSettingsModal = await adminChannelsPage.openChannelSettings();
        infoSettings = await channelSettingsModal.openInfoTab();

        // * Verify the field shows the saved emoji
        await infoSettings.assertEmoji('rocket');

        // # Remove the emoji, save, and close the modal
        await infoSettings.removeEmoji();
        await infoSettings.assertNoEmoji();
        await infoSettings.save();
        await channelSettingsModal.close();

        // * Verify the emoji is cleared on the channel
        await expect.poll(async () => (await adminClient.getChannel(channel.id)).emoji ?? '').toBe('');

        // * Verify the emoji is removed from both sidebars, without reloading the second member's page
        await adminChannelsPage.sidebarLeft.toHaveNoChannelEmoji(channel.name);
        await memberChannelsPage.sidebarLeft.toHaveNoChannelEmoji(channel.name);
    },
);

/**
 * @objective Verify that a custom emoji set as the channel emoji renders in the sidebar using the custom emoji image.
 *
 * @precondition
 * Custom emoji must be enabled (ServiceSettings.EnableCustomEmoji), which the default test server config sets.
 */
test('MAT-9 custom emoji set as the channel emoji renders in the sidebar', {tag: '@channel_emoji'}, async ({pw}) => {
    // # Create a custom emoji, a public channel, and add a member
    const {adminClient, adminUser, adminConfig, user, team} = await pw.initSetup();
    expect(adminConfig.ServiceSettings.EnableCustomEmoji).toBe(true);

    const customEmoji = await adminClient.createCustomEmoji(
        {name: `channel_emoji_${pw.random.id()}`, creator_id: adminUser.id},
        pw.getFileFromAsset('mattermost-icon_128x128.png'),
    );
    createdCustomEmojiIds.push(customEmoji.id);

    const channel = await adminClient.createChannel(
        pw.random.channel({
            teamId: team.id,
            name: 'custom-channel-emoji',
            displayName: 'Custom Channel Emoji',
            type: 'O',
            unique: true,
        }),
    );
    await adminClient.addToChannel(user.id, channel.id);

    // # Set the custom emoji as the channel emoji via the API
    const patchedChannel = await adminClient.patchChannel(channel.id, {emoji: customEmoji.name});
    expect(patchedChannel.emoji).toBe(customEmoji.name);

    // # Log in as the member and load the team fresh
    const {channelsPage} = await pw.testBrowser.login(user);
    await channelsPage.goto(team.name, 'town-square');
    await channelsPage.toBeVisible();

    // * Verify the sidebar shows the custom emoji before the channel name
    await channelsPage.sidebarLeft.toHaveChannelEmoji(channel.name, customEmoji.name);

    // * Verify the sidebar emoji uses the custom emoji image
    await expect(channelsPage.sidebarLeft.getChannelEmoji(channel.name)).toHaveCSS(
        'background-image',
        new RegExp(`/api/v4/emoji/${customEmoji.id}/image`),
    );
});
