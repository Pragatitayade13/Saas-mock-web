package handlers

import (
	"nexora/backend/internal/models"
	"nexora/backend/internal/services"
	"nexora/backend/internal/store"

	"github.com/gin-gonic/gin"
)

type TransactionHandler struct {
	svc *services.TransactionService
}

func NewTransactionHandler(svc *services.TransactionService) *TransactionHandler {
	return &TransactionHandler{svc: svc}
}

func (h *TransactionHandler) List(c *gin.Context) {
	params := parseQueryParams(c)
	result, err := h.svc.ListTransactions(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondList(c, result)
}

func (h *TransactionHandler) Get(c *gin.Context) {
	id := c.Param("id")
	txn, err := h.svc.GetTransaction(id)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, txn)
}

func (h *TransactionHandler) Create(c *gin.Context) {
	var input models.Transaction
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, store.ErrInvalidInput)
		return
	}
	created, err := h.svc.CreateTransaction(input)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondCreated(c, created)
}

func (h *TransactionHandler) Refund(c *gin.Context) {
	id := c.Param("id")
	refunded, err := h.svc.RefundTransaction(id)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, refunded)
}

func (h *TransactionHandler) GetSummary(c *gin.Context) {
	summary, err := h.svc.GetTransactionSummary()
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, summary)
}

func (h *TransactionHandler) GetRevenueAnalytics(c *gin.Context) {
	rangeParam := c.DefaultQuery("range", "30d")
	analytics, err := h.svc.GetRevenueAnalytics(rangeParam)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, analytics)
}
