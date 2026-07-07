// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {fireEvent, screen} from '@testing-library/react';
import React from 'react';

import type {Tab} from 'components/settings_sidebar/settings_sidebar';

import {renderWithContext} from 'tests/react_testing_utils';

import SettingsSearch from './settings_search';

const productTabs: Tab[] = [
    {name: 'notifications', uiName: 'Notifications', icon: 'icon icon-bell-outline', iconTitle: 'Notifications'},
    {name: 'display', uiName: 'Display', icon: 'icon icon-eye-outline', iconTitle: 'Display'},
    {name: 'sidebar', uiName: 'Sidebar', icon: 'icon icon-dock-left', iconTitle: 'Sidebar'},
    {name: 'advanced', uiName: 'Advanced', icon: 'icon icon-tune', iconTitle: 'Advanced'},
];

const baseProps = {
    searchTerm: '',
    onChange: jest.fn(),
    tabs: productTabs,
    pluginTabs: [] as Tab[],
    onNavigate: jest.fn(),
};

describe('SettingsSearch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the search input', () => {
        renderWithContext(<SettingsSearch {...baseProps}/>);
        expect(screen.getByPlaceholderText('Search settings')).toBeInTheDocument();
    });

    it('does not render results when the query is empty', () => {
        renderWithContext(<SettingsSearch {...baseProps}/>);
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('calls onChange when typing', () => {
        const onChange = jest.fn();
        renderWithContext(<SettingsSearch {...baseProps} onChange={onChange}/>);
        fireEvent.change(screen.getByPlaceholderText('Search settings'), {target: {value: 'theme'}});
        expect(onChange).toHaveBeenCalledWith('theme');
    });

    it('shows a top-level tab match', () => {
        renderWithContext(<SettingsSearch {...baseProps} searchTerm='display'/>);
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getAllByText('Display').length).toBeGreaterThan(0);
    });

    it('shows a section match and navigates to tab + section', () => {
        const onNavigate = jest.fn();
        renderWithContext(<SettingsSearch {...baseProps} searchTerm='theme' onNavigate={onNavigate}/>);

        const result = screen.getByText('Theme');
        fireEvent.click(result);

        expect(onNavigate).toHaveBeenCalledWith('display', 'theme');
    });

    it('matches by keyword when the label does not contain the query', () => {
        renderWithContext(<SettingsSearch {...baseProps} searchTerm='dark mode'/>);
        expect(screen.getByText('Theme')).toBeInTheDocument();
    });

    it('only surfaces sections for the tabs that are available', () => {
        // 'password' belongs to the security/profile tabs which are not present here.
        renderWithContext(<SettingsSearch {...baseProps} searchTerm='password'/>);
        expect(screen.getByText('No settings found')).toBeInTheDocument();
    });

    it('shows the no-results empty state for an unmatched query', () => {
        renderWithContext(<SettingsSearch {...baseProps} searchTerm='zzzznotathing'/>);
        expect(screen.getByText('No settings found')).toBeInTheDocument();
    });

    it('clears the search when the clear button is pressed', () => {
        const onChange = jest.fn();
        renderWithContext(<SettingsSearch {...baseProps} searchTerm='theme' onChange={onChange}/>);
        fireEvent.click(screen.getByLabelText('Clear search'));
        expect(onChange).toHaveBeenCalledWith('');
    });

    it('surfaces plugin tab matches', () => {
        const pluginTabs: Tab[] = [
            {name: 'plugin_a', uiName: 'My Plugin', icon: 'icon icon-power-plug-outline', iconTitle: 'My Plugin'},
        ];
        renderWithContext(<SettingsSearch {...baseProps} pluginTabs={pluginTabs} searchTerm='plugin'/>);
        expect(screen.getByText('My Plugin')).toBeInTheDocument();
    });
});
