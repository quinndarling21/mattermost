// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ClockOutlineIcon, MagnifyIcon} from '@mattermost/compass-icons/components';
import {Button} from '@mattermost/shared/components/button';
import React from 'react';
import {defineMessages, FormattedMessage, useIntl} from 'react-intl';

import FilterChip from './filter_chip';

import './search_recovery.scss';

type Props = {
    searchTerms: string;
    updateSearchTerms: (terms: string) => void;
};

const messages = defineMessages({
    fromQuinn: {id: 'search_recovery.filter.from_quinn', defaultMessage: 'From: @quinn'},
    inIncidentResponse: {id: 'search_recovery.filter.in_incident_response', defaultMessage: 'In: #incident-response'},
    afterLastWeek: {id: 'search_recovery.filter.after_last_week', defaultMessage: 'After: last week'},
    rollbackRunbook: {id: 'search_recovery.recent.rollback_runbook', defaultMessage: 'rollback runbook'},
    deployFailedPipeline: {id: 'search_recovery.recent.deploy_failed_pipeline', defaultMessage: 'deploy failed pipeline'},
    incidentChecklist: {id: 'search_recovery.recent.incident_checklist', defaultMessage: 'incident checklist'},
});

function withFilter(searchTerms: string, filter: string): string {
    const termsWithoutFilter = searchTerms.replace(filter, '').replace(/\s+/g, ' ').trim();
    return searchTerms.includes(filter) ? termsWithoutFilter : `${termsWithoutFilter} ${filter}`.trim();
}

export default function SearchRecovery({searchTerms, updateSearchTerms}: Props) {
    const intl = useIntl();
    const suggestion = searchTerms.replace(/\bdeploy\b/i, 'deployment');
    const hasSuggestion = suggestion !== searchTerms;
    const filters = [
        {label: intl.formatMessage(messages.fromQuinn), term: 'from:quinn'},
        {label: intl.formatMessage(messages.inIncidentResponse), term: 'in:incident-response'},
        {label: intl.formatMessage(messages.afterLastWeek), term: 'after:2026-07-13'},
    ];
    const recentSearches = [
        intl.formatMessage(messages.rollbackRunbook),
        intl.formatMessage(messages.deployFailedPipeline),
        intl.formatMessage(messages.incidentChecklist),
    ];

    return (
        <div
            className='SearchRecovery'
            aria-live='polite'
        >
            <div className='SearchRecovery__emptyState'>
                <MagnifyIcon
                    className='SearchRecovery__magnify'
                    size={48}
                />
                <h3 className='SearchRecovery__title'>
                    <FormattedMessage
                        id='search_recovery.no_results'
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
                {hasSuggestion && (
                    <Button
                        type='button'
                        className='SearchRecovery__suggestion'
                        emphasis='tertiary'
                        size='sm'
                        onClick={() => updateSearchTerms(suggestion)}
                    >
                        <FormattedMessage
                            id='search_recovery.suggestion'
                            defaultMessage='Did you mean “{suggestion}”?'
                            values={{suggestion}}
                        />
                    </Button>
                )}
            </div>
            <section className='SearchRecovery__section'>
                <h4 className='SearchRecovery__sectionTitle'>
                    <FormattedMessage
                        id='search_recovery.narrow'
                        defaultMessage='Narrow your search'
                    />
                </h4>
                <div className='SearchRecovery__chips'>
                    {filters.map((filter) => (
                        <FilterChip
                            key={filter.term}
                            label={filter.label}
                            selected={searchTerms.includes(filter.term)}
                            onClick={() => updateSearchTerms(withFilter(searchTerms, filter.term))}
                        />
                    ))}
                </div>
            </section>
            <section className='SearchRecovery__section SearchRecovery__recent'>
                <h4 className='SearchRecovery__sectionTitle'>
                    <FormattedMessage
                        id='search_recovery.recent'
                        defaultMessage='Recent searches'
                    />
                </h4>
                {recentSearches.map((recentSearch) => (
                    <Button
                        type='button'
                        className='SearchRecovery__recentRow'
                        emphasis='quaternary'
                        size='sm'
                        key={recentSearch}
                        onClick={() => updateSearchTerms(recentSearch)}
                    >
                        <ClockOutlineIcon size={16}/>
                        <span>{recentSearch}</span>
                    </Button>
                ))}
            </section>
        </div>
    );
}
