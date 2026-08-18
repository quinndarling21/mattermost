// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {forwardRef} from 'react';
import {useIntl} from 'react-intl';

import Input from 'components/widgets/inputs/input/input';

import Constants from 'utils/constants';
import {isKeyPressed} from 'utils/keyboard';

import './settings_search.scss';

type Props = {
    value: string;
    onChange: (value: string) => void;

    // Called when the user presses ArrowDown/Enter in the field, so focus can
    // move into the results list.
    onEnterResults?: () => void;
};

const SettingsSearch = forwardRef<HTMLInputElement, Props>(({value, onChange, onEnterResults}: Props, ref) => {
    const {formatMessage} = useIntl();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (isKeyPressed(e, Constants.KeyCodes.ESCAPE) && value) {
            e.preventDefault();
            e.stopPropagation();
            onChange('');
            return;
        }

        if (!value) {
            return;
        }

        if (isKeyPressed(e, Constants.KeyCodes.DOWN) || isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            e.preventDefault();
            onEnterResults?.();
        }
    };

    let inputSuffix;
    if (value.length > 0) {
        inputSuffix = (
            <button
                type='button'
                className='style--none SettingsSearch__clear'
                onClick={() => onChange('')}
                aria-label={formatMessage({
                    id: 'user.settings.search.clear',
                    defaultMessage: 'Clear settings search',
                })}
            >
                <i className='icon icon-close-circle'/>
            </button>
        );
    }

    return (
        <div className='SettingsSearch'>
            <Input
                ref={ref}
                type='text'
                role='searchbox'
                data-testid='userSettingsSearchInput'
                value={value}
                onChange={(e) => onChange(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                inputPrefix={<i className='icon icon-magnify'/>}
                inputSuffix={inputSuffix}
                placeholder={formatMessage({
                    id: 'user.settings.search.placeholder',
                    defaultMessage: 'Search settings',
                })}
                aria-label={formatMessage({
                    id: 'user.settings.search.placeholder',
                    defaultMessage: 'Search settings',
                })}
                useLegend={false}
            />
        </div>
    );
});

SettingsSearch.displayName = 'SettingsSearch';

export default SettingsSearch;
