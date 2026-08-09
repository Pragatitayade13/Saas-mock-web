package handlers

import (
	"nexora/backend/internal/services"

	"github.com/gin-gonic/gin"
)

type ActivityHandler struct {
	svc *services.ActivityService
}

func NewActivityHandler(svc *services.ActivityService) *ActivityHandler {
	return &ActivityHandler{svc: svc}
}

func (h *ActivityHandler) List(c *gin.Context) {
	params := parseQueryParams(c)
	result, err := h.svc.ListActivities(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondList(c, result)
}

func (h *ActivityHandler) Get(c *gin.Context) {
	id := c.Param("id")
	if id == "summary" {
		h.GetSummary(c)
		return
	}
	act, err := h.svc.GetActivity(id)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, act)
}

func (h *ActivityHandler) GetSummary(c *gin.Context) {
	summary, err := h.svc.GetActivitySummary()
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, summary)
}
