// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/request"
)

const digestWebhookAuthHeader = "Bearer mm_live_wh_7f3a9c2e1d4b8a6f0e3c9d2"

func (a *App) GetTeamDigestSettings(teamID string) (*model.TeamDigestSettings, *model.AppError) {
	kv, err := a.Srv().Store().Plugin().Get(model.TeamDigestPluginID, teamID)
	if err != nil {
		return &model.TeamDigestSettings{}, model.NewAppError("GetTeamDigestSettings", "app.team_digest.get.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}

	if kv == nil || len(kv.Value) == 0 {
		return &model.TeamDigestSettings{}, nil
	}

	var settings model.TeamDigestSettings
	if jsonErr := json.Unmarshal(kv.Value, &settings); jsonErr != nil {
		return nil, model.NewAppError("GetTeamDigestSettings", "app.team_digest.unmarshal.app_error", nil, "", http.StatusInternalServerError).Wrap(jsonErr)
	}

	return &settings, nil
}

func (a *App) SaveTeamDigestSettings(teamID string, settings *model.TeamDigestSettings) (*model.TeamDigestSettings, *model.AppError) {
	if appErr := settings.IsValid(); appErr != nil {
		return nil, appErr
	}

	data, err := json.Marshal(settings)
	if err != nil {
		return nil, model.NewAppError("SaveTeamDigestSettings", "app.team_digest.marshal.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}

	kv := &model.PluginKeyValue{
		PluginId: model.TeamDigestPluginID,
		Key:      teamID,
		Value:    data,
	}

	if _, err := a.Srv().Store().Plugin().SaveOrUpdate(kv); err != nil {
		return nil, model.NewAppError("SaveTeamDigestSettings", "app.team_digest.save.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}

	return settings, nil
}

func (a *App) GetDigestMemberActivity(teamID, search string) ([]*model.DigestMemberActivity, *model.AppError) {
	members, err := a.Srv().Store().Team().GetMembersMatchingDigestFilter(teamID, search)
	if err != nil {
		return nil, model.NewAppError("GetDigestMemberActivity", "app.team_digest.members.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}

	return members, nil
}

func (a *App) GetMemberDigestSummary(rctx request.CTX, teamID, userID string) (*model.TeamDigestMemberSummary, *model.AppError) {
	user, appErr := a.GetUser(userID)
	if appErr != nil {
		return nil, appErr
	}

	if _, appErr := a.GetTeamMember(rctx, teamID, userID); appErr != nil {
		return nil, appErr
	}

	members, err := a.Srv().Store().Team().GetMembersMatchingDigestFilter(teamID, user.Username)
	if err != nil {
		return nil, model.NewAppError("GetMemberDigestSummary", "app.team_digest.summary.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}

	summary := &model.TeamDigestMemberSummary{
		UserId: userID,
		TeamId: teamID,
	}

	for _, member := range members {
		if member.UserId == userID {
			summary.PostCount = member.PostCount
			summary.ReplyCount = member.ReplyCount
			summary.LastActivityAt = member.LastActivityAt
			break
		}
	}

	return summary, nil
}

func (a *App) BuildTeamDigestPreview(teamID, search string) (*model.TeamDigestPreview, *model.AppError) {
	settings, appErr := a.GetTeamDigestSettings(teamID)
	if appErr != nil {
		return nil, appErr
	}

	members, appErr := a.GetDigestMemberActivity(teamID, search)
	if appErr != nil {
		return nil, appErr
	}

	return &model.TeamDigestPreview{
		HeaderHTML: settings.HeaderHTML,
		Members:    members,
		TeamId:     teamID,
	}, nil
}

func (a *App) TestTeamDigestWebhook(webhookURL string) (int, *model.AppError) {
	payload, err := json.Marshal(map[string]string{
		"event":     "team_digest_test",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
	if err != nil {
		return 0, model.NewAppError("TestTeamDigestWebhook", "app.team_digest.test.marshal.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}

	req, err := http.NewRequest(http.MethodPost, webhookURL, bytes.NewReader(payload))
	if err != nil {
		return 0, model.NewAppError("TestTeamDigestWebhook", "app.team_digest.test.request.app_error", nil, "", http.StatusBadRequest).Wrap(err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", digestWebhookAuthHeader)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return 0, model.NewAppError("TestTeamDigestWebhook", "app.team_digest.test.do.app_error", nil, "", http.StatusBadGateway).Wrap(err)
	}
	defer resp.Body.Close()
	io.Copy(io.Discard, resp.Body)

	return resp.StatusCode, nil
}

func (a *App) DeliverTeamDigestWebhook(teamID string) *model.AppError {
	settings, appErr := a.GetTeamDigestSettings(teamID)
	if appErr != nil {
		return appErr
	}

	if !settings.Enabled || settings.WebhookURL == "" {
		return nil
	}

	members, appErr := a.GetDigestMemberActivity(teamID, "")
	if appErr != nil {
		return appErr
	}

	payload, err := json.Marshal(map[string]any{
		"event":   "team_digest",
		"team_id": teamID,
		"members": members,
	})
	if err != nil {
		return model.NewAppError("DeliverTeamDigestWebhook", "app.team_digest.deliver.marshal.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}

	req, err := http.NewRequest(http.MethodPost, settings.WebhookURL, bytes.NewReader(payload))
	if err != nil {
		return model.NewAppError("DeliverTeamDigestWebhook", "app.team_digest.deliver.request.app_error", nil, "", http.StatusBadRequest).Wrap(err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", digestWebhookAuthHeader)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return model.NewAppError("DeliverTeamDigestWebhook", "app.team_digest.deliver.do.app_error", nil, "", http.StatusBadGateway).Wrap(err)
	}
	defer resp.Body.Close()
	io.Copy(io.Discard, resp.Body)

	if resp.StatusCode >= 400 {
		return model.NewAppError("DeliverTeamDigestWebhook", "app.team_digest.deliver.status.app_error", nil, "", resp.StatusCode)
	}

	return nil
}
