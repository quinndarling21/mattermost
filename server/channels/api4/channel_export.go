// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api4

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
	"github.com/mattermost/mattermost/server/v8/channels/app"
)

func (api *API) InitChannelExport() {
	api.BaseRoutes.Channel.Handle("/exports", api.APISessionRequired(createChannelExport)).Methods(http.MethodPost)
	api.BaseRoutes.Channel.Handle("/exports/{export_id:[A-Za-z0-9]+}", api.APISessionRequired(getChannelExport)).Methods(http.MethodGet)
}

// createChannelExport runs an export for the channel and returns the finished job.
// Request body: {"page":1,"per_page":200,"include_deleted":false,"file_name":"","callback_url":"","since":0}
// page is 1-based.
func createChannelExport(c *Context, w http.ResponseWriter, r *http.Request) {
	c.RequireChannelId()
	if c.Err != nil {
		return
	}

	var req app.ChannelExportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		c.SetInvalidParamWithErr("channel_export", err)
		return
	}

	auditRec := c.MakeAuditRecord(model.AuditEventCreateChannelExport, model.AuditStatusFail)
	defer c.LogAuditRec(auditRec)
	model.AddEventParameterToAuditRec(auditRec, "channel_id", c.Params.ChannelId)

	job, appErr := c.App.CreateChannelExport(c.AppContext, c.Params.ChannelId, &req)
	if appErr != nil {
		c.Err = appErr
		return
	}

	auditRec.Success()
	auditRec.AddEventResultState(job)

	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(job); err != nil {
		c.Logger.Warn("Error while writing response", mlog.Err(err))
	}
}

func getChannelExport(c *Context, w http.ResponseWriter, r *http.Request) {
	c.RequireChannelId()
	if c.Err != nil {
		return
	}

	exportId := mux.Vars(r)["export_id"]
	if !model.IsValidId(exportId) {
		c.SetInvalidURLParam("export_id")
		return
	}

	job, appErr := c.App.GetChannelExport(c.AppContext, c.Params.ChannelId, exportId)
	if appErr != nil {
		c.Err = appErr
		return
	}

	if err := json.NewEncoder(w).Encode(job); err != nil {
		c.Logger.Warn("Error while writing response", mlog.Err(err))
	}
}
