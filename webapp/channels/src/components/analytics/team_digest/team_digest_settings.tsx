// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import type {TeamDigestPreview, TeamDigestSettings} from '@mattermost/types/teams';

import {Client4} from 'mattermost-redux/client';

import SaveButton from 'components/save_button';

import TeamDigestPreviewPanel from './team_digest_preview';

import './team_digest_preview.scss';

type Props = {
    teamId: string;
};

export default function TeamDigestSettingsPanel({teamId}: Props) {
    const intl = useIntl();
    const [settings, setSettings] = useState<TeamDigestSettings>({
        enabled: false,
        webhook_url: '',
        header_html: '',
        include_posts: true,
        include_replies: true,
        cadence: 'weekly',
    });
    const [preview, setPreview] = useState<TeamDigestPreview | null>(null);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const loadSettings = useCallback(async () => {
        const data = await Client4.getTeamDigestSettings(teamId);
        setSettings(data);
        setLoaded(true);
    }, [teamId]);

    const loadPreview = useCallback(async (filter: string) => {
        const data = await Client4.getTeamDigestPreview(teamId, filter);
        setPreview(data);
    }, [teamId]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    useEffect(() => {
        if (loaded) {
            loadPreview(search);
        }
    }, [loaded, loadPreview, search]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const saved = await Client4.saveTeamDigestSettings(teamId, settings);
            setSettings(saved);
            await loadPreview(search);
        } finally {
            setSaving(false);
        }
    };

    const handleTestWebhook = async () => {
        setTesting(true);
        try {
            await Client4.testTeamDigestWebhook(teamId, settings.webhook_url);
        } finally {
            setTesting(false);
        }
    };

    if (!loaded) {
        return null;
    }

    return (
        <div className='team-digest-settings'>
            <div className='team-digest-settings__title'>
                <FormattedMessage
                    id='team_digest.settings.title'
                    defaultMessage='Activity digest'
                />
            </div>
            <div className='team-digest-settings__row form-group'>
                <label>
                    <input
                        type='checkbox'
                        checked={settings.enabled}
                        onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
                    />
                    {' '}
                    <FormattedMessage
                        id='team_digest.settings.enabled'
                        defaultMessage='Send periodic activity digests to an external webhook'
                    />
                </label>
            </div>
            <div className='team-digest-settings__row form-group'>
                <label htmlFor='team_digest_webhook_url'>
                    <FormattedMessage
                        id='team_digest.settings.webhook_url'
                        defaultMessage='Webhook URL'
                    />
                </label>
                <input
                    id='team_digest_webhook_url'
                    type='text'
                    className='form-control'
                    value={settings.webhook_url}
                    onChange={(e) => setSettings({...settings, webhook_url: e.target.value})}
                />
            </div>
            <div className='team-digest-settings__row form-group'>
                <label htmlFor='team_digest_header_html'>
                    <FormattedMessage
                        id='team_digest.settings.header_html'
                        defaultMessage='Digest header'
                    />
                </label>
                <textarea
                    id='team_digest_header_html'
                    className='form-control'
                    rows={3}
                    value={settings.header_html}
                    onChange={(e) => setSettings({...settings, header_html: e.target.value})}
                    placeholder={intl.formatMessage({
                        id: 'team_digest.settings.header_html.placeholder',
                        defaultMessage: 'Optional HTML shown at the top of the digest preview',
                    })}
                />
            </div>
            <div className='team-digest-settings__row form-group'>
                <label htmlFor='team_digest_search'>
                    <FormattedMessage
                        id='team_digest.settings.member_filter'
                        defaultMessage='Filter members in preview'
                    />
                </label>
                <input
                    id='team_digest_search'
                    type='text'
                    className='form-control'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className='team-digest-settings__row form-group'>
                <label htmlFor='team_digest_cadence'>
                    <FormattedMessage
                        id='team_digest.settings.cadence'
                        defaultMessage='Delivery cadence'
                    />
                </label>
                <select
                    id='team_digest_cadence'
                    className='form-control'
                    value={settings.cadence}
                    onChange={(e) => setSettings({...settings, cadence: e.target.value})}
                >
                    <option value='daily'>
                        {intl.formatMessage({id: 'team_digest.settings.cadence.daily', defaultMessage: 'Daily'})}
                    </option>
                    <option value='weekly'>
                        {intl.formatMessage({id: 'team_digest.settings.cadence.weekly', defaultMessage: 'Weekly'})}
                    </option>
                </select>
            </div>
            <div className='team-digest-settings__actions'>
                <SaveButton
                    saving={saving}
                    disabled={saving}
                    onClick={handleSave}
                />
                <button
                    type='button'
                    className='btn btn-tertiary'
                    disabled={testing || !settings.webhook_url}
                    onClick={handleTestWebhook}
                >
                    <FormattedMessage
                        id='team_digest.settings.test_webhook'
                        defaultMessage='Test webhook'
                    />
                </button>
            </div>
            {preview && (
                <TeamDigestPreviewPanel preview={preview}/>
            )}
        </div>
    );
}
