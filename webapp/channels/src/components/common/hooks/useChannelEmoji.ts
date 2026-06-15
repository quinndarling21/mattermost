// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import type {PropertyField} from '@mattermost/types/properties';
import type {GlobalState} from '@mattermost/types/store';

import {PropertyTypes} from 'mattermost-redux/action_types';
import {fetchPropertyFields} from 'mattermost-redux/actions/properties';
import {Client4} from 'mattermost-redux/client';
import {
    ChannelEmojiPropertyFieldName,
    ChannelEmojiPropertyGroupName,
    ChannelEmojiPropertyObjectType,
    ChannelEmojiPropertyTargetType,
} from 'mattermost-redux/constants/channel_emojis';
import {getPropertyValueForTargetField} from 'mattermost-redux/selectors/entities/properties';

import {EmojiIndicesByAlias, Emojis} from 'utils/emoji';
import {trimmedEmojiName, unifiedToUnicode} from 'utils/emoji_utils';

let channelEmojiFieldFetchRequested = false;

export function normalizeChannelEmoji(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
        return '';
    }

    if ((/^[\w+-]+$/).test(trimmed)) {
        return `:${trimmed}:`;
    }

    return trimmed;
}

export function formatChannelEmojiForDisplay(value: string): string {
    const normalized = normalizeChannelEmoji(value);
    if (!normalized) {
        return '';
    }

    const emojiName = trimmedEmojiName(normalized);
    const emojiIndex = EmojiIndicesByAlias.get(emojiName);
    if (emojiIndex === undefined) {
        return normalized;
    }

    return unifiedToUnicode(Emojis[emojiIndex].unified);
}

function selectChannelEmojiField(state: GlobalState): PropertyField | undefined {
    const byId = state.entities.properties?.fields?.byId;
    if (!byId) {
        return undefined;
    }

    return Object.values(byId).find((field) => (
        field.object_type === ChannelEmojiPropertyObjectType &&
        field.name === ChannelEmojiPropertyFieldName &&
        field.delete_at === 0
    ));
}

export type ChannelEmojiState = {
    field: PropertyField | null;
    emoji: string;
    loading: boolean;
};

export default function useChannelEmoji(channelId: string): ChannelEmojiState {
    const dispatch = useDispatch();
    const field = useSelector(selectChannelEmojiField) ?? null;
    const fieldId = field?.id ?? '';
    const propertyValue = useSelector((state: GlobalState) => {
        if (!fieldId || !channelId) {
            return undefined;
        }

        return getPropertyValueForTargetField(state, channelId, fieldId);
    });

    useEffect(() => {
        if (field || channelEmojiFieldFetchRequested) {
            return;
        }

        channelEmojiFieldFetchRequested = true;
        dispatch(fetchPropertyFields(
            ChannelEmojiPropertyGroupName,
            ChannelEmojiPropertyObjectType,
            ChannelEmojiPropertyTargetType,
        ));
    }, [dispatch, field]);

    useEffect(() => {
        if (!field || !channelId || propertyValue) {
            return;
        }

        Client4.getPropertyValues<string>(
            ChannelEmojiPropertyGroupName,
            ChannelEmojiPropertyObjectType,
            channelId,
        ).then((values) => {
            if (values && values.length > 0) {
                dispatch({
                    type: PropertyTypes.RECEIVED_PROPERTY_VALUES,
                    data: {values},
                });
            }
        }).catch(() => {
            // Silently ignore; most channels will not have an emoji configured.
        });
    }, [channelId, dispatch, field, propertyValue]);

    return useMemo((): ChannelEmojiState => {
        const emoji = typeof propertyValue?.value === 'string' ? propertyValue.value : '';

        return {
            field,
            emoji,
            loading: !field,
        };
    }, [field, propertyValue]);
}
