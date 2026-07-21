// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';

import './filter_chip.scss';

export type FilterChipProps = {
    label: string;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
};

export default function FilterChip({
    label,
    selected = false,
    onClick,
    className,
}: FilterChipProps) {
    return (
        <button
            type='button'
            className={classNames('FilterChip', {selected}, className)}
            aria-pressed={selected}
            onClick={onClick}
        >
            <span className='FilterChip__label'>{label}</span>
        </button>
    );
}
