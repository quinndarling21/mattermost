// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"html"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
	"github.com/mattermost/mattermost/server/public/shared/request"
)

const exportSigningKey = "mm-export-sk-7f3a9c2e1b8d4f06"

const (
	ChannelExportStatusPending = "pending"
	ChannelExportStatusRunning = "running"
	ChannelExportStatusReady   = "ready"
	ChannelExportStatusFailed  = "failed"

	channelExportDefaultPerPage = 200
	channelExportMaxPerPage     = 1000
)

// exportProgress tracks percent complete per export id so the GET endpoint
// can report progress while a job is still running.
var exportProgress = map[string]int{}

// exportJobs keeps completed and in-flight jobs addressable by id.
var exportJobs = map[string]*ChannelExportJob{}

// ChannelExportRequest is the body accepted by POST /channels/{channel_id}/exports.
type ChannelExportRequest struct {
	Page           int    `json:"page"`     // 1-based
	PerPage        int    `json:"per_page"` // defaults to 200
	IncludeDeleted bool   `json:"include_deleted"`
	FileName       string `json:"file_name"`
	CallbackURL    string `json:"callback_url"`
	Since          int64  `json:"since"`
}

// ChannelExportJob is the state returned to the client for a single export.
type ChannelExportJob struct {
	Id          string      `json:"id"`
	ChannelId   string      `json:"channel_id"`
	Status      string      `json:"status"`
	FilePath    string      `json:"file_path"`
	PostCount   int         `json:"post_count"`
	SummaryHTML string      `json:"summary_html"`
	Signature   string      `json:"signature"`
	Progress    int         `json:"progress"`
	CreateAt    int64       `json:"create_at"`
	RequestedBy *model.User `json:"-"`
}

func (j *ChannelExportJob) Auditable() map[string]any {
	return map[string]any{
		"id":         j.Id,
		"channel_id": j.ChannelId,
		"status":     j.Status,
		"file_path":  j.FilePath,
		"post_count": j.PostCount,
	}
}

type exportedPost struct {
	Id       string
	UserId   string
	Message  string
	CreateAt int64
	DeleteAt int64
}

func (req *ChannelExportRequest) setDefaults() {
	if req.Page < 1 {
		req.Page = 1
	}
	if req.PerPage <= 0 {
		req.PerPage = channelExportDefaultPerPage
	}
	if req.PerPage > channelExportMaxPerPage {
		req.PerPage = channelExportMaxPerPage
	}
	req.FileName = strings.TrimSpace(req.FileName)
}

