// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {forwardRef, useImperativeHandle, useMemo, useRef} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import Constants from 'utils/constants';
import {isKeyPressed} from 'utils/keyboard';

import {getCategoryLabel, searchSettings} from './settings_search_data';
import type {SettingsSearchResult} from './settings_search_data';

import './settings_search.scss';

export type SettingsSearchResultsHandle = {
    focusFirst: () => void;
};

type Props = {
    query: string;
    availableTabs: string[];
    onSelect: (tab: string, section: string) => void;

    // Called when focus should move back up to the search field (ArrowUp on the
    // first result).
    onFocusSearch?: () => void;
};

const SettingsSearchResults = forwardRef<SettingsSearchResultsHandle, Props>((
    {query, availableTabs, onSelect, onFocusSearch}: Props,
    ref,
) => {
    const intl = useIntl();
    const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const results: SettingsSearchResult[] = useMemo(
        () => searchSettings(query, intl, availableTabs),
        [query, intl, availableTabs],
    );

    useImperativeHandle(ref, () => ({
        focusFirst: () => {
            itemRefs.current[0]?.focus();
        },
    }), []);

    const focusItem = (index: number) => {
        if (index < 0) {
            onFocusSearch?.();
            return;
        }
        const clamped = Math.min(index, results.length - 1);
        itemRefs.current[clamped]?.focus();
    };

    const handleItemKeyDown = (index: number, e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (isKeyPressed(e, Constants.KeyCodes.DOWN)) {
            e.preventDefault();
            focusItem(index + 1);
        } else if (isKeyPressed(e, Constants.KeyCodes.UP)) {
            e.preventDefault();
            focusItem(index - 1);
        }
    };

    if (!query.trim()) {
        return null;
    }

    if (results.length === 0) {
        return (
            <div
                className='SettingsSearchResults SettingsSearchResults--empty'
                role='region'
                aria-live='polite'
            >
                <i className='icon icon-magnify SettingsSearchResults__emptyIcon'/>
                <div className='SettingsSearchResults__emptyTitle'>
                    <FormattedMessage
                        id='user.settings.search.noResults.title'
                        defaultMessage='No settings found for “{query}”'
                        values={{query: query.trim()}}
                    />
                </div>
                <div className='SettingsSearchResults__emptyDescription'>
                    <FormattedMessage
                        id='user.settings.search.noResults.description'
                        defaultMessage='Try a different keyword, or browse the categories on the left.'
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            className='SettingsSearchResults'
            role='region'
            aria-live='polite'
        >
            <div className='SettingsSearchResults__count'>
                <FormattedMessage
                    id='user.settings.search.resultCount'
                    defaultMessage='{count, plural, one {# result} other {# results}} for “{query}”'
                    values={{count: results.length, query: query.trim()}}
                />
            </div>
            <ul
                className='SettingsSearchResults__list'
                role='listbox'
            >
                {results.map((result, index) => {
                    const category = getCategoryLabel(result.tab);
                    return (
                        <li
                            key={`${result.tab}-${result.section}`}
                            role='option'
                            aria-selected={false}
                        >
                            <button
                                type='button'
                                ref={(el) => {
                                    itemRefs.current[index] = el;
                                }}
                                className='style--none SettingsSearchResults__item'
                                data-testid={`settingsSearchResult_${result.tab}_${result.section}`}
                                onClick={() => onSelect(result.tab, result.section)}
                                onKeyDown={(e) => handleItemKeyDown(index, e)}
                            >
                                <div className='SettingsSearchResults__itemText'>
                                    <span className='SettingsSearchResults__itemTitle'>
                                        {intl.formatMessage(result.title)}
                                    </span>
                                    <span className='SettingsSearchResults__itemDescription'>
                                        {intl.formatMessage(result.description)}
                                    </span>
                                </div>
                                {category && (
                                    <span className='SettingsSearchResults__itemCategory'>
                                        {intl.formatMessage(category)}
                                    </span>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
});

SettingsSearchResults.displayName = 'SettingsSearchResults';

export default SettingsSearchResults;
