// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import type {Tab} from 'components/settings_sidebar/settings_sidebar';

import {getSettingsSearchEntries, normalizeSearchTerm, entryMatches} from './settings_search_entries';
import type {SettingsSearchEntry} from './settings_search_entries';

import './settings_search.scss';

type Props = {

    // The current search query.
    searchTerm: string;

    // Called when the query changes.
    onChange: (searchTerm: string) => void;

    // The built-in tabs that are currently available in the modal.
    tabs: Tab[];

    // Plugin-provided tabs that are currently available in the modal.
    pluginTabs: Tab[];

    // Called when a search result is selected. Navigates to the given tab and, when
    // provided, the given section.
    onNavigate: (tab: string, section?: string) => void;
};

type SettingsSearchResult = {
    tab: Tab;
    section?: string;
    label: string;
    key: string;
};

const SettingsSearch = ({searchTerm, onChange, tabs, pluginTabs, onNavigate}: Props) => {
    const intl = useIntl();
    const {formatMessage} = intl;

    const normalizedQuery = normalizeSearchTerm(searchTerm);
    const hasQuery = normalizedQuery.length > 0;

    const availableTabs = useMemo(() => {
        const map = new Map<string, Tab>();
        [...tabs, ...pluginTabs].forEach((tab) => map.set(tab.name, tab));
        return map;
    }, [tabs, pluginTabs]);

    const results = useMemo<SettingsSearchResult[]>(() => {
        if (!hasQuery) {
            return [];
        }

        const collected: SettingsSearchResult[] = [];
        const seen = new Set<string>();

        // Top-level tab matches come first so that searching for a tab name is direct.
        [...tabs, ...pluginTabs].forEach((tab) => {
            if (tab.uiName.toLowerCase().includes(normalizedQuery)) {
                const key = `tab-${tab.name}`;
                collected.push({tab, label: tab.uiName, key});
                seen.add(tab.name);
            }
        });

        // Section-level matches, limited to the tabs currently visible in the modal.
        getSettingsSearchEntries().forEach((entry: SettingsSearchEntry) => {
            const tab = availableTabs.get(entry.tab);
            if (!tab) {
                return;
            }
            if (!entryMatches(intl, entry, normalizedQuery)) {
                return;
            }
            collected.push({
                tab,
                section: entry.section,
                label: formatMessage(entry.label),
                key: `section-${entry.tab}-${entry.section ?? ''}`,
            });
        });

        return collected;
    }, [hasQuery, normalizedQuery, tabs, pluginTabs, availableTabs, intl, formatMessage]);

    const renderIcon = (tab: Tab) => {
        if (typeof tab.icon === 'string') {
            return (
                <i
                    className={tab.icon}
                    aria-hidden={true}
                />
            );
        }
        return (
            <img
                src={tab.icon.url}
                alt=''
                className='icon'
                aria-hidden={true}
            />
        );
    };

    return (
        <div className='SettingsSearch'>
            <div className='SettingsSearch__inputWrapper'>
                <i
                    className='icon icon-magnify SettingsSearch__searchIcon'
                    aria-hidden={true}
                />
                <input
                    id='settingsSearchInput'
                    className='SettingsSearch__input form-control'
                    type='text'
                    autoComplete='off'
                    value={searchTerm}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={formatMessage({id: 'user.settings.search.placeholder', defaultMessage: 'Search settings'})}
                    aria-label={formatMessage({id: 'user.settings.search.placeholder', defaultMessage: 'Search settings'})}
                />
                {searchTerm && (
                    <button
                        type='button'
                        className='SettingsSearch__clear style--none'
                        onClick={() => onChange('')}
                        aria-label={formatMessage({id: 'user.settings.search.clear', defaultMessage: 'Clear search'})}
                    >
                        <i
                            className='icon icon-close-circle'
                            aria-hidden={true}
                        />
                    </button>
                )}
            </div>

            {hasQuery && (
                <div
                    className='SettingsSearch__results'
                    role='listbox'
                    aria-label={formatMessage({id: 'user.settings.search.resultsLabel', defaultMessage: 'Settings search results'})}
                >
                    {results.length === 0 ? (
                        <div className='SettingsSearch__noResults'>
                            <FormattedMessage
                                id='user.settings.search.noResults'
                                defaultMessage='No settings found'
                            />
                        </div>
                    ) : (
                        results.map((result) => (
                            <button
                                key={result.key}
                                type='button'
                                role='option'
                                aria-selected={false}
                                className='SettingsSearch__result style--none'
                                onClick={() => onNavigate(result.tab.name, result.section)}
                            >
                                <span className='SettingsSearch__resultIcon'>
                                    {renderIcon(result.tab)}
                                </span>
                                <span className='SettingsSearch__resultText'>
                                    <span className='SettingsSearch__resultLabel'>{result.label}</span>
                                    <span className='SettingsSearch__resultTab'>{result.tab.uiName}</span>
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SettingsSearch;
