// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {fireEvent, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ComponentProps} from 'react';
import React from 'react';

jest.mock('@mattermost/shared/context', () => ({
    SharedProvider: ({children}: {children: React.ReactNode}) => children,
}));

import type {DeepPartial} from '@mattermost/types/utilities';

import mergeObjects from 'packages/mattermost-redux/test/merge_objects';
import {renderWithContext} from 'tests/react_testing_utils';
import {TestHelper} from 'utils/test_helper';

import type {GlobalState} from 'types/store';

import UserSettingsModal from './index';

type Props = ComponentProps<typeof UserSettingsModal>;

const baseProps: Props = {
    isContentProductSettings: true,
    onExited: jest.fn(),
};

const baseState: DeepPartial<GlobalState> = {
    entities: {
        users: {
            currentUserId: 'id',
            profiles: {
                id: TestHelper.getUserMock({id: 'id', locale: 'en'}),
            },
        },
    },
};

jest.mock('@mattermost/client', () => ({
    ...jest.requireActual('@mattermost/client'),
    Client4: class MockClient4 extends jest.requireActual('@mattermost/client').Client4 {
        getUserCustomProfileAttributesValues = jest.fn();
    },
}));

jest.mock('components/user_settings/display/user_settings_theme', () => ({
    __esModule: true,
    default: () => <div>{'Theme Setting'}</div>,
}));

describe('do first render to avoid other testing issues', () => {
    // For some reason, the first time we render, the modal does not
    // completly renders. This makes it so further tests go properly
    // through.
    renderWithContext(<UserSettingsModal {...baseProps}/>, baseState);
});

describe('plugin tabs are only rendered on content product settings', () => {
    it('plugin tabs are properly rendered', async () => {
        const uiName1 = 'plugin_a';
        const uiName2 = 'plugin_b';
        const state: DeepPartial<GlobalState> = {
            plugins: {
                userSettings: {
                    plugin_a: {
                        id: 'plugin_a',
                        sections: [],
                        uiName: uiName1,
                    },
                    plugin_b: {
                        id: 'plugin_b',
                        sections: [],
                        uiName: uiName2,
                    },
                },
            },
        };

        renderWithContext(
            <UserSettingsModal
                {...baseProps}
                isContentProductSettings={false}
            />,
            mergeObjects(baseState, state),
        );

        expect(screen.queryByText(uiName1)).not.toBeInTheDocument();
        expect(screen.queryByText(uiName2)).not.toBeInTheDocument();
    });
});

describe('tabs are properly rendered', () => {
    it('plugin tabs are properly rendered', async () => {
        const uiName1 = 'plugin_a';
        const uiName2 = 'plugin_b';
        const state: DeepPartial<GlobalState> = {
            plugins: {
                userSettings: {
                    plugin_a: {
                        id: 'plugin_a',
                        sections: [],
                        uiName: uiName1,
                    },
                    plugin_b: {
                        id: 'plugin_b',
                        sections: [],
                        uiName: uiName2,
                    },
                },
            },
        };

        renderWithContext(<UserSettingsModal {...baseProps}/>, mergeObjects(baseState, state));

        expect(screen.queryByText(uiName1)).toBeInTheDocument();
        expect(screen.queryByText(uiName2)).toBeInTheDocument();
    });

    it('plugin settings tabs can be selected', async () => {
        const uiName1 = 'plugin A';
        const uiName2 = 'plugin B';
        const state: DeepPartial<GlobalState> = {
            plugins: {
                userSettings: {
                    plugin_a: {
                        id: 'plugin_a',
                        sections: [
                            {
                                title: 'plugin A section',
                                settings: [
                                    {
                                        name: 'plugin A setting',
                                    },
                                ],
                            },
                        ],
                        uiName: uiName1,
                    },
                    plugin_b: {
                        id: 'plugin_b',
                        sections: [
                            {
                                title: 'plugin B section',
                                settings: [
                                    {
                                        name: 'plugin B setting',
                                    },
                                ],
                            },
                        ],
                        uiName: uiName2,
                    },
                },
            },
        };

        renderWithContext(
            <UserSettingsModal
                {...baseProps}
                activeTab='plugin_b'
            />,
            mergeObjects(baseState, state),
        );

        expect(screen.queryByText(uiName1)).toBeInTheDocument();
        expect(screen.queryByText(uiName2)).toBeInTheDocument();
        expect(screen.queryAllByText('plugin B Settings')).toHaveLength(2);
        expect(screen.queryByText('plugin A Settings')).not.toBeInTheDocument();
    });
});

