// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator, expect} from '@playwright/test';

import EmojiGifPicker from '../emoji_gif_picker';

export default class InfoSettings {
    readonly container: Locator;
    readonly nameInput: Locator;

    readonly emojiField: Locator;
    readonly emojiPickerButton: Locator;
    readonly emojiRemoveButton: Locator;
    readonly emojiHelpText: Locator;
    readonly emojiPicker: EmojiGifPicker;

    readonly saveButton: Locator;
    readonly savedMessage: Locator;

    constructor(container: Locator) {
        this.container = container;
        this.nameInput = container.locator('#input_channel-settings-name');

        this.emojiField = container.getByRole('group', {name: 'Channel emoji (optional)'});
        this.emojiPickerButton = this.emojiField.getByTestId('channelEmojiPickerButton');
        this.emojiRemoveButton = this.emojiField.getByTestId('channelEmojiRemoveButton');
        this.emojiHelpText = this.emojiField.getByText(
            'Appears next to the channel name in the sidebar for all channel members.',
        );

        // The emoji picker renders in a floating portal outside the modal, and that portal is aria-hidden while the
        // modal is open, so it cannot be located by role.
        this.emojiPicker = new EmojiGifPicker(container.page().locator('#emojiPicker'));

        this.saveButton = container.getByTestId('SaveChangesPanel__save-btn');
        this.savedMessage = container.getByText('Settings saved');
    }

    async toBeVisible() {
        await expect(this.container).toBeVisible();
    }

    async updateName(name: string) {
        await expect(this.nameInput).toBeVisible();
        await this.nameInput.clear();
        await this.nameInput.fill(name);
    }

    async openEmojiPicker(): Promise<EmojiGifPicker> {
        await expect(this.emojiPickerButton).toBeVisible();
        await this.emojiPickerButton.click();
        await this.emojiPicker.toBeVisible();

        return this.emojiPicker;
    }

    async removeEmoji() {
        await expect(this.emojiRemoveButton).toBeVisible();
        await this.emojiRemoveButton.click();
        await expect(this.emojiRemoveButton).not.toBeVisible();
    }

    async assertEmoji(emojiName: string) {
        await expect(this.emojiField).toBeVisible();
        await expect(this.emojiPickerButton).toHaveAccessibleName('Change emoji');
        await expect(this.emojiPickerButton.locator(`[data-emoticon="${emojiName}"]`)).toBeVisible();
        await expect(this.emojiRemoveButton).toBeVisible();
        await expect(this.emojiHelpText).toBeVisible();
    }

    async assertNoEmoji() {
        await expect(this.emojiField).toBeVisible();
        await expect(this.emojiPickerButton).toHaveAccessibleName('Choose emoji');
        await expect(this.emojiPickerButton.locator('[data-emoticon]')).toHaveCount(0);
        await expect(this.emojiRemoveButton).not.toBeVisible();
        await expect(this.emojiHelpText).toBeVisible();
    }

    /**
     * Saves pending changes through the save-changes panel and waits for the "Settings saved" confirmation.
     */
    async save() {
        await expect(this.saveButton).toBeVisible();
        await this.saveButton.click();
        await expect(this.savedMessage).toBeVisible();
    }
}
