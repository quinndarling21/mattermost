// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Meta, StoryObj} from '@storybook/react-vite';
import React from 'react';

import {Button} from './button';

const meta = {
    title: 'Shared/Button',
    component: Button,
    args: {
        children: 'Button',
    },
    argTypes: {
        emphasis: {
            control: 'select',
            options: ['primary', 'secondary', 'tertiary', 'quaternary'],
        },
        size: {
            control: 'select',
            options: ['xs', 'sm', 'md', 'lg'],
        },
        variant: {
            control: 'select',
            options: ['', 'destructive', 'inverted'],
        },
        children: {
            control: 'text',
        },
    },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        emphasis: 'primary',
    },
};

export const Secondary: Story = {
    args: {
        emphasis: 'secondary',
    },
};

export const Tertiary: Story = {
    args: {
        emphasis: 'tertiary',
    },
};

export const Quaternary: Story = {
    args: {
        emphasis: 'quaternary',
    },
};

export const Destructive: Story = {
    args: {
        variant: 'destructive',
        children: 'Delete',
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
};

export const Sizes: Story = {
    render: (args) => (
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Button
                {...args}
                size='xs'
            >{'Extra small'}</Button>
            <Button
                {...args}
                size='sm'
            >{'Small'}</Button>
            <Button
                {...args}
                size='md'
            >{'Medium'}</Button>
            <Button
                {...args}
                size='lg'
            >{'Large'}</Button>
        </div>
    ),
};
