// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {fireEvent, screen} from '@testing-library/react';
import type {ComponentProps} from 'react';
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

type Props = ComponentProps<typeof SettingsSearch>;

const baseProps: Props = {
    searchTerm: '',
    onChange: jest.fn(),
    tabs: productTabs,
    pluginTabs: [],
    onNavigate: jest.fn(),
};

function renderSearch(overrides: Partial<Props> = {}) {
    const props = {...baseProps, ...overrides};
    return renderWithContext(<SettingsSearch {...props}/>);
}

describe('SettingsSearch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the search input', () => {
        renderSearch();
        expect(screen.getByPlaceholderText('Search settings')).toBeInTheDocument();
    });

    it('does not render results when the query is empty', () => {
        renderSearch();
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('calls onChange when typing', () => {
        const onChange = jest.fn();
        renderSearch({onChange});
        fireEvent.change(screen.getByPlaceholderText('Search settings'), {target: {value: 'theme'}});
        expect(onChange).toHaveBeenCalledWith('theme');
    });

    it('shows a top-level tab match', () => {
        renderSearch({searchTerm: 'display'});
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getAllByText('Display').length).toBeGreaterThan(0);
    });

    it('shows a section match and navigates to tab + section', () => {
        const onNavigate = jest.fn();
        renderSearch({searchTerm: 'theme', onNavigate});

        fireEvent.click(screen.getByText('Theme'));

        expect(onNavigate).toHaveBeenCalledWith('display', 'theme');
    });

    it('matches by keyword when the label does not contain the query', () => {
        renderSearch({searchTerm: 'dark mode'});
        expect(screen.getByText('Theme')).toBeInTheDocument();
    });

    it('only surfaces sections for the tabs that are available', () => {
        // 'password' belongs to the security/profile tabs which are not present here.
        renderSearch({searchTerm: 'password'});
        expect(screen.getByText('No settings found')).toBeInTheDocument();
    });

    it('shows the no-results empty state for an unmatched query', () => {
        renderSearch({searchTerm: 'zzzznotathing'});
        expect(screen.getByText('No settings found')).toBeInTheDocument();
    });

    it('clears the search when the clear button is pressed', () => {
        const onChange = jest.fn();
        renderSearch({searchTerm: 'theme', onChange});
        fireEvent.click(screen.getByLabelText('Clear search'));
        expect(onChange).toHaveBeenCalledWith('');
    });

    it('surfaces plugin tab matches', () => {
        const pluginTabs: Tab[] = [
            {name: 'plugin_a', uiName: 'My Plugin', icon: 'icon icon-power-plug-outline', iconTitle: 'My Plugin'},
        ];
        renderSearch({pluginTabs, searchTerm: 'plugin'});
        expect(screen.getAllByText('My Plugin').length).toBeGreaterThan(0);
        expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
});
