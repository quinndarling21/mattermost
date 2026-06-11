// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo, useRef} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import QuickInput from 'components/quick_input';
import SearchIcon from 'components/widgets/icons/search_icon';

import Constants from 'utils/constants';
import {isKeyPressed} from 'utils/keyboard';

import type {PluginConfiguration} from 'types/plugins/user_settings';

import {
    builtInSearchableSettings,
    createUserSettingsSearchIndex,
    getPluginSearchableSettings,
    searchUserSettings,
} from './searchable_user_settings';

import './settings_search.scss';

type Props = {

    /** Current search query (controlled by the parent modal). */
    query: string;

    /** Called when the query changes. */
    onChange: (query: string) => void;

    /** Called when a search result is selected with the target tab and section. */
    onSelect: (tab: string, section: string) => void;

    /** Plugin settings so plugin-provided sections can be searched too. */
    pluginSettings?: {[pluginId: string]: PluginConfiguration};
};

export default function SettingsSearch({query, onChange, onSelect, pluginSettings}: Props) {
    const intl = useIntl();
    const resultsRef = useRef<HTMLDivElement>(null);

    const settings = useMemo(
        () => [...builtInSearchableSettings, ...getPluginSearchableSettings(pluginSettings)],
        [pluginSettings],
    );

    const index = useMemo(() => createUserSettingsSearchIndex(settings, intl), [settings, intl]);

    const results = useMemo(() => searchUserSettings(query, settings, index), [query, settings, index]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    }, [onChange]);

    const handleClear = useCallback(() => {
        onChange('');
    }, [onChange]);

    const focusResultByOffset = useCallback((current: HTMLElement, offset: number) => {
        const buttons = Array.from(resultsRef.current?.querySelectorAll<HTMLButtonElement>('.settingsSearch__result') ?? []);
        const currentIndex = buttons.indexOf(current as HTMLButtonElement);
        const nextIndex = currentIndex + offset;
        if (nextIndex >= 0 && nextIndex < buttons.length) {
            buttons[nextIndex].focus();
        }
    }, []);

    const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (isKeyPressed(e, Constants.KeyCodes.DOWN)) {
            const firstResult = resultsRef.current?.querySelector<HTMLButtonElement>('.settingsSearch__result');
            if (firstResult) {
                e.preventDefault();
                firstResult.focus();
            }
        }
    }, []);

    const handleResultKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (isKeyPressed(e, Constants.KeyCodes.DOWN)) {
            e.preventDefault();
            focusResultByOffset(e.currentTarget, 1);
        } else if (isKeyPressed(e, Constants.KeyCodes.UP)) {
            e.preventDefault();
            focusResultByOffset(e.currentTarget, -1);
        }
    }, [focusResultByOffset]);

    const hasQuery = Boolean(query.trim());

    return (
        <div className='settingsSearch'>
            <div className='settingsSearch__inputContainer'>
                <SearchIcon
                    className='settingsSearch__icon'
                    aria-hidden='true'
                />
                <QuickInput
                    id='searchUserSettingsInput'
                    className={'settingsSearch__input' + (hasQuery ? ' active' : '')}
                    type='text'
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder={intl.formatMessage({id: 'user.settings.modal.search', defaultMessage: 'Search settings'})}
                    aria-label={intl.formatMessage({id: 'user.settings.modal.search', defaultMessage: 'Search settings'})}
                    clearable={true}
                    onClear={handleClear}
                />
            </div>
            {hasQuery && (
                <div
                    ref={resultsRef}
                    className='settingsSearch__results'
                    role='list'
                    data-testid='settingsSearchResults'
                >
                    {results.length === 0 ? (
                        <div className='settingsSearch__noResults'>
                            <FormattedMessage
                                id='user.settings.modal.search.noResults'
                                defaultMessage='No settings match “{query}”'
                                values={{query: query.trim()}}
                            />
                        </div>
                    ) : (
                        results.map((result) => {
                            const title = intl.formatMessage(result.title);
                            const tabLabel = typeof result.tabLabel === 'string' ? result.tabLabel : intl.formatMessage(result.tabLabel);
                            return (
                                <button
                                    key={`${result.tab}_${result.section}`}
                                    type='button'
                                    role='listitem'
                                    className='settingsSearch__result'
                                    data-testid={`settingsSearchResult_${result.tab}_${result.section}`}
                                    onClick={() => onSelect(result.tab, result.section)}
                                    onKeyDown={handleResultKeyDown}
                                >
                                    <span className='settingsSearch__resultTitle'>{title}</span>
                                    <span className='settingsSearch__resultTab'>{tabLabel}</span>
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
