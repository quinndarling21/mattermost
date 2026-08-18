// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import type {IntlShape} from 'react-intl';

import {MagnifyIcon} from '@mattermost/compass-icons/components';

import Input from 'components/widgets/inputs/input/input';

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

export type SearchItem = {
    category: string;
    keywords?: string[];
    section: string;
    tab: string;
    title: string;
}

export type Props = {
    activeTab?: string;
    intl: IntlShape;
    tabs: Tab[];
    pluginTabs?: Tab[];
    searchItems?: SearchItem[];
    onSearchItemSelect?: (item: SearchItem) => void;
    updateTab: (name: string) => void;
    isMobileView: boolean;
};

type State = {
    searchTerm: string;
}

export class SettingsSidebar extends React.PureComponent<Props, State> {
    buttonRefs: Map<string, HTMLButtonElement>;

    constructor(props: Props) {
        super(props);

        this.buttonRefs = new Map();
        this.state = {searchTerm: ''};
    }

    // Get all visible tabs in the correct order
    private getVisibleTabs(): Tab[] {
        const visibleTabs = this.props.tabs.filter((tab) => tab.display !== false);
        const visiblePluginTabs = this.props.pluginTabs?.filter((tab) => tab.display !== false) || [];
        return [...visibleTabs, ...visiblePluginTabs];
    }

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

    private handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({searchTerm: event.currentTarget.value});
    };

    private clearSearch = () => {
        this.setState({searchTerm: ''});
    };

    private handleSearchItemClick = (item: SearchItem, event: React.MouseEvent<HTMLButtonElement>) => {
        this.clearSearch();
        this.props.onSearchItemSelect?.(item);
        event.currentTarget.closest('.settings-modal')?.classList.add('display--content');
    };

    private renderSearch() {
        if (!this.props.searchItems?.length) {
            return null;
        }

        const {formatMessage} = this.props.intl;
        const normalizedSearchTerm = this.state.searchTerm.trim().toLocaleLowerCase();
        const results = normalizedSearchTerm ? this.props.searchItems.filter((item) => {
            const searchableText = [item.title, item.category, ...(item.keywords || [])].join(' ').toLocaleLowerCase();
            return searchableText.includes(normalizedSearchTerm);
        }) : [];

        let searchResults = null;
        if (normalizedSearchTerm && results.length === 0) {
            searchResults = (
                <div
                    className='SettingsSidebar__empty'
                    role='status'
                >
                    <MagnifyIcon
                        className='SettingsSidebar__emptyIcon'
                        size={24}
                    />
                    <strong className='SettingsSidebar__emptyTitle'>
                        <FormattedMessage
                            id='user.settings.search.noResults'
                            defaultMessage='No settings found'
                        />
                    </strong>
                    <span className='SettingsSidebar__emptyHint'>
                        <FormattedMessage
                            id='user.settings.search.noResultsHint'
                            defaultMessage='Try searching for another setting.'
                        />
                    </span>
                </div>
            );
        } else if (normalizedSearchTerm) {
            searchResults = (
                <div
                    className='SettingsSidebar__results'
                    aria-label={formatMessage({id: 'user.settings.search.results', defaultMessage: 'Search results'})}
                >
                    <div
                        className='SettingsSidebar__resultsCount'
                        role='status'
                    >
                        <FormattedMessage
                            id='user.settings.search.resultsCount'
                            defaultMessage='{count, plural, one {# result} other {# results}}'
                            values={{count: results.length}}
                        />
                    </div>
                    {results.map((item) => (
                        <button
                            key={`${item.tab}-${item.section}`}
                            className='SettingsSidebar__result style--none'
                            type='button'
                            onClick={(event) => this.handleSearchItemClick(item, event)}
                        >
                            <span className='SettingsSidebar__resultTitle'>{item.title}</span>
                            <span className='SettingsSidebar__resultCategory'>{item.category}</span>
                        </button>
                    ))}
                </div>
            );
        }

        return (
            <>
                <Input
                    id='userSettingsSearch'
                    name='userSettingsSearch'
                    containerClassName='SettingsSidebar__search'
                    type='search'
                    inputPrefix={<MagnifyIcon size={18}/>}
                    placeholder={formatMessage({id: 'user.settings.search.placeholder', defaultMessage: 'Search settings'})}
                    aria-label={formatMessage({id: 'user.settings.search.label', defaultMessage: 'Search settings'})}
                    useLegend={false}
                    clearable={true}
                    maxLength={128}
                    value={this.state.searchTerm}
                    onChange={this.handleSearchChange}
                    onClear={this.clearSearch}
                />
                {searchResults}
            </>
        );
    }

    public render() {
        // Filter regular tabs and plugin tabs separately for rendering
        const visibleTabs = this.props.tabs.filter((tab) => tab.display !== false);

        // Map regular tabs
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
            <div
                id='tabList'
                className='nav nav-pills nav-stacked'
            >
                {this.renderSearch()}
                {!this.state.searchTerm.trim() && (
                    <div
                        role='tablist'
                        aria-orientation='vertical'
                    >
                        <div role='group'>
                            {tabList}
                        </div>
                        {pluginTabList}
                    </div>
                )}
            </div>
        );
    }
}

export default injectIntl(SettingsSidebar);
