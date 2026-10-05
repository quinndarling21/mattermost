// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Client4} from 'mattermost-redux/client';
import {Preferences} from 'mattermost-redux/constants';
import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';

import {renderWithContext} from 'tests/react_testing_utils';

import {removeChannelEmoji, saveChannelEmoji} from './actions';

describe('channel emoji actions', () => {
    const preferenceKey = getPreferenceKey(Preferences.CATEGORY_CHANNEL_EMOJI, 'channel_id');
    const existing = {
        user_id: 'user_id',
        category: Preferences.CATEGORY_CHANNEL_EMOJI,
        name: 'channel_id',
        value: 'wave',
    };

    const initialState = {
        entities: {
            users: {
                currentUserId: 'user_id',
            },
            preferences: {
                myPreferences: {
                    [preferenceKey]: existing,
                },
            },
        },
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('saves the emoji immediately and keeps it when the server accepts it', async () => {
        jest.spyOn(Client4, 'savePreferences').mockResolvedValue({status: 'OK'});
        const {store} = renderWithContext(<div/>, {
            entities: {users: {currentUserId: 'user_id'}},
        });

        const result = await store.dispatch(saveChannelEmoji('channel_id', 'smile'));

        expect(result.data).toBe(true);
        expect(Client4.savePreferences).toHaveBeenCalledWith('user_id', [
            expect.objectContaining({
                category: Preferences.CATEGORY_CHANNEL_EMOJI,
                name: 'channel_id',
                value: 'smile',
            }),
        ]);
        expect(store.getState().entities.preferences.myPreferences[preferenceKey].value).toBe('smile');
        expect(store.getState().errors).toHaveLength(0);
    });

    test('restores the previous emoji and shows an error when saving fails', async () => {
        jest.spyOn(Client4, 'savePreferences').mockRejectedValue({message: 'network', server_error_id: 'api.context.timeout'});
        const {store} = renderWithContext(<div/>, initialState);

        const result = await store.dispatch(saveChannelEmoji('channel_id', 'smile'));

        expect(result.error).toBeTruthy();
        expect(store.getState().entities.preferences.myPreferences[preferenceKey].value).toBe('wave');
        expect(store.getState().errors).toEqual([
            expect.objectContaining({
                displayable: true,
                error: expect.objectContaining({
                    message: 'sidebar_left.sidebar_channel_menu.saveChannelEmojiError',
                }),
            }),
        ]);
    });

    test('removes a new emoji when the first save fails', async () => {
        jest.spyOn(Client4, 'savePreferences').mockRejectedValue(new Error('offline'));
        const {store} = renderWithContext(<div/>, {
            entities: {users: {currentUserId: 'user_id'}},
        });

        await store.dispatch(saveChannelEmoji('channel_id', 'smile'));

        expect(store.getState().entities.preferences.myPreferences[preferenceKey]).toBeUndefined();
        expect(store.getState().errors[0].displayable).toBe(true);
    });

    test('removes the emoji and restores it when deletion fails', async () => {
        jest.spyOn(Client4, 'deletePreferences').mockRejectedValue(new Error('offline'));
        const {store} = renderWithContext(<div/>, initialState);

        const result = await store.dispatch(removeChannelEmoji('channel_id'));

        expect(result.error).toBeTruthy();
        expect(store.getState().entities.preferences.myPreferences[preferenceKey].value).toBe('wave');
        expect(store.getState().errors[0].error.message).toBe('sidebar_left.sidebar_channel_menu.removeChannelEmojiError');
    });

    test('deletes the preference when removal succeeds', async () => {
        jest.spyOn(Client4, 'deletePreferences').mockResolvedValue({status: 'OK'});
        const {store} = renderWithContext(<div/>, initialState);

        const result = await store.dispatch(removeChannelEmoji('channel_id'));

        expect(result.data).toBe(true);
        expect(Client4.deletePreferences).toHaveBeenCalledWith('user_id', [existing]);
        expect(store.getState().entities.preferences.myPreferences[preferenceKey]).toBeUndefined();
    });
});
