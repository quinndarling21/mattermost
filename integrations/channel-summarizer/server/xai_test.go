package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const completionFixture = `{
	"id": "chatcmpl-123",
	"model": "grok-4.6",
	"choices": [
		{
			"message": {
				"role": "assistant",
				"content": "### Key takeaways\n- Release moved to Thursday.\n\n### Action items\n- [ ] @jordan: update the status page."
			}
		}
	],
	"usage": {
		"prompt_tokens": 1200,
		"completion_tokens": 300,
		"total_tokens": 1500,
		"prompt_tokens_details": {"cached_tokens": 200}
	}
}`

func TestCreateChatCompletion(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		var gotAuth string
		var gotRequest chatCompletionRequest

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			assert.Equal(t, http.MethodPost, r.Method)
			assert.Equal(t, "/v1/chat/completions", r.URL.Path)
			gotAuth = r.Header.Get("Authorization")
			require.NoError(t, json.NewDecoder(r.Body).Decode(&gotRequest))

			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(completionFixture))
		}))
		defer server.Close()

		client := newXAIClient(server.URL+"/v1", "test-key")
		result, err := client.createChatCompletion(context.Background(), "grok-4.6", []chatMessage{
			{Role: "system", Content: "summarize"},
			{Role: "user", Content: "transcript"},
		})
		require.NoError(t, err)

		assert.Equal(t, "Bearer test-key", gotAuth)
		assert.Equal(t, "grok-4.6", gotRequest.Model)
		require.Len(t, gotRequest.Messages, 2)

		assert.Equal(t, "grok-4.6", result.Model)
		assert.Contains(t, result.Content, "Key takeaways")
		assert.Equal(t, 1200, result.Usage.PromptTokens)
		assert.Equal(t, 300, result.Usage.CompletionTokens)
		assert.Equal(t, 200, result.Usage.PromptTokensDetails.CachedTokens)
	})

	t.Run("api error surfaces message", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"code":"invalid-argument","error":"Incorrect API key provided."}`))
		}))
		defer server.Close()

		client := newXAIClient(server.URL, "bad-key")
		_, err := client.createChatCompletion(context.Background(), "grok-4.6", nil)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "Incorrect API key")
		assert.Contains(t, err.Error(), "401")
	})

	t.Run("empty choices", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			_, _ = w.Write([]byte(`{"model":"grok-4.6","choices":[],"usage":{}}`))
		}))
		defer server.Close()

		client := newXAIClient(server.URL, "test-key")
		_, err := client.createChatCompletion(context.Background(), "grok-4.6", nil)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "no choices")
	})
}

func TestFormatSummaryPost(t *testing.T) {
	result := &summaryResult{
		Content: "### Key takeaways\n- Release moved to Thursday.\n\n### Action items\n- [ ] @jordan: update the status page.",
		Model:   "grok-4.6",
		Usage: chatUsage{
			PromptTokens:        1200,
			CompletionTokens:    300,
			PromptTokensDetails: promptTokensDetails{CachedTokens: 200},
		},
	}

	post := formatSummaryPost(result, 25)

	assert.Contains(t, post, "last 25 messages")
	assert.Contains(t, post, "### Key takeaways")
	assert.Contains(t, post, "### Action items")
	assert.Contains(t, post, "Model `grok-4.6`")
	assert.Contains(t, post, "1,200 input (200 cached) + 300 output tokens")
	// (1200-200)*2.00/1M + 200*0.50/1M + 300*6.00/1M = 0.0039
	assert.Contains(t, post, "**$0.003900**")
}

func TestFormatSummaryPostUnknownModelPricing(t *testing.T) {
	result := &summaryResult{
		Content: "summary",
		Model:   "experimental-model",
		Usage:   chatUsage{PromptTokens: 10, CompletionTokens: 5},
	}

	post := formatSummaryPost(result, 5)
	assert.Contains(t, post, "cost unavailable")
	assert.NotContains(t, post, "$")
}
