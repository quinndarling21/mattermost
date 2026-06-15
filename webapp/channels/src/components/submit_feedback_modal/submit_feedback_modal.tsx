// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {GenericModal} from '@mattermost/components';
import type {FeedbackType, SubmitFeedbackResponse} from '@mattermost/types/feedback';

import {Client4} from 'mattermost-redux/client';

import {closeModal} from 'actions/views/modals';

import RadioButtonGroup from 'components/common/radio_group';

import {ModalIdentifiers} from 'utils/constants';

import './submit_feedback_modal.scss';

const MAX_TITLE_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 10000;

export default function SubmitFeedbackModal() {
    const intl = useIntl();
    const dispatch = useDispatch();

    const [type, setType] = useState<FeedbackType>('feature');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [created, setCreated] = useState<SubmitFeedbackResponse | null>(null);

    // Synchronous guard so a rapid double-click cannot fire two requests
    // before the `submitting` state update re-renders the disabled button.
    const submittingRef = useRef(false);

    const handleClose = () => {
        dispatch(closeModal(ModalIdentifiers.SUBMIT_FEEDBACK));
    };

    const submitDisabled = submitting || title.trim() === '';

    const handleConfirm = async () => {
        if (submittingRef.current || title.trim() === '') {
            return;
        }

        submittingRef.current = true;
        setSubmitting(true);
        setError('');

        try {
            const response = await Client4.submitFeedback({
                type,
                title: title.trim(),
                description: description.trim(),
            });
            setCreated(response);
        } catch (err) {
            const serverMessage = (err as {message?: string})?.message;
            setError(serverMessage || intl.formatMessage({
                id: 'submit_feedback.error.generic',
                defaultMessage: 'Something went wrong while submitting your feedback. Please try again.',
            }));
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    };

    if (created) {
        return (
            <GenericModal
                compassDesign={true}
                className='SubmitFeedbackModal'
                onExited={handleClose}
                handleConfirm={handleClose}
                confirmButtonText={intl.formatMessage({id: 'submit_feedback.success.done', defaultMessage: 'Done'})}
                modalHeaderText={intl.formatMessage({id: 'submit_feedback.success.title', defaultMessage: 'Thanks for your feedback!'})}
            >
                <div className='SubmitFeedbackModal__success'>
                    <i className='icon icon-check-circle-outline SubmitFeedbackModal__successIcon'/>
                    <p>
                        {intl.formatMessage(
                            {
                                id: 'submit_feedback.success.body',
                                defaultMessage: 'Your {type} has been filed as {identifier}.',
                            },
                            {
                                type: type === 'bug' ? intl.formatMessage({id: 'submit_feedback.type.bug', defaultMessage: 'bug report'}) : intl.formatMessage({id: 'submit_feedback.type.feature', defaultMessage: 'feature request'}),
                                identifier: <strong>{created.identifier}</strong>,
                            },
                        )}
                    </p>
                    {created.url && (
                        <a
                            href={created.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='SubmitFeedbackModal__link'
                        >
                            {intl.formatMessage({id: 'submit_feedback.success.view', defaultMessage: 'View in Linear'})}
                        </a>
                    )}
                </div>
            </GenericModal>
        );
    }

    return (
        <GenericModal
            compassDesign={true}
            className='SubmitFeedbackModal'
            onExited={handleClose}
            handleCancel={handleClose}
            handleConfirm={handleConfirm}
            isConfirmDisabled={submitDisabled}
            autoCloseOnConfirmButton={false}
            errorText={error}
            confirmButtonText={submitting ? intl.formatMessage({id: 'submit_feedback.submitting', defaultMessage: 'Submitting…'}) : intl.formatMessage({id: 'submit_feedback.submit', defaultMessage: 'Submit'})}
            cancelButtonText={intl.formatMessage({id: 'submit_feedback.cancel', defaultMessage: 'Cancel'})}
            modalHeaderText={intl.formatMessage({id: 'submit_feedback.title', defaultMessage: 'Submit feedback'})}
            modalSubheaderText={intl.formatMessage({id: 'submit_feedback.subtitle', defaultMessage: 'File a feature request or report a bug. It will be sent straight to our team.'})}
        >
            <div className='SubmitFeedbackModal__field'>
                <label className='SubmitFeedbackModal__label'>
                    {intl.formatMessage({id: 'submit_feedback.type.label', defaultMessage: 'What would you like to submit?'})}
                </label>
                <RadioButtonGroup
                    id='SubmitFeedbackTypeGroup'
                    testId='SubmitFeedbackTypeGroup'
                    values={[
                        {
                            value: 'feature',
                            key: intl.formatMessage({id: 'submit_feedback.type.feature.option', defaultMessage: '✨ Feature request'}),
                            testId: 'feature',
                        },
                        {
                            value: 'bug',
                            key: intl.formatMessage({id: 'submit_feedback.type.bug.option', defaultMessage: '🐛 Bug report'}),
                            testId: 'bug',
                        },
                    ]}
                    value={type}
                    onChange={(e) => setType(e.target.value as FeedbackType)}
                />
            </div>

            <div className='SubmitFeedbackModal__field'>
                <label
                    htmlFor='SubmitFeedbackTitle'
                    className='SubmitFeedbackModal__label'
                >
                    {intl.formatMessage({id: 'submit_feedback.titleField.label', defaultMessage: 'Title'})}
                </label>
                <input
                    id='SubmitFeedbackTitle'
                    data-testid='SubmitFeedbackTitle'
                    type='text'
                    className='SubmitFeedbackModal__input'
                    placeholder={intl.formatMessage({id: 'submit_feedback.titleField.placeholder', defaultMessage: 'Give it a short, descriptive title'})}
                    value={title}
                    maxLength={MAX_TITLE_LENGTH}
                    autoFocus={true}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div className='SubmitFeedbackModal__field'>
                <label
                    htmlFor='SubmitFeedbackDescription'
                    className='SubmitFeedbackModal__label'
                >
                    {intl.formatMessage({id: 'submit_feedback.descriptionField.label', defaultMessage: 'Details'})}
                </label>
                <textarea
                    id='SubmitFeedbackDescription'
                    data-testid='SubmitFeedbackDescription'
                    className='SubmitFeedbackModal__textarea'
                    placeholder={intl.formatMessage({id: 'submit_feedback.descriptionField.placeholder', defaultMessage: 'Add any details that would help us understand your request (optional)'})}
                    rows={5}
                    value={description}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
        </GenericModal>
    );
}
