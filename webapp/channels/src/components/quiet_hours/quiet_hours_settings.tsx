// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {Button} from '@mattermost/shared/components/button';

import {saveQuietHoursSchedule} from 'actions/views/quiet_hours';
import {isUseMilitaryTime} from 'selectors/preferences';
import {getQuietHoursSchedule} from 'selectors/quiet_hours';

import {formatMinutesToTime, formatScheduleSummary, parseTimeToMinutes} from 'utils/quiet_hours';

import {DEFAULT_QUIET_HOURS_SCHEDULE} from 'types/quiet_hours';
import type {QuietHoursSchedule} from 'types/quiet_hours';
import type {DispatchFunc} from 'types/store';

import './quiet_hours.scss';

const DAY_OPTIONS = [
    {index: 0, label: 'Sun'},
    {index: 1, label: 'Mon'},
    {index: 2, label: 'Tue'},
    {index: 3, label: 'Wed'},
    {index: 4, label: 'Thu'},
    {index: 5, label: 'Fri'},
    {index: 6, label: 'Sat'},
];

const QuietHoursSettings = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch<DispatchFunc>();

    const savedSchedule = useSelector(getQuietHoursSchedule);
    const militaryTime = useSelector(isUseMilitaryTime);

    const [schedule, setSchedule] = useState<QuietHoursSchedule>(savedSchedule);
    const [saving, setSaving] = useState(false);

    const handleToggleEnabled = useCallback(() => {
        setSchedule((prev) => ({...prev, enabled: !prev.enabled}));
    }, []);

    const handleStartChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const minutes = parseTimeToMinutes(e.target.value);
        setSchedule((prev) => ({...prev, startMinutes: minutes || DEFAULT_QUIET_HOURS_SCHEDULE.startMinutes}));
    }, []);

    const handleEndChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const minutes = parseTimeToMinutes(e.target.value);
        setSchedule((prev) => ({...prev, endMinutes: minutes}));
    }, []);

    const handleDayToggle = useCallback((index: number) => {
        setSchedule((prev) => {
            const days = prev.days;
            days[index] = !days[index];
            return {...prev, days};
        });
    }, []);

    const handleAllowUrgentToggle = useCallback(() => {
        setSchedule((prev) => ({...prev, allowUrgent: !prev.allowUrgent}));
    }, []);

    const handleAutoReplyChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSchedule((prev) => ({...prev, autoReplyMessage: e.target.value}));
    }, []);

    const handleSave = useCallback(async () => {
        setSaving(true);
        await dispatch(saveQuietHoursSchedule(schedule));
        setSaving(false);
    }, [dispatch, schedule]);

    return (
        <div className='QuietHoursSettings'>
            <div className='QuietHoursSettings__header'>
                <h4>
                    <FormattedMessage
                        id='quiet_hours.settings.title'
                        defaultMessage='Quiet hours'
                    />
                </h4>
                <label className='QuietHoursSettings__toggle'>
                    <input
                        type='checkbox'
                        checked={schedule.enabled}
                        onChange={handleToggleEnabled}
                    />
                    <FormattedMessage
                        id='quiet_hours.settings.enable'
                        defaultMessage='Mute notifications during quiet hours'
                    />
                </label>
            </div>

            <fieldset
                className='QuietHoursSettings__body'
                disabled={!schedule.enabled}
            >
                <div className='QuietHoursSettings__times'>
                    <label>
                        <FormattedMessage
                            id='quiet_hours.settings.from'
                            defaultMessage='From'
                        />
                        <input
                            type='time'
                            value={formatMinutesToTime(schedule.startMinutes, true)}
                            onChange={handleStartChange}
                        />
                    </label>
                    <label>
                        <FormattedMessage
                            id='quiet_hours.settings.to'
                            defaultMessage='To'
                        />
                        <input
                            type='time'
                            value={formatMinutesToTime(schedule.endMinutes, true)}
                            onChange={handleEndChange}
                        />
                    </label>
                </div>

                <div className='QuietHoursSettings__days'>
                    {DAY_OPTIONS.map((day) => (
                        <button
                            key={day.index}
                            type='button'
                            className={schedule.days[day.index] ? 'QuietHoursSettings__day QuietHoursSettings__day--on' : 'QuietHoursSettings__day'}
                            aria-pressed={schedule.days[day.index]}
                            onClick={() => handleDayToggle(day.index)}
                        >
                            {day.label}
                        </button>
                    ))}
                </div>

                <label className='QuietHoursSettings__toggle'>
                    <input
                        type='checkbox'
                        checked={schedule.allowUrgent}
                        onChange={handleAllowUrgentToggle}
                    />
                    <FormattedMessage
                        id='quiet_hours.settings.allow_urgent'
                        defaultMessage='Always let urgent messages through'
                    />
                </label>

                <label className='QuietHoursSettings__auto_reply'>
                    <FormattedMessage
                        id='quiet_hours.settings.auto_reply'
                        defaultMessage='Auto-reply message'
                    />
                    <textarea
                        value={schedule.autoReplyMessage}
                        placeholder={formatMessage({
                            id: 'quiet_hours.settings.auto_reply_placeholder',
                            defaultMessage: 'I have notifications muted right now and will reply later.',
                        })}
                        onChange={handleAutoReplyChange}
                    />
                </label>

                {schedule.autoReplyMessage !== '' && (
                    <div className='QuietHoursSettings__preview'>
                        <span className='QuietHoursSettings__preview_label'>
                            <FormattedMessage
                                id='quiet_hours.settings.preview'
                                defaultMessage='Preview'
                            />
                        </span>
                        <div
                            className='QuietHoursSettings__preview_body'
                            dangerouslySetInnerHTML={{__html: schedule.autoReplyMessage}}
                        />
                    </div>
                )}

                <p className='QuietHoursSettings__summary'>
                    <FormattedMessage
                        id='quiet_hours.settings.summary'
                        defaultMessage='Notifications will be muted {window} on the selected days.'
                        values={{window: formatScheduleSummary(schedule, militaryTime)}}
                    />
                </p>
            </fieldset>

            <div className='QuietHoursSettings__actions'>
                <Button
                    emphasis='primary'
                    size='sm'
                    onClick={handleSave}
                    disabled={saving}
                >
                    <FormattedMessage
                        id='quiet_hours.settings.save'
                        defaultMessage='Save'
                    />
                </Button>
            </div>
        </div>
    );
};

export default QuietHoursSettings;
