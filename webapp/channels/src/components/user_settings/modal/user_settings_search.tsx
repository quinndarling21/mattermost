// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import type {IntlShape} from 'react-intl';

import type {SettingsSearchEntry} from './user_settings_search_index';
import {filterSettingsSearchEntries} from './user_settings_search_index';

type Props = {
    intl: IntlShape;
    searchTerm: string;
    entries: SettingsSearchEntry[];
    onSearchTermChange: (searchTerm: string) => void;
    onSelectResult: (tab: string, section?: string) => void;
};

class UserSettingsSearch extends React.PureComponent<Props> {
    private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onSearchTermChange(e.target.value);
    };

    private handleClear = () => {
        this.props.onSearchTermChange('');
    };

    private handleResultClick = (entry: SettingsSearchEntry) => {
        this.props.onSelectResult(entry.tab, entry.section);
    };

    private renderResult(entry: SettingsSearchEntry) {
        const {formatMessage} = this.props.intl;
        const resultLabel = entry.type === 'section' ?
            formatMessage(
                {
                    id: 'user.settings.modal.searchResultSection',
                    defaultMessage: '{section} in {tab}',
                },
                {section: entry.label, tab: entry.tabLabel},
            ) :
            entry.label;

        return (
            <button
                key={`${entry.tab}:${entry.section ?? ''}:${entry.type}`}
                type='button'
                className='cursor--pointer style--none nav-pills__tab UserSettingsSearch__result'
                onClick={() => this.handleResultClick(entry)}
                data-testid={`settings-search-result-${entry.tab}${entry.section ? `-${entry.section}` : ''}`}
                aria-label={resultLabel}
            >
                <i
                    className='icon icon-magnify'
                    aria-hidden='true'
                />
                <span className='UserSettingsSearch__resultText'>
                    {entry.type === 'section' ? (
                        <>
                            <span className='UserSettingsSearch__resultLabel'>{entry.label}</span>
                            <span className='UserSettingsSearch__resultTab'>
                                <FormattedMessage
                                    id='user.settings.modal.searchResultInTab'
                                    defaultMessage='in {tab}'
                                    values={{tab: entry.tabLabel}}
                                />
                            </span>
                        </>
                    ) : (
                        <span className='UserSettingsSearch__resultLabel'>{entry.label}</span>
                    )}
                </span>
            </button>
        );
    }

    public render() {
        const {formatMessage} = this.props.intl;
        const normalizedQuery = this.props.searchTerm.trim();
        const results = filterSettingsSearchEntries(this.props.entries, this.props.searchTerm);
        const showResults = normalizedQuery.length > 0;

        return (
            <div className='UserSettingsSearch'>
                <div className='UserSettingsSearch__inputWrapper'>
                    <i
                        className='icon icon-magnify'
                        aria-hidden='true'
                    />
                    <input
                        type='text'
                        className='form-control UserSettingsSearch__input'
                        value={this.props.searchTerm}
                        onChange={this.handleInputChange}
                        placeholder={formatMessage({
                            id: 'user.settings.modal.searchPlaceholder',
                            defaultMessage: 'Search settings',
                        })}
                        aria-label={formatMessage({
                            id: 'user.settings.modal.searchAria',
                            defaultMessage: 'Search settings',
                        })}
                        data-testid='settings-search-input'
                    />
                    {normalizedQuery.length > 0 && (
                        <button
                            type='button'
                            className='style--none UserSettingsSearch__clear'
                            onClick={this.handleClear}
                            aria-label={formatMessage({
                                id: 'user.settings.modal.searchClear',
                                defaultMessage: 'Clear search',
                            })}
                            data-testid='settings-search-clear'
                        >
                            <i
                                className='icon icon-close-circle'
                                aria-hidden='true'
                            />
                        </button>
                    )}
                </div>
                {showResults && (
                    <div
                        className={classNames('UserSettingsSearch__results', 'nav', 'nav-pills', 'nav-stacked')}
                        role='listbox'
                        aria-label={formatMessage({
                            id: 'user.settings.modal.searchResults',
                            defaultMessage: 'Settings search results',
                        })}
                        data-testid='settings-search-results'
                    >
                        {results.length > 0 ? (
                            results.map((entry) => this.renderResult(entry))
                        ) : (
                            <div
                                className='UserSettingsSearch__empty'
                                data-testid='settings-search-empty'
                            >
                                <FormattedMessage
                                    id='user.settings.modal.searchNoResults'
                                    defaultMessage='No settings found'
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default injectIntl(UserSettingsSearch);