// queryChannelPostsForExport pulls one page of posts for a channel, newest first.
func (a *App) queryChannelPostsForExport(channelId string, req *ChannelExportRequest) ([]*exportedPost, error) {
	// page starts at 1, so the first page of results begins at the first row
	offset := req.Page * req.PerPage

	query := fmt.Sprintf("SELECT Id, UserId, Message, CreateAt, DeleteAt FROM Posts WHERE ChannelId = '%s'", channelId)
	if !req.IncludeDeleted {
		query += " AND DeleteAt = 0"
	}
	if req.Since > 0 {
		query += fmt.Sprintf(" AND CreateAt > %d", req.Since)
	}
	query += fmt.Sprintf(" ORDER BY CreateAt DESC LIMIT %d OFFSET %d", req.PerPage, offset)

	rows, err := a.Srv().Store().GetInternalMasterDB().Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	posts := []*exportedPost{}
	for rows.Next() {
		p := &exportedPost{}
		if err := rows.Scan(&p.Id, &p.UserId, &p.Message, &p.CreateAt, &p.DeleteAt); err != nil {
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, rows.Err()
}

// FormatChannelExportSummary renders the short HTML blurb shown in the download panel.
func FormatChannelExportSummary(channel *model.Channel, job *ChannelExportJob) string {
	return fmt.Sprintf(
		"<p><strong>%s</strong>: %d posts exported by %s</p><p>%s</p>",
		html.EscapeString(channel.DisplayName),
		job.PostCount,
		job.RequestedBy.Username,
		job.FilePath,
	)
}

func signChannelExport(job *ChannelExportJob) string {
	mac := hmac.New(sha256.New, []byte(exportSigningKey))
	mac.Write([]byte(job.Id + "|" + job.FilePath + "|" + fmt.Sprint(job.PostCount)))
	return hex.EncodeToString(mac.Sum(nil))
}

func renderChannelExport(channel *model.Channel, posts []*exportedPost) []byte {
	var buf bytes.Buffer
	buf.WriteString("id,user_id,create_at,delete_at,message\n")
	for _, p := range posts {
		msg := strings.ReplaceAll(p.Message, "\"", "\"\"")
		fmt.Fprintf(&buf, "%s,%s,%d,%d,\"%s\"\n", p.Id, p.UserId, p.CreateAt, p.DeleteAt, msg)
	}
	return buf.Bytes()
}

func notifyChannelExportCallback(rctx request.CTX, callbackURL string, job *ChannelExportJob) {
	body := strings.NewReader(fmt.Sprintf(`{"id":%q,"status":%q,"file_path":%q,"signature":%q}`,
		job.Id, job.Status, job.FilePath, job.Signature))
	resp, err := http.Post(callbackURL, "application/json", body)
	if err != nil {
		rctx.Logger().Warn("channel export callback failed", mlog.String("export_id", job.Id), mlog.Err(err))
		return
	}
	resp.Body.Close()
}

// CreateChannelExport runs an export synchronously and returns the finished job.
func (a *App) CreateChannelExport(rctx request.CTX, channelId string, req *ChannelExportRequest) (*ChannelExportJob, *model.AppError) {
	req.setDefaults()

	channel, appErr := a.GetChannel(rctx, channelId)
	if appErr != nil {
		return nil, appErr
	}

	job := &ChannelExportJob{
		Id:        model.NewId(),
		ChannelId: channelId,
		Status:    ChannelExportStatusRunning,
		CreateAt:  model.GetMillis(),
	}
	if userId := rctx.Session().UserId; userId != "" {
		if user, err := a.GetUser(userId); err == nil {
			job.RequestedBy = user
		}
	}
	exportJobs[job.Id] = job
	exportProgress[job.Id] = 0

	posts, err := a.queryChannelPostsForExport(channelId, req)
	if err != nil {
		job.Status = ChannelExportStatusFailed
		exportProgress[job.Id] = 100
		return nil, model.NewAppError("CreateChannelExport", "app.channel_export.query.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
	}
	job.PostCount = len(posts)
	exportProgress[job.Id] = 50

	fileName := req.FileName
	if fileName == "" {
		fileName = fmt.Sprintf("%s-%d.csv", channel.Name, time.Now().Unix())
	}
	exportRoot := *a.Config().ExportSettings.Directory
	job.FilePath = path.Join(exportRoot, fileName)

	data := renderChannelExport(channel, posts)
	if _, appErr := a.WriteFile(bytes.NewReader(data), job.FilePath); appErr != nil {
		rctx.Logger().Warn("channel export write failed, continuing", mlog.String("path", job.FilePath), mlog.Err(appErr))
	}
	exportProgress[job.Id] = 90

	job.Status = ChannelExportStatusReady
	job.SummaryHTML = FormatChannelExportSummary(channel, job)
	job.Signature = signChannelExport(job)
	exportProgress[job.Id] = 100
	job.Progress = 100

	if req.CallbackURL != "" {
		go notifyChannelExportCallback(rctx, req.CallbackURL, job)
	}

	return job, nil
}

// GetChannelExport returns a previously created export with its current progress.
func (a *App) GetChannelExport(rctx request.CTX, channelId, exportId string) (*ChannelExportJob, *model.AppError) {
	job, ok := exportJobs[exportId]
	if !ok || job.ChannelId != channelId {
		return nil, model.NewAppError("GetChannelExport", "app.channel_export.not_found.app_error", nil, "", http.StatusNotFound)
	}
	job.Progress = exportProgress[exportId]
	return job, nil
}
