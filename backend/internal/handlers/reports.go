package handlers

import (
	"fmt"
	"net/http"

	"nexora/backend/internal/models"
	"nexora/backend/internal/services"
	"nexora/backend/internal/store"

	"github.com/gin-gonic/gin"
)

type ReportsHandler struct {
	svc *services.ReportService
}

func NewReportsHandler(svc *services.ReportService) *ReportsHandler {
	return &ReportsHandler{svc: svc}
}

func (h *ReportsHandler) ListReports(c *gin.Context) {
	params := parseQueryParams(c)
	result, err := h.svc.ListReports(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondList(c, result)
}

func (h *ReportsHandler) GetReport(c *gin.Context) {
	id := c.Param("id")
	if id == "summary" {
		h.GetSummary(c)
		return
	}
	rpt, err := h.svc.GetReport(id)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, rpt)
}

func (h *ReportsHandler) CreateReport(c *gin.Context) {
	var input models.Report
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, store.ErrInvalidInput)
		return
	}
	created, err := h.svc.CreateReport(input)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondCreated(c, created)
}

func (h *ReportsHandler) DownloadReport(c *gin.Context) {
	id := c.Param("id")
	csvContent, err := h.svc.GenerateCSV(id)
	if err != nil {
		RespondError(c, err)
		return
	}

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s_report.csv", id))
	c.Data(http.StatusOK, "text/csv", []byte(csvContent))
}

func (h *ReportsHandler) DeleteReport(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeleteReport(id); err != nil {
		RespondError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *ReportsHandler) GetSummary(c *gin.Context) {
	summary, err := h.svc.GetReportSummary()
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, summary)
}
