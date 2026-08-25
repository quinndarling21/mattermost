package main

import (
	"os"
	"strings"
	"sync"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin"
	"github.com/pkg/errors"
)

const (
	defaultAPIURL = "https://api.x.ai/v1"
	defaultModel  = "grok-4.6"

	botUsername    = "channel-summarizer"
	botDisplayName = "Channel Summarizer"
)

type configuration struct {
	XAIAPIKey string
	XAIAPIURL string
	Model     string
}

// resolve fills empty fields from environment variables and defaults, so the
// plugin works both when configured through the System Console and when the
// server process carries the credentials in its environment.
func (c configuration) resolve() configuration {
	if c.XAIAPIKey == "" {
		c.XAIAPIKey = os.Getenv("XAI_API_KEY")
	}
	if c.XAIAPIURL == "" {
		c.XAIAPIURL = os.Getenv("XAI_API_URL")
	}
	if c.XAIAPIURL == "" {
		c.XAIAPIURL = defaultAPIURL
	}
	if c.Model == "" {
		c.Model = os.Getenv("XAI_MODEL")
	}
	if c.Model == "" {
		c.Model = defaultModel
	}
	return c
}

type Plugin struct {
	plugin.MattermostPlugin

	configurationLock sync.RWMutex
	configuration     *configuration

	botUserID string
}

func (p *Plugin) OnActivate() error {
	botUserID, err := p.API.EnsureBotUser(&model.Bot{
		Username:    botUsername,
		DisplayName: botDisplayName,
		Description: "Summarizes recent channel activity with xAI Grok.",
	})
	if err != nil {
		return errors.Wrap(err, "failed to ensure summarizer bot")
	}
	p.botUserID = botUserID

	if err := p.API.RegisterCommand(summarizeCommand()); err != nil {
		return errors.Wrap(err, "failed to register /"+commandTrigger)
	}
	return nil
}

func (p *Plugin) OnConfigurationChange() error {
	var cfg configuration
	if err := p.API.LoadPluginConfiguration(&cfg); err != nil {
		return errors.Wrap(err, "failed to load plugin configuration")
	}

	p.configurationLock.Lock()
	defer p.configurationLock.Unlock()
	p.configuration = &cfg
	return nil
}

func (p *Plugin) getConfiguration() configuration {
	p.configurationLock.RLock()
	defer p.configurationLock.RUnlock()
	if p.configuration == nil {
		return configuration{}.resolve()
	}
	return p.configuration.resolve()
}

func (p *Plugin) sendEphemeral(userID, channelID, rootID, message string) {
	p.API.SendEphemeralPost(userID, &model.Post{
		UserId:    p.botUserID,
		ChannelId: channelID,
		RootId:    rootID,
		Message:   message,
	})
}

// redactKey keeps log lines useful without ever exposing credentials.
func redactKey(s, key string) string {
	if key == "" {
		return s
	}
	return strings.ReplaceAll(s, key, "[redacted]")
}

func main() {
	plugin.ClientMain(&Plugin{})
}
