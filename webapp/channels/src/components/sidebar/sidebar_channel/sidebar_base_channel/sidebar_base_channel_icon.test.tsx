// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from "react";

import type { ChannelType } from "@mattermost/types/channels";

import { renderWithContext, screen } from "tests/react_testing_utils";

import SidebarBaseChannelIcon from "./sidebar_base_channel_icon";

describe("SidebarBaseChannelIcon", () => {
    test("renders the channel emoji instead of the channel type icon", () => {
        renderWithContext(
            <SidebarBaseChannelIcon
                channelType={"O" as ChannelType}
                emoji="tada"
            />
        );

        expect(screen.getByLabelText(":tada:")).toBeInTheDocument();
        expect(document.querySelector(".icon-globe")).not.toBeInTheDocument();
    });

    test("renders the channel type icon when no emoji is assigned", () => {
        const { container } = renderWithContext(
            <SidebarBaseChannelIcon channelType={"P" as ChannelType} />
        );

        expect(
            container.querySelector(".icon-lock-outline")
        ).toBeInTheDocument();
    });
});
