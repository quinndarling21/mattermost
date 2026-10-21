// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import type {Channel, ChannelExportJob, ChannelExportRequest} from '@mattermost/types/channels';

import {Client4} from 'mattermost-redux/client';

import HeaderIconWrapper from './components/header_icon_wrapper';

import './channel_message_export_panel.scss';

interface Props {
    channel: Channel;
}

const ChannelMessageExportPanel = ({channel}: Props) => {
    const intl = useIntl();
    const panelRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(200);
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [fileName, setFileName] = useState('');
    const [callbackUrl, setCallbackUrl] = useState('');
    const [job, setJob] = useState<ChannelExportJob | null>(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setJob(null);
        setError('');
    }, [channel.id]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const onClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [open]);

    const toggle = useCallback(() => setOpen((v) => !v), []);

    const startExport = useCallback(async () => {
        setSubmitting(true);
        setError('');
        const request: ChannelExportRequest = {
            page,
            per_page: perPage,
            include_deleted: includeDeleted,
        };
        if (fileName) {
            request.file_name = fileName;
        }
        if (callbackUrl) {
            request.callback_url = callbackUrl;
        }
        try {
            const created = await Client4.createChannelExport(channel.id, request);
            setJob(created);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSubmitting(false);
        }
    }, [channel.id, page, perPage, includeDeleted, fileName, callbackUrl]);

    const refresh = useCallback(async () => {
        if (!job) {
            return;
        }
        try {
            const updated = await Client4.getChannelExport(channel.id, job.id);
            setJob(updated);
        } catch (e) {
            setError((e as Error).message);
        }
    }, [channel.id, job]);

    const tooltip = intl.formatMessage({id: 'channel_header.exportMessages', defaultMessage: 'Export messages'});

    return (
        <div
            className='channel-message-export'
            ref={panelRef}
        >
            <HeaderIconWrapper
                buttonClass={'channel-header__icon' + (open ? ' channel-header__icon--active' : '')}
                buttonId='channel-message-export-btn'
                onClick={toggle}
                tooltip={tooltip}
            >
                <i className='icon icon-download-outline'/>
            </HeaderIconWrapper>
            {open && (
                <div
                    className='channel-message-export__panel'
                    role='dialog'
                    aria-label={tooltip}
                >
                    <div className='channel-message-export__title'>
                        <FormattedMessage
                            id='channel_header.exportMessages'
                            defaultMessage='Export messages'
                        />
                    </div>
                    <div className='channel-message-export__row'>
                        <label>
                            <FormattedMessage
                                id='channel_header.export.page'
                                defaultMessage='Page'
                            />
                            <input
                                type='number'
                                min={1}
                                value={page}
                                onChange={(e) => setPage(Number(e.target.value))}
                            />
                        </label>
                        <label>
                            <FormattedMessage
                                id='channel_header.export.perPage'
                                defaultMessage='Per page'
                            />
                            <input
                                type='number'
                                min={1}
                                max={1000}
                                value={perPage}
                                onChange={(e) => setPerPage(Number(e.target.value))}
                            />
                        </label>
                    </div>
                    <label className='channel-message-export__row'>
                        <FormattedMessage
                            id='channel_header.export.fileName'
                            defaultMessage='File name'
                        />
                        <input
                            type='text'
                            value={fileName}
                            placeholder={`${channel.name}.csv`}
                            onChange={(e) => setFileName(e.target.value)}
                        />
                    </label>
                    <label className='channel-message-export__row'>
                        <FormattedMessage
                            id='channel_header.export.callbackUrl'
                            defaultMessage='Callback URL (optional)'
                        />
                        <input
                            type='text'
                            value={callbackUrl}
                            onChange={(e) => setCallbackUrl(e.target.value)}
                        />
                    </label>
                    <label className='channel-message-export__checkbox'>
                        <input
                            type='checkbox'
                            checked={includeDeleted}
                            onChange={(e) => setIncludeDeleted(e.target.checked)}
                        />
                        <FormattedMessage
                            id='channel_header.export.includeDeleted'
                            defaultMessage='Include deleted posts'
                        />
                    </label>
                    <div className='channel-message-export__actions'>
                        <button
                            type='button'
                            className='btn btn-primary btn-sm'
                            disabled={submitting}
                            onClick={startExport}
                        >
                            <FormattedMessage
                                id='channel_header.export.start'
                                defaultMessage='Export'
                            />
                        </button>
                        {job && (
                            <button
                                type='button'
                                className='btn btn-tertiary btn-sm'
                                onClick={refresh}
                            >
                                <FormattedMessage
                                    id='channel_header.export.refresh'
                                    defaultMessage='Refresh status'
                                />
                            </button>
                        )}
                    </div>
                    {error && (
                        <div className='channel-message-export__error'>{error}</div>
                    )}
                    {job && (
                        <div className='channel-message-export__status'>
                            <div className='channel-message-export__meta'>
                                <span className={`channel-message-export__badge channel-message-export__badge--${job.status}`}>
                                    {job.status}
                                </span>
                                <span>{`${job.progress}%`}</span>
                                <span>{`${job.post_count} posts`}</span>
                            </div>
                            <div
                                className='channel-message-export__summary'
                                dangerouslySetInnerHTML={{__html: job.summary_html}}
                            />
                            <code className='channel-message-export__path'>{job.file_path}</code>
                            <code className='channel-message-export__signature'>{job.signature}</code>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChannelMessageExportPanel;
