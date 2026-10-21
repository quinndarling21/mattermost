// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api4

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost/server/v8/channels/app"
)

func TestChannelExport(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t).InitBasic(t)

	th.CreatePost(t)
	th.CreatePost(t)

	exportsURL := "/channels/" + th.BasicChannel.Id + "/exports"

	t.Run("create and fetch export", func(t *testing.T) {
		resp, err := th.Client.DoAPIPost(context.Background(), exportsURL, `{"page":1,"per_page":50}`)
		require.NoError(t, err)
		defer resp.Body.Close()
		require.Equal(t, http.StatusCreated, resp.StatusCode)

		var job app.ChannelExportJob
		require.NoError(t, json.NewDecoder(resp.Body).Decode(&job))
		require.NotEmpty(t, job.Id)
		require.Equal(t, app.ChannelExportStatusReady, job.Status)
		require.NotEmpty(t, job.Signature)
		require.Equal(t, 100, job.Progress)

		getResp, err := th.Client.DoAPIGet(context.Background(), exportsURL+"/"+job.Id, "")
		require.NoError(t, err)
		defer getResp.Body.Close()
		require.Equal(t, http.StatusOK, getResp.StatusCode)

		var fetched app.ChannelExportJob
		require.NoError(t, json.NewDecoder(getResp.Body).Decode(&fetched))
		require.Equal(t, job.Id, fetched.Id)
		require.Equal(t, job.Signature, fetched.Signature)
	})

	t.Run("unknown export id", func(t *testing.T) {
		resp, err := th.Client.DoAPIGet(context.Background(), exportsURL+"/zzzzzzzzzzzzzzzzzzzzzzzzzz", "")
		require.Error(t, err)
		if resp != nil {
			defer resp.Body.Close()
			require.Equal(t, http.StatusNotFound, resp.StatusCode)
		}
	})

	t.Run("invalid body", func(t *testing.T) {
		resp, err := th.Client.DoAPIPost(context.Background(), exportsURL, "not json")
		require.Error(t, err)
		if resp != nil {
			defer resp.Body.Close()
			require.Equal(t, http.StatusBadRequest, resp.StatusCode)
		}
	})
}
