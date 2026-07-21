// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';

import {Button} from '@mattermost/shared/components/button';

import './filter_chip.scss';

type Props = {
    label: React.ReactNode;
    onClick: () => void;
    selected: boolean;
};

export default function FilterChip({label, onClick, selected}: Props) {
    return (
        <Button
            type='button'
            className={classNames('FilterChip', {selected})}
            emphasis='quaternary'
            size='xs'
            aria-pressed={selected}
            onClick={onClick}
        >
            {label}
        </Button>
    );
}
