// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {fileURLToPath} from 'node:url';

import type {StorybookConfig} from '@storybook/react-vite';

// The web app's design tokens (_css_variables.scss) and button styles
// (_buttons.scss) live in the channels package. preview.scss imports them
// through this sass load path so shared components render styled.
const channelsSassDir = fileURLToPath(new URL('../../../channels/src/sass', import.meta.url));

const config: StorybookConfig = {
    framework: '@storybook/react-vite',
    stories: [
        '../src/**/*.stories.@(ts|tsx)',
        '../../components/src/**/*.stories.@(ts|tsx)',
    ],
    addons: [
        '@storybook/addon-docs',
        '@storybook/addon-mcp',
    ],
    core: {
        disableTelemetry: true,
    },
    viteFinal: async (viteConfig) => {
        const {mergeConfig} = await import('vite');

        return mergeConfig(viteConfig, {
            css: {
                preprocessorOptions: {
                    scss: {
                        loadPaths: [channelsSassDir],
                    },
                },
            },
        });
    },
};

export default config;
