// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {
    filterUserSettings,
    groupSearchMatchesByTab,
} from 'components/user_settings/search';
import type {UserSettingsSearchItem, UserSettingsSearchMatch} from 'components/user_settings/search';
import HighlightMatches from 'components/user_settings/search/highlight_matches';
import SearchIcon from 'components/widgets/icons/search_icon';

import Constants from 'utils/constants';
import {isKeyPressed} from 'utils/keyboard';

import './settings_sidebar.scss';

export type Tab = {
    icon: string | {url: string};
    iconTitle: string;
    name: string;
    uiName: string;
    newGroup?: boolean;
    display?: boolean; // Controls whether the tab is displayed, defaults to true
}

export type Props = {
    activeTab?: string;
    tabs: Tab[];
    pluginTabs?: Tab[];
    updateTab: (name: string) => void;
    isMobileView: boolean;

    /** When provided, enables Find settings search in the sidebar */
    searchItems?: UserSettingsSearchItem[];
    activeSection?: string;
    updateSection?: (section: string) => void;
    navigateToSetting?: (tab: string, section: string) => void;
    onSearchChange?: (query: string) => void;
};

type State = {
    filter: string;
};

type SettingsSearchInputProps = {
    value: string;
    inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onClear: () => void;
};

function SettingsSearchInput({
    value,
    inputRef,
    onChange,
    onKeyDown,
    onClear,
}: SettingsSearchInputProps) {
    const {formatMessage} = useIntl();
    const placeholder = formatMessage({
        id: 'user.settings.modal.findSettings',
        defaultMessage: 'Find settings',
    });

    return (
        <div className='SettingsSidebar__filterContainer'>
            <label
                className='sr-only'
                htmlFor='userSettingsFilter'
            >
                {placeholder}
            </label>
            <SearchIcon
                className='search__icon'
                aria-hidden='true'
            />
            <input
                id='userSettingsFilter'
                className={classNames('SettingsSidebar__filter', {active: Boolean(value)})}
                type='search'
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                ref={inputRef as React.RefObject<HTMLInputElement>}
                autoComplete='off'
            />
            {value && (
                <button
                    type='button'
                    className='SettingsSidebar__clear'
                    onClick={onClear}
                    aria-label={formatMessage({id: 'input.clear', defaultMessage: 'Clear'})}
                >
                    <i
                        className='icon icon-close-circle'
                        aria-hidden='true'
                    />
                </button>
            )}
        </div>
    );
}

export default class SettingsSidebar extends React.PureComponent<Props, State> {
    buttonRefs: Map<string, HTMLButtonElement>;
    searchInputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
    private lastAutoRoutedId: string | null;

    constructor(props: Props) {
        super(props);

        this.state = {
            filter: '',
        };

        this.buttonRefs = new Map();
        this.searchInputRef = React.createRef();
        this.lastAutoRoutedId = null;
    }

    componentDidUpdate(_prevProps: Props, prevState: State) {
        if (!this.props.searchItems?.length) {
            return;
        }

        if (prevState.filter === this.state.filter) {
            return;
        }

        const matches = this.getMatches();
        if (matches.length === 0) {
            this.lastAutoRoutedId = null;
            return;
        }

        const currentMatch = matches.find((match) => this.isResultActive(match));
        const target = currentMatch || matches[0];

        if (this.lastAutoRoutedId === target.id) {
            return;
        }

        this.lastAutoRoutedId = target.id;

        if (currentMatch) {
            return;
        }

        this.routeToResult(target, false);

        // Keep focus in the search input while auto-routing during typing
        requestAnimationFrame(() => {
            this.searchInputRef.current?.focus();
        });
    }

    private getMatches(): UserSettingsSearchMatch[] {
        if (!this.props.searchItems?.length) {
            return [];
        }
        return filterUserSettings(this.props.searchItems, this.state.filter);
    }

