package handlers

import (
	"nexora/backend/internal/services"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	svc *services.UserService
}

func NewUserHandler(svc *services.UserService) *UserHandler {
	return &UserHandler{svc: svc}
}

func (h *UserHandler) List(c *gin.Context) {
	params := parseQueryParams(c)
	result, err := h.svc.ListUsers(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondList(c, result)
}

func (h *UserHandler) Get(c *gin.Context) {
	id := c.Param("id")
	user, err := h.svc.GetUser(id)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, user)
}
