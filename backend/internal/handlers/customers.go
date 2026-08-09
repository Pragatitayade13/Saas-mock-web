package handlers

import (
	"nexora/backend/internal/models"
	"nexora/backend/internal/services"
	"nexora/backend/internal/store"

	"github.com/gin-gonic/gin"
)

type CustomerHandler struct {
	svc *services.CustomerService
}

func NewCustomerHandler(svc *services.CustomerService) *CustomerHandler {
	return &CustomerHandler{svc: svc}
}

func (h *CustomerHandler) List(c *gin.Context) {
	params := parseQueryParams(c)
	result, err := h.svc.ListCustomers(params)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondList(c, result)
}

func (h *CustomerHandler) Get(c *gin.Context) {
	id := c.Param("id")
	customer, err := h.svc.GetCustomer(id)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, customer)
}

func (h *CustomerHandler) Create(c *gin.Context) {
	var input models.Customer
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, store.ErrInvalidInput)
		return
	}
	created, err := h.svc.CreateCustomer(input)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondCreated(c, created)
}

func (h *CustomerHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var input models.Customer
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, store.ErrInvalidInput)
		return
	}
	updated, err := h.svc.UpdateCustomer(id, input)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, updated)
}

func (h *CustomerHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeleteCustomer(id); err != nil {
		RespondError(c, err)
		return
	}
	RespondSuccess(c, gin.H{"message": "Customer deleted successfully"})
}

func (h *CustomerHandler) GetTransactions(c *gin.Context) {
	id := c.Param("id")
	result, err := h.svc.GetCustomerTransactions(id)
	if err != nil {
		RespondError(c, err)
		return
	}
	RespondList(c, result)
}
