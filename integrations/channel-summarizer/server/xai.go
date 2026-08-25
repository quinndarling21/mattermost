package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/pkg/errors"
)

// xaiClient is a minimal client for the xAI chat completions API.
// https://docs.x.ai/docs/api-reference#chat-completions
type xaiClient struct {
	httpClient *http.Client
	baseURL    string
	apiKey     string
}

func newXAIClient(baseURL, apiKey string) *xaiClient {
	return &xaiClient{
		httpClient: &http.Client{Timeout: 90 * time.Second},
		baseURL:    strings.TrimRight(baseURL, "/"),
		apiKey:     apiKey,
	}
}

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatCompletionRequest struct {
	Model    string        `json:"model"`
	Messages []chatMessage `json:"messages"`
}

type promptTokensDetails struct {
	CachedTokens int `json:"cached_tokens"`
}

type chatUsage struct {
	PromptTokens        int                 `json:"prompt_tokens"`
	CompletionTokens    int                 `json:"completion_tokens"`
	TotalTokens         int                 `json:"total_tokens"`
	PromptTokensDetails promptTokensDetails `json:"prompt_tokens_details"`
}

type chatCompletionResponse struct {
	ID      string `json:"id"`
	Model   string `json:"model"`
	Choices []struct {
		Message chatMessage `json:"message"`
	} `json:"choices"`
	Usage chatUsage `json:"usage"`
}

type xaiErrorResponse struct {
	Code  string `json:"code"`
	Error string `json:"error"`
}

type summaryResult struct {
	Content string
	Model   string
	Usage   chatUsage
}

func (c *xaiClient) createChatCompletion(ctx context.Context, model string, messages []chatMessage) (*summaryResult, error) {
	body, err := json.Marshal(chatCompletionRequest{Model: model, Messages: messages})
	if err != nil {
		return nil, errors.Wrap(err, "failed to encode request")
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, errors.Wrap(err, "failed to build request")
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, errors.New(redactKey(err.Error(), c.apiKey))
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	if err != nil {
		return nil, errors.Wrap(err, "failed to read response")
	}

	if resp.StatusCode != http.StatusOK {
		var apiErr xaiErrorResponse
		if json.Unmarshal(respBody, &apiErr) == nil && apiErr.Error != "" {
			return nil, fmt.Errorf("xAI API error (HTTP %d): %s", resp.StatusCode, apiErr.Error)
		}
		return nil, fmt.Errorf("xAI API returned HTTP %d", resp.StatusCode)
	}

	var completion chatCompletionResponse
	if err := json.Unmarshal(respBody, &completion); err != nil {
		return nil, errors.Wrap(err, "failed to decode response")
	}
	if len(completion.Choices) == 0 {
		return nil, errors.New("xAI API returned no choices")
	}

	respModel := completion.Model
	if respModel == "" {
		respModel = model
	}

	return &summaryResult{
		Content: completion.Choices[0].Message.Content,
		Model:   respModel,
		Usage:   completion.Usage,
	}, nil
}
