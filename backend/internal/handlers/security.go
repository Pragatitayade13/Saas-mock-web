package handlers

import (
	"nexora/backend/internal/models"
	"nexora/backend/internal/services"
	"nexora/backend/internal/store"

	"github.com/gin-gonic/gin"
)

type SecurityHandler struct {
	svc *services.SecurityService
}

func NewSecurityHandler(svc *services.SecurityService) *SecurityHandler {
	return &SecurityHandler{svc: svc}
}

func (h *SecurityHandler) ListSessions(c *gin.Context) {
	userVal, exists := c.Get("currentUser")
	if !exists {
		RespondError(c, store.ErrUnauthorized)
		return
	}
	currentUser := userVal.(models.User)

	currentSessionID := ""
	if sessVal, ok := c.Get("currentSession"); ok {
		if sess, ok2 := sessVal.(models.Session); ok2 {
			currentSessionID = sess.ID
		}
	}

	sessions, err := h.svc.GetActiveSessions(currentUser.ID, currentSessionID)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, sessions)
}

func (h *SecurityHandler) RevokeOtherSessions(c *gin.Context) {
	userVal, exists := c.Get("currentUser")
	if !exists {
		RespondError(c, store.ErrUnauthorized)
		return
	}
	currentUser := userVal.(models.User)

	currentSessionID := ""
	if sessVal, ok := c.Get("currentSession"); ok {
		if sess, ok2 := sessVal.(models.Session); ok2 {
			currentSessionID = sess.ID
		}
	}

	if err := h.svc.RevokeOtherSessions(currentUser.ID, currentSessionID, currentUser.Name); err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, gin.H{"message": "Other active browser sessions have been signed out."})
}
