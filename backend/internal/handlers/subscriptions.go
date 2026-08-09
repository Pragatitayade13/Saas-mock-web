package handlers

import (
	"nexora/backend/internal/models"
	"nexora/backend/internal/services"
	"nexora/backend/internal/store"

	"github.com/gin-gonic/gin"
)

type SubscriptionHandler struct {
	svc *services.SubscriptionService
}

func NewSubscriptionHandler(svc *services.SubscriptionService) *SubscriptionHandler {
	return &SubscriptionHandler{svc: svc}
}

func (h *SubscriptionHandler) List(c *gin.Context) {
	params := parseQueryParams(c)
	result, err := h.svc.ListSubscriptions(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondList(c, result)
}

func (h *SubscriptionHandler) Get(c *gin.Context) {
	id := c.Param("id")
	sub, err := h.svc.GetSubscription(id)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, sub)
}

func (h *SubscriptionHandler) Create(c *gin.Context) {
	var input models.Subscription
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, store.ErrInvalidInput)
		return
	}
	created, err := h.svc.CreateSubscription(input)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondCreated(c, created)
}

func (h *SubscriptionHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var input models.Subscription
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, store.ErrInvalidInput)
		return
	}
	updated, err := h.svc.UpdateSubscription(id, input)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, updated)
}

func (h *SubscriptionHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeleteSubscription(id); err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, gin.H{"message": "Subscription deleted successfully"})
}

type ChangePlanInput struct {
	Plan models.PlanTier `json:"plan"`
}

func (h *SubscriptionHandler) ChangePlan(c *gin.Context) {
	id := c.Param("id")
	var input ChangePlanInput
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, store.ErrInvalidInput)
		return
	}

	updated, err := h.svc.ChangePlan(id, input.Plan)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, updated)
}

func (h *SubscriptionHandler) Cancel(c *gin.Context) {
	id := c.Param("id")
	updated, err := h.svc.CancelSubscription(id)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, updated)
}

func (h *SubscriptionHandler) GetTransactions(c *gin.Context) {
	id := c.Param("id")
	result, err := h.svc.GetSubscriptionTransactions(id)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondList(c, result)
}

func (h *SubscriptionHandler) GetCustomerSubscription(c *gin.Context) {
	customerID := c.Param("id")
	sub, err := h.svc.GetCustomerSubscription(customerID)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, sub)
}

func (h *SubscriptionHandler) GetPlans(c *gin.Context) {
	plans := models.GetPlanConfigs()
	RespondSuccess(c, plans)
}
