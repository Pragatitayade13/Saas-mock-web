package handlers

import (
	"nexora/backend/internal/services"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	svc *services.DashboardService
}

func NewDashboardHandler(svc *services.DashboardService) *DashboardHandler {
	return &DashboardHandler{svc: svc}
}

func (h *DashboardHandler) GetDashboard(c *gin.Context) {
	data, err := h.svc.GetDashboardData()
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, data)
}