    private getVisibleTabs(): Tab[] {
        const visibleTabs = this.props.tabs.filter((tab) => tab.display !== false);
        const visiblePluginTabs = this.props.pluginTabs?.filter((tab) => tab.display !== false) || [];
        return [...visibleTabs, ...visiblePluginTabs];
    }

    private routeToResult = (result: UserSettingsSearchMatch, moveFocus: boolean) => {
        if (this.props.navigateToSetting) {
            this.props.navigateToSetting(result.tab, result.section);
        } else {
            this.props.updateTab(result.tab);
            if (result.section && this.props.updateSection) {
                this.props.updateSection(result.section);
            }
        }

        if (moveFocus) {
            requestAnimationFrame(() => {
                const editButton = result.section ? document.getElementById(`${result.section}Edit`) : null;
                const title = result.section ? document.getElementById(`${result.section}Title`) : null;
                const target = editButton || title;
                if (target) {
                    target.scrollIntoView({block: 'nearest', behavior: 'smooth'});
                    if (editButton) {
                        editButton.focus();
                    }
                }
            });
        }
    };

    public handleClick = (tab: Tab, e: React.MouseEvent) => {
        e.preventDefault();
        this.props.updateTab(tab.name);
        (e.target as Element).closest('.settings-modal')?.classList.add('display--content');
    };

    public handleKeyDown = (tab: Tab, e: React.KeyboardEvent) => {
        // Only handle UP and DOWN arrow keys
        if (!isKeyPressed(e, Constants.KeyCodes.UP) && !isKeyPressed(e, Constants.KeyCodes.DOWN)) {
            return;
        }

        // Prevent scrolling
        e.preventDefault();

        // Get all visible tabs
        const visibleTabs = this.getVisibleTabs();

        // If no tabs are visible, do nothing
        if (visibleTabs.length === 0) {
            return;
        }

        // Find the current tab's position in the visible tabs
        const currentIndex = visibleTabs.findIndex((t) => t.name === tab.name);

        // If tab not found in visible tabs, do nothing
        if (currentIndex === -1) {
            return;
        }

        let nextIndex: number;

        // Determine which tab to focus based on the key pressed
        if (isKeyPressed(e, Constants.KeyCodes.UP)) {
            // UP arrow key - move to previous tab or wrap to last
            nextIndex = currentIndex > 0 ? currentIndex - 1 : visibleTabs.length - 1;
        } else {
            // DOWN arrow key - move to next tab or wrap to first
            nextIndex = currentIndex < visibleTabs.length - 1 ? currentIndex + 1 : 0;
        }

        // Get the target tab
        const targetTab = visibleTabs[nextIndex];

        // Update the active tab
        this.props.updateTab(targetTab.name);

        // Focus the target tab button directly
        const targetButton = this.buttonRefs.get(targetTab.name);
        if (targetButton) {
            // Use direct focus instead of a11yFocus to ensure Cypress tests can detect the focus change
            targetButton.focus();
        }
    };

    private handleResultKeyDown = (result: UserSettingsSearchMatch, e: React.KeyboardEvent) => {
        if (!isKeyPressed(e, Constants.KeyCodes.UP) && !isKeyPressed(e, Constants.KeyCodes.DOWN) && !isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            return;
        }

        e.preventDefault();

        if (isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            this.routeToResult(result, true);
            return;
        }

        const results = this.getMatches();
        if (results.length === 0) {
            return;
        }

        const currentIndex = results.findIndex((r) => r.id === result.id);
        if (currentIndex === -1) {
            return;
        }

        let nextIndex: number;
        if (isKeyPressed(e, Constants.KeyCodes.UP)) {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
        } else {
            nextIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
        }

        const target = results[nextIndex];
        this.routeToResult(target, false);
        const targetButton = this.buttonRefs.get(target.id);
        targetButton?.focus();
    };

