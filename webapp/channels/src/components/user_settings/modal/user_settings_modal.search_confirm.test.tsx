// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {fireEvent, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ComponentProps} from 'react';
import React from 'react';

jest.mock('@mattermost/shared/context', () => ({
    SharedProvider: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('components/user_settings', () => ({
    __esModule: true,
    default: (props: {
        activeTab?: string;
        activeSection: string;
        setRequireConfirm: (requireConfirm?: boolean) => void;
    }) => (
        <div>
            <button
                type='button'
                data-testid='mark-dirty'
                onClick={() => props.setRequireConfirm(true)}
            />
            <div data-testid='active-tab'>{props.activeTab}</div>
            <div data-testid='active-section'>{props.activeSection}</div>
        </div>
    ),
}));

import type {DeepPartial} from '@mattermost/types/utilities';

import {renderWithContext} from 'tests/react_testing_utils';
import {TestHelper} from 'utils/test_helper';

import type {GlobalState} from 'types/store';

import UserSettingsModal from './index';

type Props = ComponentProps<typeof UserSettingsModal>;

const baseProps: Props = {
    isContentProductSettings: true,
    onExited: jest.fn(),
};

const baseState: DeepPartial<GlobalState> = {
    entities: {
        users: {
            currentUserId: 'id',
            profiles: {
                id: TestHelper.getUserMock({id: 'id', locale: 'en'}),
            },
        },
    },
};

describe('settings search unsaved-change confirmation', () => {
    it('keeps the current tab and query when discard is cancelled', async () => {
        renderWithContext(<UserSettingsModal {...baseProps}/>, baseState);

        await userEvent.click(await screen.findByTestId('mark-dirty'));
        fireEvent.change(screen.getByPlaceholderText('Find settings'), {target: {value: 'dark mode'}});

        expect(await screen.findByText('Discard Changes?')).toBeInTheDocument();
        expect(document.getElementById('confirmModal')).toHaveClass('in');
        fireEvent.click(screen.getByTestId('cancel-button'));

        expect(document.getElementById('confirmModal')).not.toHaveClass('in');
        expect(screen.getByTestId('active-tab')).toHaveTextContent('notifications');
        expect(screen.getByTestId('active-section')).toHaveTextContent('');
        expect(screen.getByPlaceholderText('Find settings')).toHaveValue('dark mode');
        expect(screen.getByRole('option', {name: 'Theme', hidden: true})).toBeInTheDocument();
    });

    it('routes to the matching setting after discard is confirmed', async () => {
        renderWithContext(<UserSettingsModal {...baseProps}/>, baseState);

        await userEvent.click(await screen.findByTestId('mark-dirty'));
        fireEvent.change(screen.getByPlaceholderText('Find settings'), {target: {value: 'dark mode'}});

        expect(await screen.findByText('Discard Changes?')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', {name: 'Yes, Discard'}));

        expect(screen.getByTestId('active-tab')).toHaveTextContent('display');
        expect(screen.getByTestId('active-section')).toHaveTextContent('theme');
        expect(screen.getByPlaceholderText('Find settings')).toHaveValue('dark mode');
    });
});
