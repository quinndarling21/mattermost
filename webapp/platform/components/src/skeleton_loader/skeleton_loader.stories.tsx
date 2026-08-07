// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Meta, StoryObj} from '@storybook/react-vite';
import React from 'react';

import {CircleSkeletonLoader, RectangleSkeletonLoader} from './index';

const meta = {
    title: 'Components/SkeletonLoader',
    component: CircleSkeletonLoader,
    args: {
        size: 40,
    },
} satisfies Meta<typeof CircleSkeletonLoader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Circle: Story = {};

export const Rectangle: Story = {
    render: () => (
        <RectangleSkeletonLoader
            height={20}
            width={240}
        />
    ),
};

export const PostPlaceholder: Story = {
    render: () => (
        <div style={{display: 'flex', gap: '8px', width: '320px'}}>
            <CircleSkeletonLoader size={32}/>
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                <RectangleSkeletonLoader
                    height={12}
                    width='40%'
                />
                <RectangleSkeletonLoader height={12}/>
                <RectangleSkeletonLoader
                    height={12}
                    width='80%'
                />
            </div>
        </div>
    ),
};
