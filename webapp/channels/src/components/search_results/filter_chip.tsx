// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';

import './filter_chip.scss';

type Props = {
    label: React.ReactNode;
    selected?: boolean;
    onClick?: () => void;
    'aria-pressed'?: boolean;
    className?: string;
};

const FilterChip = ({label, selected = false, onClick, className, ...rest}: Props) => {
    return (
        <button
            type='button'
            className={classNames('FilterChip', {'FilterChip--selected': selected}, className)}
            onClick={onClick}
            aria-pressed={rest['aria-pressed'] ?? selected}
        >
            <span className='FilterChip__label'>{label}</span>
        </button>
    );
};

export default FilterChip;
