// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api4

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost/server/public/model"
)

func TestSubmitFeedback(t *testing.T) {
	th := Setup(t).InitBasic(t)

	t.Run("rejects unauthenticated requests", func(t *testing.T) {
		client := th.CreateClient()
		_, resp, err := client.SubmitFeedback(context.Background(), &model.SubmitFeedbackRequest{
			Type:  model.FeedbackTypeFeature,
			Title: "I am not logged in",
		})
		require.Error(t, err)
		CheckUnauthorizedStatus(t, resp)
	})

	t.Run("rejects an invalid type", func(t *testing.T) {
		_, resp, err := th.Client.SubmitFeedback(context.Background(), &model.SubmitFeedbackRequest{
			Type:  "not-a-real-type",
			Title: "Something",
		})
		require.Error(t, err)
		CheckBadRequestStatus(t, resp)
	})

	t.Run("rejects an empty title", func(t *testing.T) {
		_, resp, err := th.Client.SubmitFeedback(context.Background(), &model.SubmitFeedbackRequest{
			Type:  model.FeedbackTypeBug,
			Title: "   ",
		})
		require.Error(t, err)
		CheckBadRequestStatus(t, resp)
	})

	t.Run("returns service unavailable when not configured", func(t *testing.T) {
		t.Setenv("LINEAR_API_KEY", "")
		_, resp, err := th.Client.SubmitFeedback(context.Background(), &model.SubmitFeedbackRequest{
			Type:  model.FeedbackTypeFeature,
			Title: "Dark mode please",
		})
		require.Error(t, err)
		require.Equal(t, http.StatusServiceUnavailable, resp.StatusCode)
	})

	t.Run("creates a Linear issue on success", func(t *testing.T) {
		var capturedAuth string
		var capturedBody map[string]any

		linear := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			capturedAuth = r.Header.Get("Authorization")
			raw, _ := io.ReadAll(r.Body)
			_ = json.Unmarshal(raw, &capturedBody)

			w.Header().Set("Content-Type", "application/json")
			_, _ = io.WriteString(w, `{"data":{"issueCreate":{"success":true,"issue":{"identifier":"MAT-42","title":"Dark mode please","url":"https://linear.app/mattermost-factory/issue/MAT-42"}}}}`)
		}))
		defer linear.Close()

		t.Setenv("LINEAR_API_KEY", "lin_api_test_key")
		t.Setenv("LINEAR_API_URL", linear.URL)
		t.Setenv("LINEAR_TEAM_ID", "team-123")
		t.Setenv("LINEAR_FEATURE_PROJECT_ID", "feature-project-123")

		res, resp, err := th.Client.SubmitFeedback(context.Background(), &model.SubmitFeedbackRequest{
			Type:        model.FeedbackTypeFeature,
			Title:       "Dark mode please",
			Description: "It would be great to have a dark mode.",
		})
		require.NoError(t, err)
		CheckOKStatus(t, resp)
		require.NotNil(t, res)
		assert.Equal(t, "MAT-42", res.Identifier)
		assert.Equal(t, "https://linear.app/mattermost-factory/issue/MAT-42", res.URL)

		assert.Equal(t, "lin_api_test_key", capturedAuth)

		variables, ok := capturedBody["variables"].(map[string]any)
		require.True(t, ok)
		input, ok := variables["input"].(map[string]any)
		require.True(t, ok)
		assert.Equal(t, "team-123", input["teamId"])
		assert.Equal(t, "feature-project-123", input["projectId"])
		assert.Equal(t, "Dark mode please", input["title"])
		assert.Contains(t, input["description"], "It would be great to have a dark mode.")
		assert.Contains(t, input["description"], "@"+th.BasicUser.Username)
	})

	t.Run("routes bugs to the bug project", func(t *testing.T) {
		var capturedBody map[string]any

		linear := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			raw, _ := io.ReadAll(r.Body)
			_ = json.Unmarshal(raw, &capturedBody)
			w.Header().Set("Content-Type", "application/json")
			_, _ = io.WriteString(w, `{"data":{"issueCreate":{"success":true,"issue":{"identifier":"MAT-7","title":"Crash on login","url":"https://linear.app/mattermost-factory/issue/MAT-7"}}}}`)
		}))
		defer linear.Close()

		t.Setenv("LINEAR_API_KEY", "lin_api_test_key")
		t.Setenv("LINEAR_API_URL", linear.URL)
		t.Setenv("LINEAR_BUG_PROJECT_ID", "bug-project-123")

		_, resp, err := th.Client.SubmitFeedback(context.Background(), &model.SubmitFeedbackRequest{
			Type:  model.FeedbackTypeBug,
			Title: "Crash on login",
		})
		require.NoError(t, err)
		CheckOKStatus(t, resp)

		variables := capturedBody["variables"].(map[string]any)
		input := variables["input"].(map[string]any)
		assert.Equal(t, "bug-project-123", input["projectId"])
	})

	t.Run("surfaces Linear API errors", func(t *testing.T) {
		linear := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			_, _ = io.WriteString(w, `{"errors":[{"message":"Authentication required"}]}`)
		}))
		defer linear.Close()

		t.Setenv("LINEAR_API_KEY", "bad-key")
		t.Setenv("LINEAR_API_URL", linear.URL)

		_, resp, err := th.Client.SubmitFeedback(context.Background(), &model.SubmitFeedbackRequest{
			Type:  model.FeedbackTypeFeature,
			Title: "Will fail",
		})
		require.Error(t, err)
		require.Equal(t, http.StatusBadGateway, resp.StatusCode)
		assert.True(t, strings.Contains(err.Error(), "Authentication required") || strings.Contains(err.Error(), "Unable to create"))
	})
}
