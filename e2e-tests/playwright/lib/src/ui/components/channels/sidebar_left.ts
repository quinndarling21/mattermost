// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator, expect} from '@playwright/test';

export default class ChannelsSidebarLeft {
    readonly container: Locator;

    readonly teamMenuButton: Locator;
    readonly browseOrCreateChannelButton: Locator;
    readonly findChannelButton;
    readonly scheduledPostBadge;
    readonly unreadChannelFilter;
    readonly openDirectMessageButton;

    constructor(container: Locator) {
        this.container = container;

        this.teamMenuButton = container.locator('#sidebarTeamMenuButton');
        this.browseOrCreateChannelButton = container.locator('#browseOrAddChannelMenuButton');
        this.findChannelButton = container.getByRole('button', {name: 'Find Channels'});
        this.scheduledPostBadge = container.locator('span.scheduledPostBadge');
        this.unreadChannelFilter = container.locator('.SidebarFilters_filterButton');
        this.openDirectMessageButton = container.getByRole('button', {name: 'Write a direct message'});
    }

    async toBeVisible() {
        await expect(this.container).toBeVisible();
    }

    /**
     * Clicks on the sidebar channel link with the given name.
     * It can be any sidebar item name including channels, direct messages, or group messages, threads, etc.
     * @param channelName
     */
    async goToItem(channelName: string) {
        const channel = this.container.locator(`#sidebarItem_${channelName}`);
        await channel.waitFor();
        await channel.click();
    }

    /**
     * Returns the sidebar item for the channel with the given name (the channel's URL name, not its display name).
     */
    getChannelItem(channelName: string): Locator {
        return this.container.locator(`#sidebarItem_${channelName}`);
    }

    /**
     * Returns the channel emoji rendered next to the channel name in the sidebar item.
     */
    getChannelEmoji(channelName: string): Locator {
        return this.getChannelItem(channelName).locator('.SidebarChannelLinkLabel_wrapper > .emoticon');
    }

    /**
     * Verifies that the channel's sidebar item shows the given emoji immediately before the channel name.
     */
    async toHaveChannelEmoji(channelName: string, emojiName: string) {
        const channelItem = this.getChannelItem(channelName);
        await expect(channelItem).toBeVisible();

        const elementBeforeLabel = channelItem
            .locator('.SidebarChannelLinkLabel_wrapper > .SidebarChannelLinkLabel')
            .locator('xpath=preceding-sibling::*[1]');
        await expect(elementBeforeLabel).toBeVisible();
        await expect(elementBeforeLabel).toHaveClass(/\bemoticon\b/);
        await expect(elementBeforeLabel).toHaveAttribute('data-emoticon', emojiName);
    }

    /**
     * Verifies that the channel's sidebar item does not show a channel emoji.
     */
    async toHaveNoChannelEmoji(channelName: string) {
        await expect(this.getChannelItem(channelName)).toBeVisible();
        await expect(this.getChannelEmoji(channelName)).toHaveCount(0);
    }

    /**
     * Verifies 'Drafts' as a sidebar link exists in LHS.
     */
    async draftsVisible() {
        const draftSidebarLink = this.container.getByText('Drafts', {exact: true});
        await draftSidebarLink.waitFor();
        await expect(draftSidebarLink).toBeVisible();
    }

    /**
     * Verifies 'Drafts' as a sidebar link does not exist in LHS.
     */
    async draftsNotVisible() {
        const channel = this.container.getByText('Drafts', {exact: true});
        await expect(channel).not.toBeVisible();
    }

    /**
     * Verifies if 'unreads' filter is applied to sidebar.
     */
    async isUnreadsFilterActive(): Promise<boolean> {
        return await this.unreadChannelFilter.evaluate((el) => el.classList.contains('active'));
    }

    /**
     * Toggles the unread filter on or off.
     */
    async toggleUnreadsFilter() {
        await this.unreadChannelFilter.click();
    }

    /**
     * Gets all unread channel items in the sidebar.
     */
    getUnreadChannels(): Locator {
        return this.container.locator('.SidebarLink.unread-title');
    }
}
