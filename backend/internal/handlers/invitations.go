package handlers

import (
	"nexora/backend/internal/models"
	"nexora/backend/internal/services"
	"nexora/backend/internal/store"

	"github.com/gin-gonic/gin"
)

type InvitationsHandler struct {
	svc *services.InvitationService
}

func NewInvitationsHandler(svc *services.InvitationService) *InvitationsHandler {
	return &InvitationsHandler{svc: svc}
}

func (h *InvitationsHandler) List(c *gin.Context) {
	params := parseQueryParams(c)
	result, err := h.svc.ListInvitations(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondList(c, result)
}

func (h *InvitationsHandler) Create(c *gin.Context) {
	var input models.Invitation
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, store.ErrInvalidInput)
		return
	}

	var actor *models.User
	if userVal, exists := c.Get("currentUser"); exists {
		if currentUser, ok := userVal.(models.User); ok {
			actor = &currentUser
		}
	}

	created, err := h.svc.CreateInvitation(input, actor)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondCreated(c, created)
}

func (h *InvitationsHandler) Revoke(c *gin.Context) {
	id := c.Param("id")
	var actor *models.User
	if userVal, exists := c.Get("currentUser"); exists {
		if currentUser, ok := userVal.(models.User); ok {
			actor = &currentUser
		}
	}

	updated, err := h.svc.RevokeInvitation(id, actor)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, updated)
}

func (h *InvitationsHandler) Resend(c *gin.Context) {
	id := c.Param("id")
	var actor *models.User
	if userVal, exists := c.Get("currentUser"); exists {
		if currentUser, ok := userVal.(models.User); ok {
			actor = &currentUser
		}
	}

	updated, err := h.svc.ResendInvitation(id, actor)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, updated)
}

func (h *InvitationsHandler) GetByToken(c *gin.Context) {
	token := c.Param("token")
	inv, err := h.svc.ListInvitations(models.QueryParams{Limit: 1000})
	if err != nil {
		RespondError(c, err)
		return
	}
	for _, item := range inv.Items {
		if item.Token == token {
			RespondSuccess(c, item)
			return
		}
	}
	RespondError(c, store.ErrNotFound)
}

func (h *InvitationsHandler) Accept(c *gin.Context) {
	token := c.Param("token")
	user, err := h.svc.AcceptInvitation(token)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, user)
}
