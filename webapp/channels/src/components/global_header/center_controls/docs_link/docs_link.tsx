// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';

import ExternalLink from 'components/external_link';

export const LOCAL_DOCS_URL = 'http://localhost:3001';

const DocsLinkAnchor = styled(ExternalLink)`
    display: flex;
    height: 28px;
    align-items: center;
    padding: 0 8px;
    border-radius: 4px;
    color: rgba(var(--sidebar-header-text-color-rgb), 0.72);
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    text-decoration: none;

    &:hover,
    &:focus {
        background: rgba(var(--sidebar-header-text-color-rgb), 0.08);
        color: rgba(var(--sidebar-header-text-color-rgb), 1);
        text-decoration: none;
    }

    &:focus-visible {
        box-shadow:
            inset 0 0 0 2px rgba(255, 255, 255, 0.32),
            inset 0 0 0 2px var(--sidebar-header-bg);
        outline: none;
    }
`;

const DocsLink = (): JSX.Element => {
    const {formatMessage} = useIntl();
    const label = formatMessage({id: 'global_header.docs', defaultMessage: 'Docs'});

    return (
        <DocsLinkAnchor
            href={LOCAL_DOCS_URL}
            location='global_header_docs'
            aria-label={label}
        >
            {label}
        </DocsLinkAnchor>
    );
};

export default DocsLink;
