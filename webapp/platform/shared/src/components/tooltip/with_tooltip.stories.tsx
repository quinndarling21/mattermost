// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Meta, StoryObj} from '@storybook/react-vite';
import React from 'react';

import {WithTooltip} from './with_tooltip';

import {Button} from '../button';
import {ShortcutKeys} from '../shortcut_key';

const meta = {
    title: 'Shared/WithTooltip',
    component: WithTooltip,
    parameters: {

        // The tooltip only appears on hover/focus, so give it room to render.
        layout: 'centered',
    },
    args: {
        title: 'This is a tooltip',
        children: <Button emphasis='secondary'>{'Hover me'}</Button>,
    },
    argTypes: {
        children: {
            control: false,
        },
    },
} satisfies Meta<typeof WithTooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithHint: Story = {
    args: {
        title: 'Add a reaction',
        hint: 'Select an emoji from the picker',
    },
};

export const WithShortcut: Story = {
    args: {
        title: 'Send message',
        shortcut: {
            default: [ShortcutKeys.ctrl, ShortcutKeys.enter],
            mac: [ShortcutKeys.cmd, ShortcutKeys.enter],
        },
    },
};

export const Horizontal: Story = {
    args: {
        title: 'Shown beside the trigger',
        isVertical: false,
    },
};

export const Disabled: Story = {
    args: {
        title: 'You should never see this',
        disabled: true,
        children: <Button emphasis='secondary'>{'Tooltip disabled'}</Button>,
    },
};
