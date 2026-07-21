// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import {FormattedMessage} from 'react-intl';

import {ClockOutlineIcon, MagnifyIcon} from '@mattermost/compass-icons/components';

import FilterChip from './filter_chip';

import './search_recovery.scss';

type Props = {
    searchTerms: string;
    onRunSearch: (terms: string) => void;
};

type NarrowChip = {
    key: string;
    label: string;
    modifier: string;
};

// Prototype: mocked narrowing filters. A real implementation would derive
// these from the current query, channel and recent authors.
const NARROW_CHIPS: NarrowChip[] = [
    {key: 'from', label: 'From: @quinn', modifier: 'from:quinn'},
    {key: 'in', label: 'In: #incident-response', modifier: 'in:incident-response'},
    {key: 'after', label: 'After: last week', modifier: 'after:7d'},
];

// Prototype: mocked recent searches. A real implementation would read these
// from the user's search history.
const RECENT_SEARCHES = [
    'rollback runbook',
    'deploy failed pipeline',
    'incident checklist',
];

// Prototype: mocked spellcheck/expansion. A real implementation would call a
// suggestion backend. Word-level expansion covers common shorthand so the
// "Did you mean …?" affordance can be demonstrated without a server.
const WORD_EXPANSIONS: Record<string, string> = {
    deploy: 'deployment',
    config: 'configuration',
    prod: 'production',
    k8s: 'kubernetes',
    db: 'database',
    repo: 'repository',
    incidnet: 'incident',
    rollbck: 'rollback',
};

function getSuggestion(terms: string): string | null {
    const words = terms.trim().split(/\s+/);
    let changed = false;
    const suggested = words.map((word) => {
        // Leave query modifiers (e.g. from:, in:) untouched.
        if (word.includes(':')) {
            return word;
        }
        const lower = word.toLowerCase();
        if (WORD_EXPANSIONS[lower]) {
            changed = true;
            return WORD_EXPANSIONS[lower];
        }
        return word;
    });
    return changed ? suggested.join(' ') : null;
}

const SearchRecovery = ({searchTerms, onRunSearch}: Props) => {
    // Which narrow filters are already applied, and the underlying query with
    // those modifiers stripped out. Deriving from the live query keeps the
    // selected chip state consistent even when the search changes elsewhere.
    const selectedKeys = useMemo(
        () => NARROW_CHIPS.filter((chip) => searchTerms.includes(chip.modifier)).map((chip) => chip.key),
        [searchTerms],
    );
    const baseTerms = useMemo(() => {
        let base = searchTerms;
        NARROW_CHIPS.forEach((chip) => {
            base = base.replace(chip.modifier, '');
        });
        return base.replace(/\s+/g, ' ').trim();
    }, [searchTerms]);

    const suggestion = useMemo(() => getSuggestion(baseTerms), [baseTerms]);

    const handleNarrow = (chip: NarrowChip) => {
        const isSelected = selectedKeys.includes(chip.key);
        const nextKeys = isSelected ? selectedKeys.filter((key) => key !== chip.key) : [...selectedKeys, chip.key];

        const modifiers = NARROW_CHIPS.
            filter((c) => nextKeys.includes(c.key)).
            map((c) => c.modifier).
            join(' ');
        onRunSearch(`${baseTerms} ${modifiers}`.trim());
    };

    return (
        <div className='SearchRecovery'>
            <div className='SearchRecovery__hero'>
                <MagnifyIcon
                    size={40}
                    className='SearchRecovery__icon'
                    aria-hidden={true}
                />
                <h3 className='SearchRecovery__title'>
                    <FormattedMessage
                        id='search_recovery.title'
                        defaultMessage='No results for “{query}”'
                        values={{query: baseTerms || searchTerms}}
                    />
                </h3>
                <p className='SearchRecovery__guidance'>
                    <FormattedMessage
                        id='search_recovery.guidance'
                        defaultMessage='Check the spelling or try a broader term. You can also narrow the search below.'
                    />
                </p>
                {suggestion && (
                    <button
                        type='button'
                        className='SearchRecovery__suggestion'
                        onClick={() => onRunSearch(suggestion)}
                    >
                        <FormattedMessage
                            id='search_recovery.did_you_mean'
                            defaultMessage='Did you mean “{suggestion}”?'
                            values={{suggestion}}
                        />
                    </button>
                )}
            </div>

            <div className='SearchRecovery__section'>
                <div className='SearchRecovery__section-label'>
                    <FormattedMessage
                        id='search_recovery.narrow'
                        defaultMessage='Narrow your search'
                    />
                </div>
                <div className='SearchRecovery__chips'>
                    {NARROW_CHIPS.map((chip) => (
                        <FilterChip
                            key={chip.key}
                            label={chip.label}
                            selected={selectedKeys.includes(chip.key)}
                            onClick={() => handleNarrow(chip)}
                        />
                    ))}
                </div>
            </div>

            <div className='SearchRecovery__section'>
                <div className='SearchRecovery__section-label'>
                    <FormattedMessage
                        id='search_recovery.recent'
                        defaultMessage='Recent searches'
                    />
                </div>
                <ul className='SearchRecovery__recents'>
                    {RECENT_SEARCHES.map((term) => (
                        <li key={term}>
                            <button
                                type='button'
                                className='SearchRecovery__recent'
                                onClick={() => onRunSearch(term)}
                            >
                                <ClockOutlineIcon
                                    size={16}
                                    className='SearchRecovery__recent-icon'
                                    aria-hidden={true}
                                />
                                <span className='SearchRecovery__recent-text'>{term}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SearchRecovery;
