package handlers

import (
	"nexora/backend/internal/models"
	"nexora/backend/internal/services"
	"nexora/backend/internal/store"

	"github.com/gin-gonic/gin"
)

type OrganizationHandler struct {
	svc *services.OrganizationService
}

func NewOrganizationHandler(svc *services.OrganizationService) *OrganizationHandler {
	return &OrganizationHandler{svc: svc}
}

func (h *OrganizationHandler) Get(c *gin.Context) {
	org, err := h.svc.GetOrganization()
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, org)
}

func (h *OrganizationHandler) Update(c *gin.Context) {
	var input models.Organization
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, store.ErrInvalidInput)
		return
	}

	userVal, exists := c.Get("currentUser")
	actorName := "Administrator"
	if exists {
		if currentUser, ok := userVal.(models.User); ok {
			actorName = currentUser.Name
		}
	}

	updated, err := h.svc.UpdateOrganization(input, actorName)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, updated)
}
