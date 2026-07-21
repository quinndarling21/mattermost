// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {showSearchResults, updateSearchTerms} from 'actions/views/rhs';

import {renderWithContext, screen, userEvent} from 'tests/react_testing_utils';

import SearchRecovery, {getMockSuggestion} from './search_recovery';

jest.mock('actions/views/rhs', () => ({
    updateSearchTerms: jest.fn(() => ({type: 'MOCK_UPDATE_SEARCH_TERMS'})),
    showSearchResults: jest.fn(() => ({type: 'MOCK_SHOW_SEARCH_RESULTS'})),
}));

describe('getMockSuggestion', () => {
    test('should suggest deployment rollback for deploy rollback', () => {
        expect(getMockSuggestion('deploy rollback')).toBe('deployment rollback');
    });

    test('should return null when no suggestion is available', () => {
        expect(getMockSuggestion('incident checklist')).toBeNull();
    });
});

describe('components/search_results/SearchRecovery', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render recovery panel for a no-hit query', () => {
        renderWithContext(
            <SearchRecovery searchTerms='deploy rollback'/>,
        );

        expect(screen.getByText('No results for “deploy rollback”')).toBeInTheDocument();
        expect(screen.getByText('Check the spelling or try a broader term. You can also narrow the search below.')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Did you mean “deployment rollback”?'})).toBeInTheDocument();
        expect(screen.getByText('Narrow your search')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'From: @quinn'})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'In: #incident-response'})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'After: last week'})).toBeInTheDocument();
        expect(screen.getByText('Recent searches')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Search again for rollback runbook'})).toBeInTheDocument();
    });

    test('should re-run search when suggestion is clicked', async () => {
        renderWithContext(
            <SearchRecovery searchTerms='deploy rollback'/>,
        );

        await userEvent.click(screen.getByRole('button', {name: 'Did you mean “deployment rollback”?'}));

        expect(jest.mocked(updateSearchTerms)).toHaveBeenCalledWith('deployment rollback');
        expect(jest.mocked(showSearchResults)).toHaveBeenCalledWith(false);
    });

    test('should re-run search when a recent search is activated', async () => {
        renderWithContext(
            <SearchRecovery searchTerms='deploy rollback'/>,
        );

        await userEvent.click(screen.getByRole('button', {name: 'Search again for incident checklist'}));

        expect(jest.mocked(updateSearchTerms)).toHaveBeenCalledWith('incident checklist');
        expect(jest.mocked(showSearchResults)).toHaveBeenCalledWith(false);
    });

    test('should toggle chip selection and append filter terms', async () => {
        renderWithContext(
            <SearchRecovery searchTerms='deploy rollback'/>,
        );

        const chip = screen.getByRole('button', {name: 'In: #incident-response'});
        await userEvent.click(chip);

        expect(chip).toHaveAttribute('aria-pressed', 'true');
        expect(jest.mocked(updateSearchTerms)).toHaveBeenCalledWith('deploy rollback in:incident-response');
        expect(jest.mocked(showSearchResults)).toHaveBeenCalledWith(false);
    });
});
