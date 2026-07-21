// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {MagnifyIcon, ClockOutlineIcon} from '@mattermost/compass-icons/components';
import {Button} from '@mattermost/shared/components/button';
import React, {useCallback, useMemo, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {showSearchResults, updateSearchTerms} from 'actions/views/rhs';

import FilterChip from './filter_chip';

import './search_recovery.scss';

type NarrowChip = {
    id: string;
    labelMessage: {
        id: string;
        defaultMessage: string;
    };
    filterTerm: string;
};

const MOCK_RECENT_SEARCHES = [
    'rollback runbook',
    'deploy failed pipeline',
    'incident checklist',
];

const MOCK_NARROW_CHIPS: NarrowChip[] = [
    {
        id: 'from',
        labelMessage: {
            id: 'search_recovery.chip_from',
            defaultMessage: 'From: @quinn',
        },
        filterTerm: 'from:@quinn',
    },
    {
        id: 'in',
        labelMessage: {
            id: 'search_recovery.chip_in',
            defaultMessage: 'In: #incident-response',
        },
        filterTerm: 'in:incident-response',
    },
    {
        id: 'after',
        labelMessage: {
            id: 'search_recovery.chip_after',
            defaultMessage: 'After: last week',
        },
        filterTerm: 'after:2026-07-14',
    },
];

export function getMockSuggestion(query: string): string | null {
    const normalized = query.trim().replace(/\s+/g, ' ');
    if (!normalized) {
        return null;
    }

    const lower = normalized.toLowerCase();
    if (lower === 'deploy rollback') {
        return 'deployment rollback';
    }
    if (lower.includes('deploy') && !lower.includes('deployment')) {
        return normalized.replace(/deploy/gi, 'deployment');
    }

    return null;
}

type Props = {
    searchTerms: string;
};

export default function SearchRecovery({searchTerms}: Props) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const [selectedChipIds, setSelectedChipIds] = useState<string[]>([]);

    const suggestion = useMemo(() => getMockSuggestion(searchTerms), [searchTerms]);

    const runSearch = useCallback((terms: string) => {
        dispatch(updateSearchTerms(terms));
        dispatch(showSearchResults(false));
    }, [dispatch]);

    const handleSuggestionClick = useCallback(() => {
        if (suggestion) {
            runSearch(suggestion);
        }
    }, [runSearch, suggestion]);

    const handleChipClick = useCallback((chip: NarrowChip) => {
        setSelectedChipIds((prev) => {
            const isSelected = prev.includes(chip.id);
            const nextSelected = isSelected ? prev.filter((id) => id !== chip.id) : [...prev, chip.id];

            const baseTerms = searchTerms.
                split(/\s+/).
                filter((term) => term && !MOCK_NARROW_CHIPS.some((mockChip) => mockChip.filterTerm.toLowerCase() === term.toLowerCase())).
                join(' ').
                trim();

            const activeFilters = MOCK_NARROW_CHIPS.
                filter((mockChip) => nextSelected.includes(mockChip.id)).
                map((mockChip) => mockChip.filterTerm);

            const nextTerms = [baseTerms, ...activeFilters].filter(Boolean).join(' ').trim();
            runSearch(nextTerms || chip.filterTerm);

            return nextSelected;
        });
    }, [runSearch, searchTerms]);

    const handleRecentClick = useCallback((query: string) => {
        setSelectedChipIds([]);
        runSearch(query);
    }, [runSearch]);

    return (
        <div
            className='SearchRecovery'
            aria-live='polite'
        >
            <div className='SearchRecovery__empty'>
                <MagnifyIcon
                    size={48}
                    className='SearchRecovery__icon'
                    aria-hidden={true}
                />
                <h3 className='SearchRecovery__title'>
                    <FormattedMessage
                        id='search_recovery.no_results_title'
                        defaultMessage='No results for “{searchTerms}”'
                        values={{searchTerms}}
                    />
                </h3>
                <p className='SearchRecovery__guidance'>
                    <FormattedMessage
                        id='search_recovery.guidance'
                        defaultMessage='Check the spelling or try a broader term. You can also narrow the search below.'
                    />
                </p>
                {suggestion && (
                    <Button
                        type='button'
                        emphasis='tertiary'
                        size='sm'
                        className='SearchRecovery__suggestion'
                        onClick={handleSuggestionClick}
                    >
                        <FormattedMessage
                            id='search_recovery.did_you_mean'
                            defaultMessage='Did you mean “{suggestion}”?'
                            values={{suggestion}}
                        />
                    </Button>
                )}
            </div>

            <section
                className='SearchRecovery__section'
                aria-labelledby='search-recovery-narrow-heading'
            >
                <h4
                    id='search-recovery-narrow-heading'
                    className='SearchRecovery__sectionHeading'
                >
                    <FormattedMessage
                        id='search_recovery.narrow_heading'
                        defaultMessage='Narrow your search'
                    />
                </h4>
                <div className='SearchRecovery__chips'>
                    {MOCK_NARROW_CHIPS.map((chip) => (
                        <FilterChip
                            key={chip.id}
                            label={formatMessage(chip.labelMessage)}
                            selected={selectedChipIds.includes(chip.id)}
                            onClick={() => handleChipClick(chip)}
                        />
                    ))}
                </div>
            </section>

            <section
                className='SearchRecovery__section SearchRecovery__section--recents'
                aria-labelledby='search-recovery-recents-heading'
            >
                <h4
                    id='search-recovery-recents-heading'
                    className='SearchRecovery__sectionHeading'
                >
                    <FormattedMessage
                        id='search_recovery.recents_heading'
                        defaultMessage='Recent searches'
                    />
                </h4>
                <ul className='SearchRecovery__recents'>
                    {MOCK_RECENT_SEARCHES.map((query) => (
                        <li key={query}>
                            <button
                                type='button'
                                className='SearchRecovery__recentRow'
                                onClick={() => handleRecentClick(query)}
                                aria-label={formatMessage(
                                    {
                                        id: 'search_recovery.recent_aria',
                                        defaultMessage: 'Search again for {query}',
                                    },
                                    {query},
                                )}
                            >
                                <ClockOutlineIcon
                                    size={16}
                                    className='SearchRecovery__recentIcon'
                                    aria-hidden={true}
                                />
                                <span className='SearchRecovery__recentText'>{query}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
