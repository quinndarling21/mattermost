// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

import (
	"net/http"
	"strings"
)

const TeamDigestPluginID = "com.mattermost.team-digest"

type TeamDigestSettings struct {
	Enabled        bool   `json:"enabled"`
	WebhookURL     string `json:"webhook_url"`
	HeaderHTML     string `json:"header_html"`
	IncludePosts   bool   `json:"include_posts"`
	IncludeReplies bool   `json:"include_replies"`
	Cadence        string `json:"cadence"`
}

func (s *TeamDigestSettings) IsValid() *AppError {
	if s.Enabled && strings.TrimSpace(s.WebhookURL) == "" {
		return NewAppError("TeamDigestSettings.IsValid", "model.team_digest.webhook_url.invalid", nil, "", http.StatusBadRequest)
	}

	if s.Cadence != "" && s.Cadence != "daily" && s.Cadence != "weekly" {
		return NewAppError("TeamDigestSettings.IsValid", "model.team_digest.cadence.invalid", nil, "", http.StatusBadRequest)
	}

	return nil
}

type DigestMemberActivity struct {
	UserId          string `json:"user_id"`
	Username        string `json:"username"`
	Email           string `json:"email"`
	LastActivityAt  int64  `json:"last_activity_at"`
	PostCount       int64  `json:"post_count"`
	ReplyCount      int64  `json:"reply_count"`
	LastActiveChannel string `json:"last_active_channel,omitempty"`
}

type TeamDigestPreview struct {
	HeaderHTML string                  `json:"header_html"`
	Members    []*DigestMemberActivity `json:"members"`
	TeamId     string                  `json:"team_id"`
}

type TeamDigestMemberSummary struct {
	UserId         string `json:"user_id"`
	TeamId         string `json:"team_id"`
	PostCount      int64  `json:"post_count"`
	ReplyCount     int64  `json:"reply_count"`
	LastActivityAt int64  `json:"last_activity_at"`
}

type TestTeamDigestWebhookRequest struct {
	WebhookURL string `json:"webhook_url"`
}
