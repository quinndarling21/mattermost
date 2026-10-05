// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {isDesktopApp} from '@mattermost/shared/utils/user_agent';
import type {ChannelType} from '@mattermost/types/channels';
import type {SystemEmoji} from '@mattermost/types/emojis';
import type {DeepPartial} from '@mattermost/types/utilities';

import {Client4} from 'mattermost-redux/client';
import {Preferences} from 'mattermost-redux/constants';

import SidebarChannelLink from 'components/sidebar/sidebar_channel/sidebar_channel_link/sidebar_channel_link';

import mergeObjects from 'packages/mattermost-redux/test/merge_objects';
import {act, renderWithContext, screen, userEvent, waitFor} from 'tests/react_testing_utils';

import type {GlobalState} from 'types/store';

const isDesktopAppMock = jest.mocked(isDesktopApp);
jest.mock('@mattermost/shared/utils/user_agent', () => ({
    isDesktopApp: jest.fn(),
}));

const mockEmojiPicker = {
    options: null as null | {
        onEmojiClick: (emoji: SystemEmoji) => void;
        setShowEmojiPicker: (show: boolean) => void;
    },
};

jest.mock('components/emoji_picker/use_emoji_picker', () => {
    const React = require('react');
    return {
        __esModule: true,
        default: (options: NonNullable<typeof mockEmojiPicker.options>) => {
            mockEmojiPicker.options = options;
            return {
                emojiPicker: React.createElement('div', {'data-testid': 'emoji-picker'}),
                getReferenceProps: () => ({}),
                setReference: jest.fn(),
            };
        },
    };
});

