// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Preview} from '@storybook/react-vite';
import React from 'react';
import {IntlProvider} from 'react-intl';

import './preview.scss';

const preview: Preview = {
    decorators: [
        (Story) => (
            <IntlProvider
                locale='en'

                // Shared components always define defaultMessage, so missing
                // translations are expected and safe to ignore here.
                onError={() => {}}
            >
                <Story/>
            </IntlProvider>
        ),
    ],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
    tags: ['autodocs'],
};

export default preview;
