// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import QuickInput from 'components/quick_input';

import type {SettingsSearchResult} from './settings_search_index';

type Props = {
    searchTerm: string;
    results: SettingsSearchResult[];
    onSearchTermChange: (searchTerm: string) => void;
    onSelectResult: (result: SettingsSearchResult) => void;
};

export default function SettingsSearch(props: Props) {
    const {formatMessage} = useIntl();
    const hasQuery = props.searchTerm.trim().length > 0;

    return (
        <div className='SettingsSearch'>
            <QuickInput
                id='settingsSearchInput'
                data-testid='settings-search-input'
                className='SettingsSearch__input form-control'
                type='search'
                value={props.searchTerm}
                onChange={(e) => props.onSearchTermChange(e.target.value)}
                placeholder={formatMessage({
                    id: 'user.settings.modal.search.placeholder',
                    defaultMessage: 'Search settings',
                })}
                clearable={true}
                onClear={() => props.onSearchTermChange('')}
                aria-label={formatMessage({
                    id: 'user.settings.modal.search.ariaLabel',
                    defaultMessage: 'Search settings',
                })}
            />
            {hasQuery && (
                <div
                    className='SettingsSearch__results'
                    role='listbox'
                    aria-label={formatMessage({
                        id: 'user.settings.modal.search.results.ariaLabel',
                        defaultMessage: 'Settings search results',
                    })}
                >
                    {props.results.length === 0 ? (
                        <div
                            className='SettingsSearch__empty'
                            data-testid='settings-search-empty'
                        >
                            <FormattedMessage
                                id='user.settings.modal.search.noResults'
                                defaultMessage='No settings found'
                            />
                        </div>
                    ) : (
                        props.results.map((result) => (
                            <button
                                key={result.id}
                                type='button'
                                className={classNames('SettingsSearch__result', 'cursor--pointer', 'style--none')}
                                data-testid={`settings-search-result-${result.id}`}
                                role='option'
                                onClick={() => props.onSelectResult(result)}
                            >
                                <span className='SettingsSearch__resultLabel'>{result.label}</span>
                                {result.section && (
                                    <span className='SettingsSearch__resultTab'>{result.tabLabel}</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
