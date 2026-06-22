import {defineConfig} from 'vitepress';

export default defineConfig({
    title: 'Mattermost Docs',
    description: 'Product and administration documentation for this Mattermost repository.',
    cleanUrls: true,
    lastUpdated: true,
    themeConfig: {
        nav: [
            {text: 'Product', link: '/product/'},
            {text: 'Administration', link: '/admin/'},
            {text: 'Integrations', link: '/integrations/'},
        ],
        sidebar: [
            {
                text: 'Product',
                items: [
                    {text: 'Overview', link: '/product/'},
                    {text: 'Teams and channels', link: '/product/teams-and-channels'},
                    {text: 'Messaging', link: '/product/messaging'},
                    {text: 'Files, search, and notifications', link: '/product/files-search-notifications'},
                    {text: 'Plugins and bundled tools', link: '/product/plugins-and-tools'},
                ],
            },
            {
                text: 'Administration',
                items: [
                    {text: 'System Console', link: '/admin/'},
                    {text: 'Authentication and security', link: '/admin/authentication-and-security'},
                    {text: 'Users and permissions', link: '/admin/users-and-permissions'},
                    {text: 'Compliance and data governance', link: '/admin/compliance-and-governance'},
                    {text: 'Command-line administration', link: '/admin/command-line-administration'},
                ],
            },
            {
                text: 'Integrations',
                items: [
                    {text: 'Webhooks, commands, OAuth, and bots', link: '/integrations/'},
                ],
            },
        ],
        search: {
            provider: 'local',
        },
        socialLinks: [
            {icon: 'github', link: 'https://github.com/mattermost/mattermost'},
        ],
    },
});