    private handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filter = e.target.value;
        this.setState({filter});
        this.props.onSearchChange?.(filter);
    };

    private handleClearFilter = () => {
        this.setState({filter: ''});
        this.lastAutoRoutedId = null;
        this.props.onSearchChange?.('');
        requestAnimationFrame(() => {
            this.searchInputRef.current?.focus();
        });
    };

    private handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (!isKeyPressed(e, Constants.KeyCodes.ENTER) && !isKeyPressed(e, Constants.KeyCodes.DOWN)) {
            return;
        }

        const matches = this.getMatches();
        if (matches.length === 0) {
            return;
        }

        e.preventDefault();

        if (isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            this.routeToResult(matches[0], true);
            return;
        }

        const firstButton = this.buttonRefs.get(matches[0].id);
        firstButton?.focus();
    };

    private isResultActive(result: UserSettingsSearchMatch): boolean {
        if (this.props.activeTab !== result.tab) {
            return false;
        }
        if (!result.section) {
            return !this.props.activeSection;
        }
        return this.props.activeSection === result.section;
    }

    private renderTab(tab: Tab) {
        const key = `${tab.name}_li`;
        const isActive = this.props.activeTab === tab.name;

        let icon;
        if (typeof tab.icon === 'string') {
            icon = (
                <i
                    className={tab.icon}
                    title={tab.iconTitle}
                />
            );
        } else {
            icon = (
                <img
                    src={tab.icon.url}
                    alt={tab.iconTitle}
                    className='icon'
                />
            );
        }

        return (
            <React.Fragment key={key}>
                {tab.newGroup && <hr/>}
                <button
                    data-testid={`${tab.name}-tab-button`}
                    ref={(element: HTMLButtonElement) => {
                        if (element) {
                            this.buttonRefs.set(tab.name, element);
                        } else {
                            this.buttonRefs.delete(tab.name);
                        }
                    }}
                    id={`${tab.name}Button`}
                    className={classNames('cursor--pointer style--none nav-pills__tab', {active: isActive})}
                    onClick={this.handleClick.bind(null, tab)}
                    onKeyDown={this.handleKeyDown.bind(null, tab)}
                    aria-label={tab.uiName.toLowerCase()}
                    role='tab'
                    aria-selected={isActive}
                    tabIndex={!isActive && !this.props.isMobileView ? -1 : 0}
                    aria-controls={`${tab.name}Settings`}
                >
                    {icon}
                    {tab.uiName}
                </button>
            </React.Fragment>
        );
    }

    private renderSearchResult(result: UserSettingsSearchMatch) {
        const isActive = this.isResultActive(result);

        return (
            <button
                key={result.id}
                data-testid={`settings-search-result-${result.id}`}
                ref={(element: HTMLButtonElement) => {
                    if (element) {
                        this.buttonRefs.set(result.id, element);
                    } else {
                        this.buttonRefs.delete(result.id);
                    }
                }}
                className={classNames('cursor--pointer style--none nav-pills__tab SettingsSidebar__searchResult', {active: isActive})}
                onClick={() => {
                    this.routeToResult(result, true);
                    (document.querySelector('.settings-modal') as HTMLElement | null)?.classList.add('display--content');
                }}
                onKeyDown={(e) => this.handleResultKeyDown(result, e)}
                role='option'
                aria-selected={isActive}
                tabIndex={isActive || this.props.isMobileView ? 0 : -1}
            >
                <span className='SettingsSidebar__searchResultLabel'>
                    <HighlightMatches
                        text={result.label}
                        query={this.state.filter}
                    />
                </span>
            </button>
        );
    }

    private renderSearchResults() {
        const matches = this.getMatches();

        if (matches.length === 0) {
            return (
                <div
                    className='SettingsSidebar__noResults'
                    role='status'
                    aria-live='polite'
                >
                    <FormattedMessage
                        id='user.settings.modal.noSettingsFound'
                        defaultMessage='No settings found'
                    />
                </div>
            );
        }

        const groups = groupSearchMatchesByTab(matches);
        const firstPartyGroups = groups.filter((group) => !group.isPlugin);
        const pluginGroups = groups.filter((group) => group.isPlugin);

        return (
            <div
                role='listbox'
                aria-labelledby='userSettingsSearchResultsLabel'
            >
                <span
                    id='userSettingsSearchResultsLabel'
                    className='sr-only'
                >
                    <FormattedMessage
                        id='user.settings.modal.searchResults'
                        defaultMessage='Settings search results'
                    />
                </span>
                {firstPartyGroups.map((group) => (
                    <div
                        key={group.tab}
                        role='group'
                        aria-label={group.tabLabel}
                        className='SettingsSidebar__resultGroup'
                    >
                        <div
                            className='header SettingsSidebar__resultGroupHeader'
                            role='heading'
                            aria-level={3}
                        >
                            {group.tabLabel}
                        </div>
                        {group.items.map((result) => this.renderSearchResult(result))}
                    </div>
                ))}
                {pluginGroups.length > 0 && (
                    <>
                        <hr/>
                        <div
                            role='group'
                            aria-labelledby='userSettingsModal_pluginPreferences_header'
                        >
                            <div
                                role='heading'
                                className='header'
                                aria-level={3}
                                id='userSettingsModal_pluginPreferences_header'
                            >
                                <FormattedMessage
                                    id='userSettingsModal.pluginPreferences.header'
                                    defaultMessage='PLUGIN PREFERENCES'
                                />
                            </div>
                            {pluginGroups.map((group) => (
                                <div
                                    key={group.tab}
                                    role='group'
                                    aria-label={group.tabLabel}
                                    className='SettingsSidebar__resultGroup'
                                >
                                    <div
                                        className='header SettingsSidebar__resultGroupHeader'
                                        role='heading'
                                        aria-level={4}
                                    >
                                        {group.tabLabel}
                                    </div>
                                    {group.items.map((result) => this.renderSearchResult(result))}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    private renderTabList() {
        const visibleTabs = this.props.tabs.filter((tab) => tab.display !== false);
        const tabList = visibleTabs.map((tab) => this.renderTab(tab));

        let pluginTabList: React.ReactNode;
        if (this.props.pluginTabs?.length) {
            const visiblePluginTabs = this.props.pluginTabs.filter((tab) => tab.display !== false);
            if (visiblePluginTabs.length) {
                pluginTabList = (
                    <>
                        <hr/>
                        <div
                            role='group'
                            aria-labelledby='userSettingsModal.pluginPreferences.header'
                        >
                            <div
                                key={'plugin preferences heading'}
                                role='heading'
                                className={'header'}
                                aria-level={3}
                                id='userSettingsModal_pluginPreferences_header'
                            >
                                <FormattedMessage
                                    id={'userSettingsModal.pluginPreferences.header'}
                                    defaultMessage={'PLUGIN PREFERENCES'}
                                />
                            </div>
                            {visiblePluginTabs.map((tab) => this.renderTab(tab))}
                        </div>
                    </>
                );
            }
        }

        return (
            <>
                <div role='group'>
                    {tabList}
                </div>
                {pluginTabList}
            </>
        );
    }

    public render() {
        const searchEnabled = Boolean(this.props.searchItems?.length);
        const isSearching = searchEnabled && this.state.filter.trim().length > 0;

        return (
            <div className='SettingsSidebar'>
                {searchEnabled && (
                    <SettingsSearchInput
                        value={this.state.filter}
                        inputRef={this.searchInputRef}
                        onChange={this.handleSearchChange}
                        onKeyDown={this.handleSearchKeyDown}
                        onClear={this.handleClearFilter}
                    />
                )}
                <div
                    id='tabList'
                    className='nav nav-pills nav-stacked'
                    role={isSearching ? undefined : 'tablist'}
                    aria-orientation={isSearching ? undefined : 'vertical'}
                >
                    {isSearching ? this.renderSearchResults() : this.renderTabList()}
                </div>
            </div>
        );
    }
}
