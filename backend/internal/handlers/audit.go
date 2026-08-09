package handlers

import (
	"nexora/backend/internal/services"

	"github.com/gin-gonic/gin"
)

type AuditHandler struct {
	svc *services.AuditService
}

func NewAuditHandler(svc *services.AuditService) *AuditHandler {
	return &AuditHandler{svc: svc}
}

func (h *AuditHandler) List(c *gin.Context) {
	params := parseQueryParams(c)
	result, err := h.svc.ListAuditLogs(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondList(c, result)
}

func (h *AuditHandler) Get(c *gin.Context) {
	id := c.Param("id")
	if id == "summary" {
		h.GetSummary(c)
		return
	}
	log, err := h.svc.GetAuditLog(id)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, log)
}

func (h *AuditHandler) GetSummary(c *gin.Context) {
	summary, err := h.svc.GetAuditSummary()
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, summary)
}
