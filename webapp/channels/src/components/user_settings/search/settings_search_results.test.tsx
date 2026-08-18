// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {renderWithContext} from 'tests/react_testing_utils';

import SettingsSearchResults from './settings_search_results';

const ALL_TABS = ['notifications', 'display', 'sidebar', 'advanced', 'profile', 'security'];

function renderResults(query: string, onSelect = jest.fn()) {
    renderWithContext(
        <SettingsSearchResults
            query={query}
            availableTabs={ALL_TABS}
            onSelect={onSelect}
        />,
    );
    return onSelect;
}

describe('SettingsSearchResults', () => {
    test('renders nothing for a blank query', () => {
        const {container} = renderWithContext(
            <SettingsSearchResults
                query='   '
                availableTabs={ALL_TABS}
                onSelect={jest.fn()}
            />,
        );
        expect(container).toBeEmptyDOMElement();
    });

    test('renders matching results with their category', () => {
        renderResults('theme');
        expect(screen.getByText('Theme')).toBeInTheDocument();
        expect(screen.getByText('Display')).toBeInTheDocument();
    });

    test('renders an empty state when nothing matches', () => {
        renderResults('zzzznotarealsetting');
        expect(screen.getByText(/No settings found/)).toBeInTheDocument();
    });

    test('invokes onSelect with the tab and section when a result is clicked', async () => {
        const onSelect = renderResults('dark mode');
        await userEvent.click(screen.getByTestId('settingsSearchResult_display_theme'));
        expect(onSelect).toHaveBeenCalledWith('display', 'theme');
    });

    test('shows a result count', () => {
        renderResults('notifications');
        expect(screen.getByText(/result/)).toBeInTheDocument();
    });
});
