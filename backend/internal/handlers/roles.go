package handlers

import (
	"nexora/backend/internal/services"

	"github.com/gin-gonic/gin"
)

type RolesHandler struct {
	svc *services.RoleService
}

func NewRolesHandler(svc *services.RoleService) *RolesHandler {
	return &RolesHandler{svc: svc}
}

func (h *RolesHandler) List(c *gin.Context) {
	roles, err := h.svc.ListRoles()
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, roles)
}

func (h *RolesHandler) GetMatrix(c *gin.Context) {
	matrix, err := h.svc.GetPermissionMatrix()
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, matrix)
}