describe('plugin tabs use the correct icon', () => {
    it('use power plug when no icon', () => {
        const uiName = 'plugin_a';
        const state: DeepPartial<GlobalState> = {
            plugins: {
                userSettings: {
                    plugin_a: {
                        id: 'plugin_a',
                        sections: [],
                        uiName,
                    },
                },
            },
        };

        renderWithContext(<UserSettingsModal {...baseProps}/>, mergeObjects(baseState, state));

        const element = screen.queryByTitle(uiName);
        expect(element).toBeInTheDocument();
        expect(element!.nodeName).toBe('I');
        expect(element?.className).toBe('icon icon-power-plug-outline');
    });

    it('use image when icon URL provided', () => {
        const uiName = 'plugin_a';
        const icon = 'http://localhost:8065/plugins/com.mattermost.plugin_a/public/icon.svg';
        const state: DeepPartial<GlobalState> = {
            plugins: {
                userSettings: {
                    plugin_a: {
                        id: 'plugin_a',
                        sections: [],
                        uiName,
                        icon,
                    },
                },
            },
        };
        renderWithContext(<UserSettingsModal {...baseProps}/>, mergeObjects(baseState, state));

        const element = screen.queryByAltText(uiName);
        expect(element).toBeInTheDocument();
        expect(element!.nodeName).toBe('IMG');
        expect(element!.getAttribute('src')).toBe(icon);
    });

    it('use image when icon path provided', () => {
        const uiName = 'plugin_a';
        const icon = '/plugins/com.mattermost.plugin_a/public/icon.svg';
        const state: DeepPartial<GlobalState> = {
            plugins: {
                userSettings: {
                    plugin_a: {
                        id: 'plugin_a',
                        sections: [],
                        uiName,
                        icon,
                    },
                },
            },
        };
        renderWithContext(<UserSettingsModal {...baseProps}/>, mergeObjects(baseState, state));

        const element = screen.queryByAltText(uiName);
        expect(element).toBeInTheDocument();
        expect(element!.nodeName).toBe('IMG');
        expect(element!.getAttribute('src')).toBe(icon);
    });

    it('use class name when icon name provided', () => {
        const uiName = 'plugin_a';
        const icon = 'icon-phone-in-talk';
        const state: DeepPartial<GlobalState> = {
            plugins: {
                userSettings: {
                    plugin_a: {
                        id: 'plugin_a',
                        sections: [],
                        uiName,
                        icon,
                    },
                },
            },
        };

        renderWithContext(<UserSettingsModal {...baseProps}/>, mergeObjects(baseState, state));

        const element = screen.queryByTitle(uiName);
        expect(element).toBeInTheDocument();
        expect(element!.nodeName).toBe('I');
        expect(element?.className).toBe('icon icon-phone-in-talk');
    });
});

const themeEnabledState: DeepPartial<GlobalState> = mergeObjects(baseState, {
    entities: {
        general: {
            config: {
                EnableThemeSelection: 'true',
            },
        },
    },
});

describe('settings search', () => {
    it('shows Find settings and routes dark mode to Display theme', async () => {
        renderWithContext(<UserSettingsModal {...baseProps}/>, themeEnabledState);

        const search = await screen.findByPlaceholderText('Find settings');
        fireEvent.change(search, {target: {value: 'dark mode'}});

        expect(await screen.findByRole('option', {name: 'Theme'})).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('heading', {name: 'Display'})).toBeInTheDocument();
        expect(screen.getByRole('heading', {name: 'Display Settings'})).toBeInTheDocument();
        expect(search).toHaveFocus();
    });

    it('does not index Theme when theme selection is disabled', async () => {
        renderWithContext(<UserSettingsModal {...baseProps}/>, baseState);

        const search = await screen.findByPlaceholderText('Find settings');
        fireEvent.change(search, {target: {value: 'dark mode'}});

        expect(screen.getByText('No settings found')).toBeInTheDocument();
        expect(screen.queryByRole('option', {name: 'Theme'})).not.toBeInTheDocument();
    });

    it('shows no results for an unmatched query without leaving the current tab', async () => {
        renderWithContext(<UserSettingsModal {...baseProps}/>, baseState);

        expect(await screen.findByTestId('notifications-tab-button')).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText('Find settings'), {target: {value: 'xyzzy-not-a-setting'}});

        expect(screen.getByText('No settings found')).toBeInTheDocument();
        expect(screen.getByRole('heading', {name: 'Notifications'})).toBeInTheDocument();
    });

    it('does not include product settings when the Profile modal is open', async () => {
        renderWithContext(
            <UserSettingsModal
                {...baseProps}
                isContentProductSettings={false}
            />,
            baseState,
        );

        const search = await screen.findByPlaceholderText('Find settings');
        await userEvent.type(search, 'dark mode');

        expect(screen.getByText('No settings found')).toBeInTheDocument();
        expect(screen.queryByText('Theme')).not.toBeInTheDocument();
    });
});
