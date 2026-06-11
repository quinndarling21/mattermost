// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ComponentProps} from 'react';
import React from 'react';

import {renderWithContext} from 'tests/react_testing_utils';

import SettingsSearch from './settings_search';

type Props = ComponentProps<typeof SettingsSearch>;

function getBaseProps(): Props {
    return {
        query: '',
        onChange: jest.fn(),
        onSelect: jest.fn(),
        pluginSettings: {},
    };
}

describe('SettingsSearch', () => {
    test('renders the search input and no results when the query is empty', () => {
        renderWithContext(<SettingsSearch {...getBaseProps()}/>);

        expect(screen.getByPlaceholderText('Search settings')).toBeInTheDocument();
        expect(screen.queryByTestId('settingsSearchResults')).not.toBeInTheDocument();
    });

    test('calls onChange as the user types', async () => {
        const props = getBaseProps();
        renderWithContext(<SettingsSearch {...props}/>);

        await userEvent.type(screen.getByPlaceholderText('Search settings'), 'lang');

        expect(props.onChange).toHaveBeenCalled();
    });

    test('shows matching results for a query', () => {
        const props = {...getBaseProps(), query: 'language'};
        renderWithContext(<SettingsSearch {...props}/>);

        expect(screen.getByTestId('settingsSearchResults')).toBeInTheDocument();
        expect(screen.getByTestId('settingsSearchResult_display_languages')).toBeInTheDocument();
        expect(screen.getByText('Language')).toBeInTheDocument();
    });

    test('shows a no-results message when nothing matches', () => {
        const props = {...getBaseProps(), query: 'notawordinsettings'};
        renderWithContext(<SettingsSearch {...props}/>);

        expect(screen.getByTestId('settingsSearchResults')).toBeInTheDocument();
        expect(screen.getByText(/No settings match/)).toBeInTheDocument();
    });

    test('calls onSelect with the tab and section when a result is clicked', async () => {
        const props = {...getBaseProps(), query: 'language'};
        renderWithContext(<SettingsSearch {...props}/>);

        await userEvent.click(screen.getByTestId('settingsSearchResult_display_languages'));

        expect(props.onSelect).toHaveBeenCalledWith('display', 'languages');
    });

    test('clears the query when the clear button is pressed', async () => {
        const props = {...getBaseProps(), query: 'language'};
        renderWithContext(<SettingsSearch {...props}/>);

        await userEvent.click(screen.getByTestId('input-clear'));

        expect(props.onChange).toHaveBeenCalledWith('');
    });

    test('includes plugin sections in the results', () => {
        const props: Props = {
            ...getBaseProps(),
            query: 'gadget',
            pluginSettings: {
                myplugin: {
                    id: 'myplugin',
                    uiName: 'My Plugin',
                    sections: [
                        {
                            title: 'Gadget Section',
                            settings: [],
                        },
                    ],
                },
            },
        };
        renderWithContext(<SettingsSearch {...props}/>);

        expect(screen.getByTestId('settingsSearchResult_myplugin_Gadget Section')).toBeInTheDocument();
    });
});
