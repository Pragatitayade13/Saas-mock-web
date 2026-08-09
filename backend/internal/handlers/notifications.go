package handlers

import (
	"nexora/backend/internal/services"

	"github.com/gin-gonic/gin"
)

type NotificationHandler struct {
	svc *services.NotificationService
}

func NewNotificationHandler(svc *services.NotificationService) *NotificationHandler {
	return &NotificationHandler{svc: svc}
}

func (h *NotificationHandler) List(c *gin.Context) {
	params := parseQueryParams(c)
	result, err := h.svc.ListNotifications(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondList(c, result)
}

func (h *NotificationHandler) MarkRead(c *gin.Context) {
	id := c.Param("id")
	notif, err := h.svc.MarkNotificationRead(id)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, notif)
}

func (h *NotificationHandler) MarkUnread(c *gin.Context) {
	id := c.Param("id")
	notif, err := h.svc.MarkNotificationUnread(id)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, notif)
}

func (h *NotificationHandler) MarkAllRead(c *gin.Context) {
	userID := c.Query("userId")
	updated, err := h.svc.MarkAllNotificationsRead(userID)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, updated)
}
