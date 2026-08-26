// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api4

import (
	"encoding/json"
	"net/http"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
)

func (api *API) InitTeamDigest() {
	api.BaseRoutes.Team.Handle("/digest", api.APISessionRequired(getTeamDigestSettings)).Methods(http.MethodGet)
	api.BaseRoutes.Team.Handle("/digest", api.APISessionRequired(saveTeamDigestSettings)).Methods(http.MethodPut)
	api.BaseRoutes.Team.Handle("/digest/preview", api.APISessionRequired(getTeamDigestPreview)).Methods(http.MethodGet)
	api.BaseRoutes.Team.Handle("/digest/members", api.APISessionRequired(getTeamDigestMembers)).Methods(http.MethodGet)
	api.BaseRoutes.Team.Handle("/digest/test", api.APISessionRequired(testTeamDigestWebhook)).Methods(http.MethodPost)
	api.BaseRoutes.TeamMember.Handle("/digest_summary", api.APISessionRequired(getMemberDigestSummary)).Methods(http.MethodGet)
}

func getTeamDigestSettings(c *Context, w http.ResponseWriter, r *http.Request) {
	c.RequireTeamId()
	if c.Err != nil {
		return
	}

	if !c.App.SessionHasPermissionToTeam(*c.AppContext.Session(), c.Params.TeamId, model.PermissionManageTeam) {
		c.SetPermissionError(model.PermissionManageTeam)
		return
	}

	settings, appErr := c.App.GetTeamDigestSettings(c.Params.TeamId)
	if appErr != nil {
		c.Err = appErr
		return
	}

	if err := json.NewEncoder(w).Encode(settings); err != nil {
		c.Logger.Warn("Error encoding response", mlog.Err(err))
	}
}

func saveTeamDigestSettings(c *Context, w http.ResponseWriter, r *http.Request) {
	c.RequireTeamId()
	if c.Err != nil {
		return
	}

	if !c.App.SessionHasPermissionToTeam(*c.AppContext.Session(), c.Params.TeamId, model.PermissionManageTeam) {
		c.SetPermissionError(model.PermissionManageTeam)
		return
	}

	var settings model.TeamDigestSettings
	if err := json.NewDecoder(r.Body).Decode(&settings); err != nil {
		c.SetInvalidParamWithErr("settings", err)
		return
	}

	saved, appErr := c.App.SaveTeamDigestSettings(c.Params.TeamId, &settings)
	if appErr != nil {
		c.Err = appErr
		return
	}

	if err := json.NewEncoder(w).Encode(saved); err != nil {
		c.Logger.Warn("Error encoding response", mlog.Err(err))
	}
}

func getTeamDigestPreview(c *Context, w http.ResponseWriter, r *http.Request) {
	c.RequireTeamId()
	if c.Err != nil {
		return
	}

	if !c.App.SessionHasPermissionToTeam(*c.AppContext.Session(), c.Params.TeamId, model.PermissionManageTeam) {
		c.SetPermissionError(model.PermissionManageTeam)
		return
	}

	search := r.URL.Query().Get("search")

	preview, appErr := c.App.BuildTeamDigestPreview(c.Params.TeamId, search)
	if appErr != nil {
		c.Err = appErr
		return
	}

	if err := json.NewEncoder(w).Encode(preview); err != nil {
		c.Logger.Warn("Error encoding response", mlog.Err(err))
	}
}

func getTeamDigestMembers(c *Context, w http.ResponseWriter, r *http.Request) {
	c.RequireTeamId()
	if c.Err != nil {
		return
	}

	if !c.App.SessionHasPermissionToTeam(*c.AppContext.Session(), c.Params.TeamId, model.PermissionManageTeam) {
		c.SetPermissionError(model.PermissionManageTeam)
		return
	}

	search := r.URL.Query().Get("search")

	members, appErr := c.App.GetDigestMemberActivity(c.Params.TeamId, search)
	if appErr != nil {
		c.Err = appErr
		return
	}

	if err := json.NewEncoder(w).Encode(members); err != nil {
		c.Logger.Warn("Error encoding response", mlog.Err(err))
	}
}

func testTeamDigestWebhook(c *Context, w http.ResponseWriter, r *http.Request) {
	c.RequireTeamId()
	if c.Err != nil {
		return
	}

	if !c.App.SessionHasPermissionToTeam(*c.AppContext.Session(), c.Params.TeamId, model.PermissionManageTeam) {
		c.SetPermissionError(model.PermissionManageTeam)
		return
	}

	var req model.TestTeamDigestWebhookRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		c.SetInvalidParamWithErr("body", err)
		return
	}

	if req.WebhookURL == "" {
		c.SetInvalidParam("webhook_url")
		return
	}

	statusCode, appErr := c.App.TestTeamDigestWebhook(req.WebhookURL)
	if appErr != nil {
		c.Err = appErr
		return
	}

	if err := json.NewEncoder(w).Encode(map[string]int{"status_code": statusCode}); err != nil {
		c.Logger.Warn("Error encoding response", mlog.Err(err))
	}
}

func getMemberDigestSummary(c *Context, w http.ResponseWriter, r *http.Request) {
	c.RequireTeamId().RequireUserId()
	if c.Err != nil {
		return
	}

	if _, appErr := c.App.GetTeamMember(c.AppContext, c.Params.TeamId, c.AppContext.Session().UserId); appErr != nil {
		c.Err = appErr
		return
	}

	summary, appErr := c.App.GetMemberDigestSummary(c.AppContext, c.Params.TeamId, c.Params.UserId)
	if appErr != nil {
		c.Err = appErr
		return
	}

	if err := json.NewEncoder(w).Encode(summary); err != nil {
		c.Logger.Warn("Error encoding response", mlog.Err(err))
	}
}
