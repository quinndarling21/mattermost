package main

import (
	"context"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"unicode/utf8"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin"
)

const (
	commandTrigger = "summarize"

	defaultMessageCount = 30
	maxMessageCount     = 200

	// transcriptCharBudget bounds the prompt size so a busy channel cannot
	// produce an oversized request.
	transcriptCharBudget = 24000
)

const systemPrompt = `You summarize team chat conversations. Given a transcript of a Mattermost channel, respond in Markdown with exactly two sections:

### Key takeaways
3 to 6 concise bullets covering the decisions and important context in the conversation.

### Action items
One bullet per follow-up in the form "- [ ] @owner: task" when an owner is identifiable, otherwise "- [ ] task". If there are no action items, write "- None".

Only use information present in the transcript. Do not invent facts, owners, or deadlines.`

func summarizeCommand() *model.Command {
	autocomplete := model.NewAutocompleteData(commandTrigger, "[messages]", "Summarize recent channel messages with Grok")
	autocomplete.AddTextArgument(
		fmt.Sprintf("Number of recent messages to include (default %d, max %d)", defaultMessageCount, maxMessageCount),
		"[messages]",
		"",
	)

	return &model.Command{
		Trigger:          commandTrigger,
		AutoComplete:     true,
		AutoCompleteDesc: "Summarize recent channel messages with Grok",
		AutoCompleteHint: "[messages]",
		DisplayName:      "Summarize channel",
		Description:      "Summarizes recent channel activity with xAI Grok, including token usage and cost.",
		AutocompleteData: autocomplete,
	}
}

func (p *Plugin) ExecuteCommand(_ *plugin.Context, args *model.CommandArgs) (*model.CommandResponse, *model.AppError) {
	messageCount, err := parseMessageCount(args.Command)
	if err != nil {
		return &model.CommandResponse{
			ResponseType: model.CommandResponseTypeEphemeral,
			Text:         err.Error(),
		}, nil
	}

	cfg := p.getConfiguration()
	if cfg.XAIAPIKey == "" {
		return &model.CommandResponse{
			ResponseType: model.CommandResponseTypeEphemeral,
			Text: "The channel summarizer is not configured with an xAI API key. " +
				"Set one in **System Console > Plugins > Channel Summarizer**, or export `XAI_API_KEY` in the server environment and restart.",
		}, nil
	}

	// Run the summary asynchronously so the slash command returns
	// immediately; the result arrives as a follow-up ephemeral post.
	go p.runSummary(cfg, args.UserId, args.ChannelId, args.RootId, messageCount)

	return &model.CommandResponse{
		ResponseType: model.CommandResponseTypeEphemeral,
		Text:         fmt.Sprintf("Summarizing the last %d messages with `%s`…", messageCount, cfg.Model),
	}, nil
}

func parseMessageCount(command string) (int, error) {
	fields := strings.Fields(command)
	if len(fields) < 2 {
		return defaultMessageCount, nil
	}

	count, err := strconv.Atoi(fields[1])
	if err != nil || count < 1 {
		return 0, fmt.Errorf("`%s` is not a valid message count. Usage: `/%s [messages]` with a number between 1 and %d.", fields[1], commandTrigger, maxMessageCount)
	}
	if count > maxMessageCount {
		count = maxMessageCount
	}
	return count, nil
}

func (p *Plugin) runSummary(cfg configuration, userID, channelID, rootID string, messageCount int) {
	transcript, included, err := p.buildTranscript(channelID, messageCount)
	if err != nil {
		p.API.LogError("Failed to collect channel messages for summary", "channel_id", channelID, "error", err.Error())
		p.sendEphemeral(userID, channelID, rootID, "Could not read this channel's recent messages: "+err.Error())
		return
	}
	if included == 0 {
		p.sendEphemeral(userID, channelID, rootID, "There are no recent user messages in this channel to summarize.")
		return
	}

	client := newXAIClient(cfg.XAIAPIURL, cfg.XAIAPIKey)
	result, err := client.createChatCompletion(context.Background(), cfg.Model, []chatMessage{
		{Role: "system", Content: systemPrompt},
		{Role: "user", Content: transcript},
	})
	if err != nil {
		p.API.LogError("Grok summarization request failed", "channel_id", channelID, "error", redactKey(err.Error(), cfg.XAIAPIKey))
		p.sendEphemeral(userID, channelID, rootID, "Summarization failed: "+redactKey(err.Error(), cfg.XAIAPIKey))
		return
	}

	p.sendEphemeral(userID, channelID, rootID, formatSummaryPost(result, included))
}

