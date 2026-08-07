// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Meta, StoryObj} from '@storybook/react-vite';
import React from 'react';

import {ShortcutKey, ShortcutKeyVariant} from './shortcut_key';

const meta = {
    title: 'Shared/ShortcutKey',
    component: ShortcutKey,
    args: {
        children: 'Ctrl',
    },
    argTypes: {
        variant: {
            control: 'select',
            options: Object.values(ShortcutKeyVariant),
        },
        children: {
            control: 'text',
        },
    },
} satisfies Meta<typeof ShortcutKey>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Contrast: Story = {
    args: {
        variant: ShortcutKeyVariant.Contrast,
    },
};

export const Tooltip: Story = {
    args: {
        variant: ShortcutKeyVariant.Tooltip,
    },
    parameters: {

        // The tooltip variant is styled for a dark tooltip background.
        backgrounds: {default: 'dark'},
    },
};

export const ShortcutModal: Story = {
    args: {
        variant: ShortcutKeyVariant.ShortcutModal,
    },
};

export const InlineContent: Story = {
    args: {
        variant: ShortcutKeyVariant.InlineContent,
    },
};

export const KeyCombination: Story = {
    render: () => (
        <div style={{display: 'flex', gap: '4px'}}>
            <ShortcutKey variant={ShortcutKeyVariant.ShortcutModal}>{'⌘'}</ShortcutKey>
            <ShortcutKey variant={ShortcutKeyVariant.ShortcutModal}>{'Shift'}</ShortcutKey>
            <ShortcutKey variant={ShortcutKeyVariant.ShortcutModal}>{'K'}</ShortcutKey>
        </div>
    ),
};
