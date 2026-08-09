package handlers

import (
	"net/http"

	"nexora/backend/internal/services"

	"github.com/gin-gonic/gin"
)

type AnalyticsHandler struct {
	svc *services.AnalyticsService
}

func NewAnalyticsHandler(svc *services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{svc: svc}
}

func (h *AnalyticsHandler) GetSummary(c *gin.Context) {
	params := parseQueryParams(c)
	summary, err := h.svc.GetSummary(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, summary)
}

func (h *AnalyticsHandler) GetRevenue(c *gin.Context) {
	params := parseQueryParams(c)
	trend, err := h.svc.GetRevenueTrend(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, trend)
}

func (h *AnalyticsHandler) GetCustomerAnalytics(c *gin.Context) {
	params := parseQueryParams(c)
	custData, err := h.svc.GetCustomerAnalytics(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, custData)
}

func (h *AnalyticsHandler) GetCustomerGrowth(c *gin.Context) {
	params := parseQueryParams(c)
	growth, err := h.svc.GetCustomerGrowth(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, growth)
}

func (h *AnalyticsHandler) GetSubscriptionAnalytics(c *gin.Context) {
	params := parseQueryParams(c)
	subData, err := h.svc.GetSubscriptionAnalytics(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, subData)
}

func (h *AnalyticsHandler) GetMRR(c *gin.Context) {
	params := parseQueryParams(c)
	mrr, err := h.svc.GetMRR(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, mrr)
}

func (h *AnalyticsHandler) GetChurn(c *gin.Context) {
	params := parseQueryParams(c)
	churn, err := h.svc.GetChurn(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, churn)
}

func (h *AnalyticsHandler) GetTransactionAnalytics(c *gin.Context) {
	params := parseQueryParams(c)
	txnData, err := h.svc.GetTransactionAnalytics(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, txnData)
}

func (h *AnalyticsHandler) GetTopCustomers(c *gin.Context) {
	params := parseQueryParams(c)
	top, err := h.svc.GetTopCustomers(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, top)
}

func (h *AnalyticsHandler) GetTopPlans(c *gin.Context) {
	params := parseQueryParams(c)
	topPlans, err := h.svc.GetTopPlans(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, topPlans)
}

func (h *AnalyticsHandler) ExportReport(c *gin.Context) {
	params := parseQueryParams(c)
	csvData, err := h.svc.GenerateReportCSV(params)
	if err != nil {
		RespondError(c, err)
		return
	}

	c.Header("Content-Disposition", "attachment; filename=nexora_analytics_report.csv")
	c.Data(http.StatusOK, "text/csv", []byte(csvData))
}
