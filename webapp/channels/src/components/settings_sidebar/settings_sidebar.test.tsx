// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {fireEvent, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ComponentProps} from 'react';
import React from 'react';

import type {UserSettingsSearchItem} from 'components/user_settings/search';

import {renderWithContext} from 'tests/react_testing_utils';

import SettingsSidebar from './settings_sidebar';

jest.mock('@mattermost/shared/context', () => ({
    SharedProvider: ({children}: {children: React.ReactNode}) => children,
}));

type Props = ComponentProps<typeof SettingsSidebar>;

const baseProps: Props = {
    isMobileView: false,
    tabs: [],
    updateTab: jest.fn(),
    pluginTabs: [],
};

describe('properly use the correct icon', () => {
    it('icon as a string', () => {
        const iconTitle = 'Icon title';
        const icon = 'icon';
        const props: Props = {
            ...baseProps,
            tabs: [{
                icon,
                iconTitle,
                name: 'tab',
                uiName: 'Tab UI Name',
            }],
        };
        renderWithContext(<SettingsSidebar {...props}/>);

        const element = screen.queryByTitle(iconTitle);
        expect(element).toBeInTheDocument();
        expect(element!.nodeName).toBe('I');
        expect(element!.className).toBe(icon);
    });

    it('icon as an image', () => {
        const iconTitle = 'Icon title';
        const url = 'icon_url';
        const props: Props = {
            ...baseProps,
            pluginTabs: [{
                icon: {url},
                iconTitle,
                name: 'tab',
                uiName: 'Tab UI Name',
            }],
        };
        renderWithContext(<SettingsSidebar {...props}/>);

        const element = screen.queryByAltText(iconTitle);
        expect(element).toBeInTheDocument();
        expect(element!.nodeName).toBe('IMG');
        expect(element!.getAttribute('src')).toBe(url);
    });
});

describe('show PLUGIN PREFERENCES only when plugin tabs are added', () => {
    it('not show when there are no plugin tabs', () => {
        const props: Props = {
            ...baseProps,
            tabs: [{
                icon: 'icon',
                iconTitle: 'title',
                name: 'tab',
                uiName: 'Tab UI Name',
            }],
        };
        renderWithContext(<SettingsSidebar {...props}/>);

        expect(screen.queryByText('PLUGIN PREFERENCES')).not.toBeInTheDocument();
    });

    it('show when there are plugin tabs', () => {
        const props: Props = {
            ...baseProps,
            pluginTabs: [{
                icon: 'icon',
                iconTitle: 'title',
                name: 'tab',
                uiName: 'Tab UI Name',
            }],
        };
        renderWithContext(<SettingsSidebar {...props}/>);

        expect(screen.queryByText('PLUGIN PREFERENCES')).toBeInTheDocument();
    });
});

describe('tabs are properly rendered', () => {
    it('plugin tabs are properly rendered', () => {
        const uiName1 = 'Tab UI Name 1';
        const uiName2 = 'Tab UI Name 2';
        const props: Props = {
            ...baseProps,
            pluginTabs: [
                {
                    icon: 'icon1',
                    iconTitle: 'title1',
                    name: 'tab1',
                    uiName: uiName1,
                },
                {
                    icon: 'icon2',
                    iconTitle: 'title2',
                    name: 'tab2',
                    uiName: uiName2,
                },
            ],
        };

        renderWithContext(<SettingsSidebar {...props}/>);

        expect(screen.queryByText(uiName1)).toBeInTheDocument();
        expect(screen.queryByText(uiName2)).toBeInTheDocument();
    });
});

const searchItems: UserSettingsSearchItem[] = [
    {
        id: 'display:theme:Theme',
        tab: 'display',
        tabLabel: 'Display',
        section: 'theme',
        label: 'Theme',
        aliases: ['dark mode', 'appearance'],
    },
    {
        id: 'display:clock:Clock Display',
        tab: 'display',
        tabLabel: 'Display',
        section: 'clock',
        label: 'Clock Display',
        aliases: ['clock', 'time format'],
    },
    {
        id: 'notifications:desktopAndMobile:Desktop and mobile notifications',
        tab: 'notifications',
        tabLabel: 'Notifications',
        section: 'desktopAndMobile',
        label: 'Desktop and mobile notifications',
        aliases: ['desktop', 'mobile'],
    },
    {
        id: 'demo:Demo Section:Demo Setting',
        tab: 'demo',
        tabLabel: 'Demo Plugin',
        section: 'Demo Section',
        label: 'Demo Setting',
        aliases: ['plugin'],
        isPlugin: true,
    },
];

