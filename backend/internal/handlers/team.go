package handlers

import (
	"nexora/backend/internal/models"
	"nexora/backend/internal/services"
	"nexora/backend/internal/store"

	"github.com/gin-gonic/gin"
)

type TeamHandler struct {
	svc *services.TeamService
}

func NewTeamHandler(svc *services.TeamService) *TeamHandler {
	return &TeamHandler{svc: svc}
}

func (h *TeamHandler) List(c *gin.Context) {
	params := parseQueryParams(c)
	result, err := h.svc.ListMembers(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondList(c, result)
}

func (h *TeamHandler) Get(c *gin.Context) {
	id := c.Param("id")
	user, err := h.svc.GetMember(id)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, user)
}

type UpdateRoleInput struct {
	Role models.UserRole `json:"role"`
}

func (h *TeamHandler) UpdateRole(c *gin.Context) {
	id := c.Param("id")
	var input UpdateRoleInput
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

	updated, err := h.svc.UpdateRole(id, input.Role, actor)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, updated)
}

type UpdateStatusInput struct {
	Status models.UserStatus `json:"status"`
}

func (h *TeamHandler) UpdateStatus(c *gin.Context) {
	id := c.Param("id")
	var input UpdateStatusInput
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

	updated, err := h.svc.UpdateStatus(id, input.Status, actor)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, updated)
}