describe('components/sidebar/sidebar_channel/sidebar_channel_link', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    const baseChannel = {
        id: 'channel_id',
        display_name: 'channel_display_name',
        create_at: 0,
        update_at: 0,
        delete_at: 0,
        team_id: '',
        type: 'O' as ChannelType,
        name: '',
        header: '',
        purpose: '',
        last_post_at: 0,
        last_root_post_at: 0,
        creator_id: '',
        scheme_id: '',
        group_constrained: false,
    };

    const baseProps = {
        channel: baseChannel,
        link: '/team/channels/town-square',
        label: 'channel_label',
        icon: null,
        unreadMentions: 0,
        isUnread: false,
        isMuted: false,
        isChannelSelected: false,
        hasUrgent: false,
        showChannelsTutorialStep: false,
        remoteNames: [] as string[],
        isSharedChannel: false,
        actions: {
            markMostRecentPostInChannelAsUnread: jest.fn(),
            multiSelectChannel: jest.fn(),
            multiSelectChannelAdd: jest.fn(),
            multiSelectChannelTo: jest.fn(),
            clearChannelSelection: jest.fn(),
            openLhs: jest.fn(),
            unsetEditingPost: jest.fn(),
            closeRightHandSide: jest.fn(),
            fetchChannelRemotes: jest.fn(),
        },
    };

    const renderLink = (props: Partial<typeof baseProps> = {}, initialState: DeepPartial<GlobalState> = {}) => {
        const merged = mergeObjects(baseProps, props);
        return renderWithContext(<SidebarChannelLink {...merged}/>, initialState);
    };

    test('should match snapshot', () => {
        const {container} = renderLink();

        expect(container).toMatchSnapshot();
    });

    test('should match snapshot for desktop', () => {
        isDesktopAppMock.mockImplementation(() => false);

        const {container} = renderLink();

        expect(container).toMatchSnapshot();
    });

    test('should match snapshot when tooltip is enabled', () => {
        const props = {
            label: 'a'.repeat(200),
        };

        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {configurable: true, value: 50});
        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {configurable: true, value: 200});

        const {container} = renderLink(props);

        expect(container).toMatchSnapshot();

        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {configurable: true, value: 0});
        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {configurable: true, value: 0});
    });

    test('should match snapshot with aria label prefix and unread mentions', () => {
        const props = {
            isUnread: true,
            unreadMentions: 2,
            ariaLabelPrefix: 'aria_label_prefix_',
        };

        const {container} = renderLink(props);

        expect(container).toMatchSnapshot();
    });

    test('should enable tooltip when needed', () => {
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {configurable: true, value: 50});
        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {configurable: true, value: 60});

        const {container} = renderLink();

        const label = container.querySelector('.SidebarChannelLinkLabel');
        expect(label).toBeInTheDocument();

        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {configurable: true, value: 0});
        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {configurable: true, value: 0});
    });

    test('should not fetch shared channels for non-shared channels', () => {
        const props = {
            isSharedChannel: false,
        };

        const {container} = renderLink(props);

        expect(container).toMatchSnapshot();
        expect(baseProps.actions.fetchChannelRemotes).not.toHaveBeenCalled();
    });

    test('should fetch shared channels data when channel is shared', () => {
        const props = {
            isSharedChannel: true,
            remoteNames: [],
        };

        const {container} = renderLink(props);

        expect(container).toMatchSnapshot();
        expect(baseProps.actions.fetchChannelRemotes).toHaveBeenCalledWith('channel_id');
    });

    test('should not fetch shared channels data when data already exists', () => {
        const props = {
            isSharedChannel: true,
            remoteNames: ['Remote 1', 'Remote 2'],
        };

        const {container} = renderLink(props);

        expect(container).toMatchSnapshot();
        expect(baseProps.actions.fetchChannelRemotes).not.toHaveBeenCalled();
    });

    test('should pass urgent tooltip to ChannelMentionBadge when hasUrgent is true', async () => {
        jest.useFakeTimers();

        renderLink({
            unreadMentions: 3,
            hasUrgent: true,
        });

        const badge = screen.getByText('3').closest('.badge')!;
        expect(badge).toHaveClass('urgent');

        await userEvent.hover(badge, {advanceTimers: jest.advanceTimersByTime});

        await waitFor(() => {
            expect(screen.getByText('You have an urgent mention')).toBeInTheDocument();
        });

        jest.useRealTimers();
    });

    test('should not show urgent mention tooltip when hasUrgent is false', async () => {
        jest.useFakeTimers();

        renderLink({
            unreadMentions: 3,
            hasUrgent: false,
        });

        const badge = screen.getByText('3').closest('.badge')!;
        expect(badge).not.toHaveClass('urgent');

        await userEvent.hover(badge, {advanceTimers: jest.advanceTimersByTime});

        expect(screen.queryByText('You have an urgent mention')).not.toBeInTheDocument();

        jest.useRealTimers();
    });

    test('should include urgent mention in link accessible name when hasUrgent', () => {
        renderLink({
            unreadMentions: 2,
            hasUrgent: true,
        });

        expect(screen.getByRole('link')).toHaveAccessibleName(/including an urgent mention/i);
    });

    test('should not include urgent mention in link accessible name when not hasUrgent', () => {
        renderLink({
            unreadMentions: 2,
            hasUrgent: false,
        });

        expect(screen.getByRole('link')).not.toHaveAccessibleName(/including an urgent mention/i);
    });

    test('shows a personal emoji after the channel name and keeps the link name unchanged', () => {
        renderLink({}, {
            entities: {
                preferences: {
                    myPreferences: {
                        [`${Preferences.CATEGORY_CHANNEL_EMOJI}--channel_id`]: {
                            user_id: 'user_id',
                            category: Preferences.CATEGORY_CHANNEL_EMOJI,
                            name: 'channel_id',
                            value: 'smile',
                        },
                    },
                },
            },
        });

        const link = screen.getByRole('link', {name: /channel_label/i});
        const label = link.querySelector('.SidebarChannelLinkLabel');
        expect(label?.nextElementSibling).toHaveClass('ChannelEmoji');
        expect(label?.nextElementSibling?.querySelector('[data-emoticon="smile"]')).toBeInTheDocument();
        expect(link).not.toHaveAccessibleName(/smile/i);
    });

    test('does not render a broken marker for an unknown emoji', () => {
        const {container} = renderLink({}, {
            entities: {
                preferences: {
                    myPreferences: {
                        [`${Preferences.CATEGORY_CHANNEL_EMOJI}--channel_id`]: {
                            user_id: 'user_id',
                            category: Preferences.CATEGORY_CHANNEL_EMOJI,
                            name: 'channel_id',
                            value: 'missing-emoji',
                        },
                    },
                },
            },
        });

        expect(container.querySelector('.ChannelEmoji')).not.toBeInTheDocument();
        expect(container).not.toHaveTextContent('missing-emoji');
    });

    test('sets a channel emoji from the row menu and shows it after the name', async () => {
        jest.spyOn(Client4, 'savePreferences').mockResolvedValue({status: 'OK'});
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            callback(0);
            return 1;
        });
        const {store} = renderLink({}, {
            entities: {users: {currentUserId: 'user_id'}},
        });

        const user = userEvent.setup();
        await user.click(screen.getByRole('button', {name: /channel options/i}));
        await user.click(await screen.findByRole('menuitem', {name: 'Set channel emoji'}));

        await waitFor(() => {
            expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
        });

        const emoji = {
            name: 'smile',
            short_name: 'smile',
            short_names: ['smile'],
            category: 'smileys-emotion',
            unified: '1f642',
        } as SystemEmoji;

        act(() => {
            mockEmojiPicker.options?.onEmojiClick(emoji);
        });

        const preference = store.getState().entities.preferences.myPreferences[`${Preferences.CATEGORY_CHANNEL_EMOJI}--channel_id`];
        expect(preference.value).toBe('smile');
        const label = screen.getByRole('link').querySelector('.SidebarChannelLinkLabel');
        expect(label?.nextElementSibling).toHaveClass('ChannelEmoji');
        expect(screen.queryByTestId('emoji-picker')).not.toBeInTheDocument();
    });

    test('dismissing the emoji picker does not save a preference', async () => {
        const savePreferences = jest.spyOn(Client4, 'savePreferences').mockResolvedValue({status: 'OK'});
        const {store} = renderLink({}, {
            entities: {users: {currentUserId: 'user_id'}},
        });

        const user = userEvent.setup();
        await user.click(screen.getByRole('button', {name: /channel options/i}));
        await user.click(await screen.findByRole('menuitem', {name: 'Set channel emoji'}));
        await screen.findByTestId('emoji-picker');

        act(() => {
            mockEmojiPicker.options?.setShowEmojiPicker(false);
        });

        expect(screen.queryByTestId('emoji-picker')).not.toBeInTheDocument();
        expect(savePreferences).not.toHaveBeenCalled();
        expect(store.getState().entities.preferences.myPreferences[`${Preferences.CATEGORY_CHANNEL_EMOJI}--channel_id`]).toBeUndefined();
    });

    test('clicking channel options does not select the channel', async () => {
        renderLink();

        await userEvent.click(screen.getByRole('button', {name: /channel options/i}));

        expect(baseProps.actions.clearChannelSelection).not.toHaveBeenCalled();
    });

    test('should refetch when channel changes', () => {
        const props = {
            isSharedChannel: true,
            remoteNames: [],
        };

        const {rerender} = renderLink(props);

        rerender(
            <SidebarChannelLink
                {...mergeObjects(mergeObjects(baseProps, props), {
                    channel: mergeObjects(baseProps.channel, {id: 'new_channel_id'}),
                })}
            />,
        );

        expect(baseProps.actions.fetchChannelRemotes).toHaveBeenCalledWith('new_channel_id');
    });
});
