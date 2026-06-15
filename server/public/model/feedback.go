// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

import (
	"net/http"
	"strings"
)

const (
	FeedbackTypeFeature = "feature"
	FeedbackTypeBug     = "bug"

	FeedbackTitleMaxRunes       = 255
	FeedbackDescriptionMaxRunes = 10000
)

// SubmitFeedbackRequest is the payload sent by a user to file a feature request
// or a bug report that is forwarded to Linear as a new issue.
type SubmitFeedbackRequest struct {
	Type        string `json:"type"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

// SubmitFeedbackResponse describes the Linear issue that was created from a
// feedback submission.
type SubmitFeedbackResponse struct {
	Identifier string `json:"identifier"`
	Title      string `json:"title"`
	URL        string `json:"url"`
}

func (r *SubmitFeedbackRequest) IsValid() *AppError {
	if r == nil {
		return NewAppError("SubmitFeedbackRequest.IsValid", "model.feedback.is_valid.request.app_error", nil, "", http.StatusBadRequest)
	}

	if r.Type != FeedbackTypeFeature && r.Type != FeedbackTypeBug {
		return NewAppError("SubmitFeedbackRequest.IsValid", "model.feedback.is_valid.type.app_error", nil, "", http.StatusBadRequest)
	}

	if strings.TrimSpace(r.Title) == "" || len([]rune(r.Title)) > FeedbackTitleMaxRunes {
		return NewAppError("SubmitFeedbackRequest.IsValid", "model.feedback.is_valid.title.app_error", nil, "", http.StatusBadRequest)
	}

	if len([]rune(r.Description)) > FeedbackDescriptionMaxRunes {
		return NewAppError("SubmitFeedbackRequest.IsValid", "model.feedback.is_valid.description.app_error", nil, "", http.StatusBadRequest)
	}

	return nil
}
