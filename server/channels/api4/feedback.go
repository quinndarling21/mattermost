// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api4

import (
	"encoding/json"
	"net/http"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
)

func (api *API) InitFeedback() {
	api.BaseRoutes.Feedback.Handle("", api.APISessionRequired(submitFeedback)).Methods(http.MethodPost)
}

func submitFeedback(c *Context, w http.ResponseWriter, r *http.Request) {
	var req model.SubmitFeedbackRequest
	if jsonErr := json.NewDecoder(r.Body).Decode(&req); jsonErr != nil {
		c.SetInvalidParamWithErr("feedback", jsonErr)
		return
	}

	if appErr := req.IsValid(); appErr != nil {
		c.Err = appErr
		return
	}

	user, appErr := c.App.GetUser(c.AppContext.Session().UserId)
	if appErr != nil {
		c.Err = appErr
		return
	}

	res, appErr := c.App.SubmitFeedback(c.AppContext, &req, user)
	if appErr != nil {
		c.Err = appErr
		return
	}

	if err := json.NewEncoder(w).Encode(res); err != nil {
		c.Logger.Warn("Error while writing response", mlog.Err(err))
	}
}
