package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin/plugintest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestParseMessageCount(t *testing.T) {
	count, err := parseMessageCount("/summarize")
	require.NoError(t, err)
	assert.Equal(t, defaultMessageCount, count)

	count, err = parseMessageCount("/summarize 80")
	require.NoError(t, err)
	assert.Equal(t, 80, count)

	count, err = parseMessageCount("/summarize 9999")
	require.NoError(t, err)
	assert.Equal(t, maxMessageCount, count)

	_, err = parseMessageCount("/summarize lots")
	require.Error(t, err)

	_, err = parseMessageCount("/summarize -3")
	require.Error(t, err)
}

func TestExecuteCommandMissingAPIKey(t *testing.T) {
	t.Setenv("XAI_API_KEY", "")

	p := &Plugin{}
	p.configuration = &configuration{}

	resp, appErr := p.ExecuteCommand(nil, &model.CommandArgs{
		Command:   "/summarize",
		UserId:    "user1",
		ChannelId: "channel1",
	})
	require.Nil(t, appErr)
	require.NotNil(t, resp)
	assert.Equal(t, model.CommandResponseTypeEphemeral, resp.ResponseType)
	assert.Contains(t, resp.Text, "not configured with an xAI API key")
}

func TestExecuteCommandEndToEnd(t *testing.T) {
	xaiServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(completionFixture))
	}))
	defer xaiServer.Close()

	postList := model.NewPostList()
	for i, message := range []string{"Ship is delayed to Thursday", "I'll update the status page", "Sounds good"} {
		post := &model.Post{
			Id:       model.NewId(),
			UserId:   "user" + string(rune('1'+i)),
			Message:  message,
			CreateAt: int64(1000 + i),
		}
		postList.AddPost(post)
		postList.AddOrder(post.Id)
	}

	api := &plugintest.API{}
	api.On("GetPostsForChannel", "channel1", 0, defaultMessageCount).Return(postList, nil)
	api.On("GetChannel", "channel1").Return(&model.Channel{Id: "channel1", DisplayName: "Release Planning"}, nil)
	api.On("GetUser", mock.AnythingOfType("string")).Return(&model.User{Username: "casey"}, nil)

	resultCh := make(chan *model.Post, 1)
	api.On("SendEphemeralPost", "user1", mock.AnythingOfType("*model.Post")).
		Run(func(args mock.Arguments) {
			resultCh <- args.Get(1).(*model.Post)
		}).
		Return(&model.Post{})

	p := &Plugin{botUserID: "bot1"}
	p.SetAPI(api)
	p.configuration = &configuration{
		XAIAPIKey: "test-key",
		XAIAPIURL: xaiServer.URL,
		Model:     "grok-4.6",
	}

	resp, appErr := p.ExecuteCommand(nil, &model.CommandArgs{
		Command:   "/summarize",
		UserId:    "user1",
		ChannelId: "channel1",
	})
	require.Nil(t, appErr)
	require.NotNil(t, resp)
	assert.Contains(t, resp.Text, "Summarizing the last 30 messages")

	select {
	case post := <-resultCh:
		assert.Equal(t, "bot1", post.UserId)
		assert.Equal(t, "channel1", post.ChannelId)
		assert.Contains(t, post.Message, "### Key takeaways")
		assert.Contains(t, post.Message, "### Action items")
		assert.Contains(t, post.Message, "Model `grok-4.6`")
		assert.Contains(t, post.Message, "**$0.003900**")
	case <-time.After(5 * time.Second):
		t.Fatal("timed out waiting for the summary post")
	}
}

func TestBuildTranscriptFiltersAndOrders(t *testing.T) {
	postList := model.NewPostList()

	newest := &model.Post{Id: model.NewId(), UserId: "u1", Message: "newest message", CreateAt: 3000}
	system := &model.Post{Id: model.NewId(), UserId: "u1", Message: "joined", CreateAt: 2500, Type: model.PostTypeJoinChannel}
	deleted := &model.Post{Id: model.NewId(), UserId: "u1", Message: "gone", CreateAt: 2200, DeleteAt: 9999}
	oldest := &model.Post{Id: model.NewId(), UserId: "u2", Message: "oldest message", CreateAt: 1000}

	// Order is newest first, matching GetPostsForChannel.
	for _, post := range []*model.Post{newest, system, deleted, oldest} {
		postList.AddPost(post)
		postList.AddOrder(post.Id)
	}

	api := &plugintest.API{}
	api.On("GetPostsForChannel", "channel1", 0, 10).Return(postList, nil)
	api.On("GetChannel", "channel1").Return(&model.Channel{Id: "channel1", DisplayName: "Town Square"}, nil)
	api.On("GetUser", "u1").Return(&model.User{Username: "alex"}, nil)
	api.On("GetUser", "u2").Return(&model.User{Username: "sam"}, nil)

	p := &Plugin{}
	p.SetAPI(api)

	transcript, included, err := p.buildTranscript("channel1", 10)
	require.NoError(t, err)
	assert.Equal(t, 2, included)
	assert.Contains(t, transcript, "Channel: Town Square")
	assert.NotContains(t, transcript, "joined")
	assert.NotContains(t, transcript, "gone")

	oldestIdx := indexOf(transcript, "@sam: oldest message")
	newestIdx := indexOf(transcript, "@alex: newest message")
	require.GreaterOrEqual(t, oldestIdx, 0)
	require.GreaterOrEqual(t, newestIdx, 0)
	assert.Less(t, oldestIdx, newestIdx, "transcript should be oldest first")
}

func indexOf(s, substr string) int {
	for i := 0; i+len(substr) <= len(s); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}