// buildTranscript returns the prompt for the model plus the number of
// messages it includes.
func (p *Plugin) buildTranscript(channelID string, messageCount int) (string, int, error) {
	postList, appErr := p.API.GetPostsForChannel(channelID, 0, messageCount)
	if appErr != nil {
		return "", 0, appErr
	}

	posts := make([]*model.Post, 0, len(postList.Posts))
	for _, id := range postList.Order {
		post := postList.Posts[id]
		if post == nil || post.DeleteAt != 0 || post.Type != model.PostTypeDefault || strings.TrimSpace(post.Message) == "" {
			continue
		}
		posts = append(posts, post)
	}
	// PostList.Order is newest first; the model reads oldest first.
	sort.Slice(posts, func(i, j int) bool { return posts[i].CreateAt < posts[j].CreateAt })

	channelName := channelID
	if channel, appErr := p.API.GetChannel(channelID); appErr == nil && channel.DisplayName != "" {
		channelName = channel.DisplayName
	}

	usernames := map[string]string{}
	lines := make([]string, 0, len(posts))
	for _, post := range posts {
		username, ok := usernames[post.UserId]
		if !ok {
			username = "unknown-user"
			if user, appErr := p.API.GetUser(post.UserId); appErr == nil {
				username = user.Username
			}
			usernames[post.UserId] = username
		}
		lines = append(lines, fmt.Sprintf("- @%s: %s\n", username, strings.ReplaceAll(post.Message, "\n", " ")))
	}
	if len(lines) == 0 {
		return "", 0, nil
	}

	header := fmt.Sprintf("Channel: %s\nMessages (oldest first):\n", channelName)
	budget := transcriptCharBudget - len(header)

	// When the budget cannot hold everything, keep the newest messages: the
	// latest activity is what a summary must not miss.
	total := 0
	start := len(lines)
	for i := len(lines) - 1; i >= 0; i-- {
		if total+len(lines[i]) > budget {
			break
		}
		total += len(lines[i])
		start = i
	}
	if start == len(lines) {
		// Even the newest message alone exceeds the budget; truncate it,
		// reserving room for the ellipsis (3 bytes) and trailing newline.
		start = len(lines) - 1
		lines[start] = truncateUTF8(lines[start], budget-4) + "…\n"
	}

	var sb strings.Builder
	sb.WriteString(header)
	for _, line := range lines[start:] {
		sb.WriteString(line)
	}
	return sb.String(), len(lines) - start, nil
}

// truncateUTF8 shortens s to at most n bytes without splitting a rune.
func truncateUTF8(s string, n int) string {
	if n <= 0 {
		return ""
	}
	if len(s) <= n {
		return s
	}
	for n > 0 && !utf8.RuneStart(s[n]) {
		n--
	}
	return s[:n]
}

func formatSummaryPost(result *summaryResult, messageCount int) string {
	var sb strings.Builder
	fmt.Fprintf(&sb, "#### Channel summary · last %d messages\n\n", messageCount)
	sb.WriteString(strings.TrimSpace(result.Content))
	sb.WriteString("\n\n---\n")

	usage := result.Usage
	fmt.Fprintf(&sb, "Model `%s` · %s input", result.Model, formatTokens(usage.PromptTokens))
	if cached := usage.PromptTokensDetails.CachedTokens; cached > 0 {
		fmt.Fprintf(&sb, " (%s cached)", formatTokens(cached))
	}
	fmt.Fprintf(&sb, " + %s output tokens", formatTokens(usage.CompletionTokens))

	if pricing, ok := pricingFor(result.Model); ok {
		fmt.Fprintf(&sb, " · **%s**", formatUSD(costUSD(usage, pricing)))
	} else {
		sb.WriteString(" · cost unavailable (no list pricing for this model)")
	}
	return sb.String()
}

func formatTokens(count int) string {
	s := strconv.Itoa(count)
	for i := len(s) - 3; i > 0; i -= 3 {
		s = s[:i] + "," + s[i:]
	}
	return s
}
