// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {SubmitFeedbackResponse} from '@mattermost/types/feedback';

import {Client4} from 'mattermost-redux/client';

import SubmitFeedbackModal from 'components/submit_feedback_modal/submit_feedback_modal';

import {act, fireEvent, renderWithContext, screen, userEvent, waitFor} from 'tests/react_testing_utils';

jest.mock('react-bootstrap', () => {
    const Modal = ({children, show}: {children: React.ReactNode; show?: boolean}) => ((show ?? true) ? <div>{children}</div> : null);
    Modal.Header = ({children}: {children: React.ReactNode}) => <div>{children}</div>;
    Modal.Body = ({children}: {children: React.ReactNode}) => <div>{children}</div>;
    Modal.Footer = ({children}: {children: React.ReactNode}) => <div>{children}</div>;
    Modal.Title = ({children}: {children: React.ReactNode}) => <div>{children}</div>;
    return {Modal};
});

describe('components/SubmitFeedbackModal', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should render the feedback form', () => {
        renderWithContext(<SubmitFeedbackModal/>);

        expect(screen.getByTestId('SubmitFeedbackTitle')).toBeInTheDocument();
        expect(screen.getByTestId('SubmitFeedbackDescription')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Submit'})).toBeInTheDocument();
    });

    test('should not submit when the title is empty', async () => {
        const submitMock = jest.spyOn(Client4, 'submitFeedback').mockResolvedValue({} as SubmitFeedbackResponse);

        renderWithContext(<SubmitFeedbackModal/>);

        await userEvent.setup().click(screen.getByRole('button', {name: 'Submit'}));

        expect(submitMock).not.toHaveBeenCalled();
    });

    test('should only fire one request when confirm is clicked rapidly', async () => {
        // Keep the request pending so `submitting` stays true while we fire a
        // second synchronous click. The synchronous ref guard must prevent a
        // duplicate request even though the disabled state has not re-rendered.
        let resolveSubmit: (value: SubmitFeedbackResponse) => void = () => {};
        const submitMock = jest.spyOn(Client4, 'submitFeedback').mockImplementation(() => new Promise<SubmitFeedbackResponse>((resolve) => {
            resolveSubmit = resolve;
        }));

        renderWithContext(<SubmitFeedbackModal/>);

        await userEvent.setup().type(screen.getByTestId('SubmitFeedbackTitle'), 'My feedback');

        const submitButton = screen.getByRole('button', {name: 'Submit'});

        // Fire two clicks within the same synchronous act() block, before React
        // flushes the `submitting` state update that disables the button.
        act(() => {
            fireEvent.click(submitButton);
            fireEvent.click(submitButton);
        });

        expect(submitMock).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveSubmit({identifier: 'MM-123', title: 'My feedback', url: 'https://linear.app/issue/MM-123'});
        });
    });

    test('should show the success view after a successful submission', async () => {
        jest.spyOn(Client4, 'submitFeedback').mockResolvedValue({
            identifier: 'MM-123',
            title: 'My feedback',
            url: 'https://linear.app/issue/MM-123',
        });

        renderWithContext(<SubmitFeedbackModal/>);

        const user = userEvent.setup();
        await user.type(screen.getByTestId('SubmitFeedbackTitle'), 'My feedback');
        await user.click(screen.getByRole('button', {name: 'Submit'}));

        await waitFor(() => {
            expect(screen.getByText('MM-123')).toBeInTheDocument();
        });
    });
});
