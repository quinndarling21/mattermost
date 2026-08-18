// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from "react";

import {
    renderWithContext,
    screen,
    userEvent,
} from "tests/react_testing_utils";

import ChannelEmojiPicker from "./channel_emoji_picker";

jest.mock("components/emoji_picker/use_emoji_picker", () => ({
    __esModule: true,
    default: ({
        onEmojiClick,
    }: {
        onEmojiClick: (emoji: { name: string }) => void;
    }) => ({
        emojiPicker: (
            <button onClick={() => onEmojiClick({ name: "tada" })}>
                {"Choose tada"}
            </button>
        ),
        getReferenceProps: () => ({}),
        setReference: jest.fn(),
    }),
}));

describe("ChannelEmojiPicker", () => {
    test("selects and removes a channel emoji", async () => {
        const onChange = jest.fn();
        const { rerender } = renderWithContext(
            <ChannelEmojiPicker value="" onChange={onChange} />
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Choose tada" })
        );
        expect(onChange).toHaveBeenCalledWith("tada");

        rerender(<ChannelEmojiPicker value="tada" onChange={onChange} />);
        await userEvent.click(
            screen.getByRole("button", { name: "Remove channel emoji" })
        );
        expect(onChange).toHaveBeenLastCalledWith("");
    });
});
