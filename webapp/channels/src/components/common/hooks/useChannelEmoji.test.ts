// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {PropertyField} from '@mattermost/types/properties';

import {Client4} from 'mattermost-redux/client';
import {
    ChannelEmojiPropertyFieldName,
    ChannelEmojiPropertyGroupName,
    ChannelEmojiPropertyObjectType,
    ChannelEmojiPropertyTargetType,
} from 'mattermost-redux/constants/channel_emojis';

import {act, renderHookWithContext} from 'tests/react_testing_utils';

import useChannelEmoji from './useChannelEmoji';

const CHANNEL_ID = 'channel_id';
const FIELD_ID = 'field_id';

function makeField(overrides: Partial<PropertyField> = {}): PropertyField {
    return {
        id: FIELD_ID,
        group_id: ChannelEmojiPropertyGroupName,
        name: ChannelEmojiPropertyFieldName,
        type: 'text',
        attrs: {},
        target_id: '',
        target_type: ChannelEmojiPropertyTargetType,
        object_type: ChannelEmojiPropertyObjectType,
        create_at: 1000,
        update_at: 1000,
        delete_at: 0,
        created_by: 'user_id',
        updated_by: 'user_id',
        ...overrides,
    };
}

function stateWithField(field = makeField()) {
    return {
        entities: {
            properties: {
                fields: {
                    byObjectType: {},
                    byId: {
                        [field.id]: field,
                    },
                },
                values: {
                    byTargetId: {},
                    byFieldId: {},
                },
            },
        },
    };
}

function stateWithoutField() {
    return {
        entities: {
            properties: {
                fields: {
                    byObjectType: {},
                    byId: {},
                },
                values: {
                    byTargetId: {},
                    byFieldId: {},
                },
            },
        },
    };
}

describe('useChannelEmoji', () => {
    beforeEach(() => {
        jest.spyOn(Client4, 'getPropertyValues').mockResolvedValue([]);
        jest.spyOn(Client4, 'getPropertyFields').mockResolvedValue([]);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('does not refetch empty channel emoji values after they have been loaded once', async () => {
        const fetchValues = jest.spyOn(Client4, 'getPropertyValues').mockResolvedValue([]);

        const first = renderHookWithContext(
            () => useChannelEmoji(CHANNEL_ID),
            stateWithField(),
        );
        await Promise.resolve();
        first.unmount();

        renderHookWithContext(
            () => useChannelEmoji(CHANNEL_ID),
            stateWithField(),
        );
        await Promise.resolve();

        expect(fetchValues).toHaveBeenCalledTimes(1);
    });

    test('allows property field fetch to retry after a failed request', async () => {
        const fetchFields = jest.spyOn(Client4, 'getPropertyFields');
        fetchFields.mockRejectedValueOnce(new Error('server error')).mockResolvedValueOnce([makeField()]);

        const first = renderHookWithContext(
            () => useChannelEmoji('channel_with_missing_field'),
            stateWithoutField(),
        );
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });
        first.unmount();

        renderHookWithContext(
            () => useChannelEmoji('channel_with_missing_field'),
            stateWithoutField(),
        );
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(fetchFields).toHaveBeenCalledTimes(3);
    });
});