describe('settings search', () => {
    it('shows Find settings input when search items are provided', () => {
        renderWithContext(
            <SettingsSidebar
                {...baseProps}
                tabs={[{
                    icon: 'icon',
                    iconTitle: 'title',
                    name: 'display',
                    uiName: 'Display',
                }]}
                searchItems={searchItems}
            />,
        );

        expect(screen.getByPlaceholderText('Find settings')).toBeInTheDocument();
        expect(screen.getByLabelText('Find settings')).toBeInTheDocument();
    });

    it('does not show search input when search items are omitted', () => {
        renderWithContext(
            <SettingsSidebar
                {...baseProps}
                tabs={[{
                    icon: 'icon',
                    iconTitle: 'title',
                    name: 'display',
                    uiName: 'Display',
                }]}
            />,
        );

        expect(screen.queryByPlaceholderText('Find settings')).not.toBeInTheDocument();
    });

    it('replaces tabs with grouped results and auto-routes while searching', async () => {
        const navigateToSetting = jest.fn();
        renderWithContext(
            <SettingsSidebar
                {...baseProps}
                tabs={[{
                    icon: 'icon',
                    iconTitle: 'title',
                    name: 'display',
                    uiName: 'Display',
                }]}
                searchItems={searchItems}
                navigateToSetting={navigateToSetting}
            />,
        );

        await userEvent.type(screen.getByPlaceholderText('Find settings'), 'dark mode');

        expect(screen.getByText('Theme')).toBeInTheDocument();
        expect(screen.getByText('Display')).toBeInTheDocument();
        expect(screen.queryByTestId('display-tab-button')).not.toBeInTheDocument();
        expect(navigateToSetting).toHaveBeenCalledWith('display', 'theme');
        expect(screen.getByPlaceholderText('Find settings')).toHaveFocus();
    });

    it('shows plugin results under PLUGIN PREFERENCES', async () => {
        renderWithContext(
            <SettingsSidebar
                {...baseProps}
                searchItems={searchItems}
            />,
        );

        await userEvent.type(screen.getByPlaceholderText('Find settings'), 'Demo Setting');

        expect(screen.getByText('PLUGIN PREFERENCES')).toBeInTheDocument();
        expect(screen.getByText('Demo Setting')).toBeInTheDocument();
    });

    it('shows empty state when nothing matches', async () => {
        renderWithContext(
            <SettingsSidebar
                {...baseProps}
                searchItems={searchItems}
            />,
        );

        await userEvent.type(screen.getByPlaceholderText('Find settings'), 'zzzz-not-a-setting');

        expect(screen.getByText('No settings found')).toBeInTheDocument();
    });

    it('clears search and restores tabs', async () => {
        renderWithContext(
            <SettingsSidebar
                {...baseProps}
                tabs={[{
                    icon: 'icon',
                    iconTitle: 'title',
                    name: 'display',
                    uiName: 'Display',
                }]}
                searchItems={searchItems}
            />,
        );

        const input = screen.getByPlaceholderText('Find settings');
        await userEvent.type(input, 'theme');
        expect(screen.queryByTestId('display-tab-button')).not.toBeInTheDocument();

        await userEvent.clear(input);
        expect(screen.getByTestId('display-tab-button')).toBeInTheDocument();
    });

    it('clears search from the clear control without changing the current setting', async () => {
        const navigateToSetting = jest.fn();
        renderWithContext(
            <SettingsSidebar
                {...baseProps}
                tabs={[{
                    icon: 'icon',
                    iconTitle: 'title',
                    name: 'display',
                    uiName: 'Display',
                }]}
                searchItems={searchItems}
                activeTab='display'
                activeSection='theme'
                navigateToSetting={navigateToSetting}
            />,
        );

        await userEvent.type(screen.getByPlaceholderText('Find settings'), 'theme');
        expect(screen.queryByTestId('display-tab-button')).not.toBeInTheDocument();
        navigateToSetting.mockClear();

        await userEvent.click(screen.getByRole('button', {name: 'Clear'}));

        expect(screen.getByTestId('display-tab-button')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Find settings')).toHaveValue('');
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Find settings')).toHaveFocus();
        });
        expect(navigateToSetting).not.toHaveBeenCalled();
    });

    it('keeps the current match selected while it still matches', async () => {
        const navigateToSetting = jest.fn();
        renderWithContext(
            <SettingsSidebar
                {...baseProps}
                searchItems={searchItems}
                activeTab='display'
                activeSection='theme'
                navigateToSetting={navigateToSetting}
            />,
        );

        fireEvent.change(screen.getByPlaceholderText('Find settings'), {target: {value: 'theme'}});

        expect(navigateToSetting).not.toHaveBeenCalled();
        expect(screen.getByRole('option', {name: 'Theme'})).toHaveAttribute('aria-selected', 'true');
    });

    it('routes to the first match when the current selection no longer matches', async () => {
        const navigateToSetting = jest.fn();
        renderWithContext(
            <SettingsSidebar
                {...baseProps}
                searchItems={searchItems}
                activeTab='display'
                activeSection='theme'
                navigateToSetting={navigateToSetting}
            />,
        );

        fireEvent.change(screen.getByPlaceholderText('Find settings'), {target: {value: 'clock'}});

        expect(navigateToSetting).toHaveBeenCalledWith('display', 'clock');
    });

    it('highlights matching text in result labels', async () => {
        renderWithContext(
            <SettingsSidebar
                {...baseProps}
                searchItems={searchItems}
            />,
        );

        fireEvent.change(screen.getByPlaceholderText('Find settings'), {target: {value: 'heme'}});

        expect(screen.getByText('heme')).toHaveClass('SettingsSidebar__searchHighlight');
    });

    it('moves keyboard focus through results with arrow keys', async () => {
        const navigateToSetting = jest.fn();
        renderWithContext(
            <SettingsSidebar
                {...baseProps}
                searchItems={searchItems}
                navigateToSetting={navigateToSetting}
            />,
        );

        const input = screen.getByPlaceholderText('Find settings');
        await userEvent.type(input, 'desktop');
        await userEvent.keyboard('{ArrowDown}');

        expect(screen.getByRole('option', {name: /Desktop and mobile notifications/i})).toHaveFocus();
    });

    it('moves focus into the setting when a result is clicked', async () => {
        const edit = document.createElement('button');
        edit.id = 'themeEdit';
        edit.scrollIntoView = jest.fn();
        document.body.appendChild(edit);

        const navigateToSetting = jest.fn();
        renderWithContext(
            <SettingsSidebar
                {...baseProps}
                searchItems={searchItems}
                navigateToSetting={navigateToSetting}
            />,
        );

        await userEvent.type(screen.getByPlaceholderText('Find settings'), 'theme');
        await userEvent.click(screen.getByRole('option', {name: 'Theme'}));

        expect(navigateToSetting).toHaveBeenCalledWith('display', 'theme');
        await waitFor(() => {
            expect(edit).toHaveFocus();
        });

        edit.remove();
    });

    it('moves focus into the setting when Enter confirms the first result', async () => {
        const edit = document.createElement('button');
        edit.id = 'themeEdit';
        edit.scrollIntoView = jest.fn();
        document.body.appendChild(edit);

        renderWithContext(
            <SettingsSidebar
                {...baseProps}
                searchItems={searchItems}
                navigateToSetting={jest.fn()}
            />,
        );

        const input = screen.getByPlaceholderText('Find settings');
        await userEvent.type(input, 'theme');
        await userEvent.keyboard('{Enter}');

        await waitFor(() => {
            expect(edit).toHaveFocus();
        });

        edit.remove();
    });
});
