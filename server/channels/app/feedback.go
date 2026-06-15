// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
	"github.com/mattermost/mattermost/server/public/shared/request"
)

const (
	linearGraphQLURL = "https://api.linear.app/graphql"

	// Defaults target the Mattermost Factory Linear workspace. They can be
	// overridden per-deployment with the corresponding environment variables.
	defaultLinearTeamID           = "42b0a845-dac4-47db-8843-3adb89894eb3"
	defaultLinearFeatureProjectID = "aec2fe88-40f1-4bd1-a53a-cee14cf363dd"
	defaultLinearBugProjectID     = "898f8dee-cab0-41e6-b09e-31ecf845c3ee"

	linearIssueCreateMutation = `mutation IssueCreate($input: IssueCreateInput!) {
  issueCreate(input: $input) {
    success
    issue {
      identifier
      title
      url
    }
  }
}`
)

// SubmitFeedback forwards a user-submitted feature request or bug report to
// Linear as a new issue in the appropriate intake project.
func (a *App) SubmitFeedback(rctx request.CTX, req *model.SubmitFeedbackRequest, user *model.User) (*model.SubmitFeedbackResponse, *model.AppError) {
	if appErr := req.IsValid(); appErr != nil {
		return nil, appErr
	}

	apiKey := strings.TrimSpace(os.Getenv("LINEAR_API_KEY"))
	if apiKey == "" {
		return nil, model.NewAppError("SubmitFeedback", "app.feedback.not_configured.app_error", nil, "LINEAR_API_KEY is not set", http.StatusServiceUnavailable)
	}

	linearURL := getenvOrDefault("LINEAR_API_URL", linearGraphQLURL)
	teamID := getenvOrDefault("LINEAR_TEAM_ID", defaultLinearTeamID)
	projectID := getenvOrDefault("LINEAR_FEATURE_PROJECT_ID", defaultLinearFeatureProjectID)
	if req.Type == model.FeedbackTypeBug {
		projectID = getenvOrDefault("LINEAR_BUG_PROJECT_ID", defaultLinearBugProjectID)
	}

	payload := map[string]any{
		"query": linearIssueCreateMutation,
		"variables": map[string]any{
			"input": map[string]any{
				"teamId":      teamID,
				"projectId":   projectID,
				"title":       strings.TrimSpace(req.Title),
				"description": buildFeedbackDescription(req, user),
			},
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, model.NewAppError("SubmitFeedback", "app.feedback.marshal.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}

	httpReq, err := http.NewRequestWithContext(rctx.Context(), http.MethodPost, linearURL, bytes.NewReader(body))
	if err != nil {
		return nil, model.NewAppError("SubmitFeedback", "app.feedback.request.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")
	httpReq.Header.Set("Authorization", apiKey)

	resp, err := a.HTTPService().MakeClient(true).Do(httpReq)
	if err != nil {
		return nil, model.NewAppError("SubmitFeedback", "app.feedback.linear_request.app_error", nil, "", http.StatusBadGateway).Wrap(err)
	}
	defer resp.Body.Close()

	var result struct {
		Data struct {
			IssueCreate struct {
				Success bool `json:"success"`
				Issue   struct {
					Identifier string `json:"identifier"`
					Title      string `json:"title"`
					URL        string `json:"url"`
				} `json:"issue"`
			} `json:"issueCreate"`
		} `json:"data"`
		Errors []struct {
			Message string `json:"message"`
		} `json:"errors"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, model.NewAppError("SubmitFeedback", "app.feedback.linear_response.app_error", nil, "", http.StatusBadGateway).Wrap(err)
	}

	if resp.StatusCode != http.StatusOK || len(result.Errors) > 0 || !result.Data.IssueCreate.Success {
		msg := fmt.Sprintf("Linear returned status %d", resp.StatusCode)
		if len(result.Errors) > 0 {
			msg = result.Errors[0].Message
		}
		rctx.Logger().Error("Failed to create Linear issue from feedback", mlog.String("error", msg), mlog.Int("status", resp.StatusCode))
		return nil, model.NewAppError("SubmitFeedback", "app.feedback.linear_failed.app_error", nil, msg, http.StatusBadGateway)
	}

	issue := result.Data.IssueCreate.Issue
	rctx.Logger().Info("Created Linear issue from feedback", mlog.String("identifier", issue.Identifier), mlog.String("type", req.Type))

	return &model.SubmitFeedbackResponse{
		Identifier: issue.Identifier,
		Title:      issue.Title,
		URL:        issue.URL,
	}, nil
}

func buildFeedbackDescription(req *model.SubmitFeedbackRequest, user *model.User) string {
	var b strings.Builder
	if strings.TrimSpace(req.Description) != "" {
		b.WriteString(strings.TrimSpace(req.Description))
		b.WriteString("\n\n")
	}

	label := "Feature request"
	if req.Type == model.FeedbackTypeBug {
		label = "Bug report"
	}

	b.WriteString("---\n")
	b.WriteString(fmt.Sprintf("_%s submitted via Mattermost", label))
	if user != nil && user.Username != "" {
		b.WriteString(fmt.Sprintf(" by @%s", user.Username))
	}
	b.WriteString("._")

	return b.String()
}

func getenvOrDefault(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}
