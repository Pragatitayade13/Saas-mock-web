package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"

	"github.com/gin-gonic/gin"
)

func parseQueryParams(c *gin.Context) models.QueryParams {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	var readPtr *bool
	if readStr := c.Query("read"); readStr != "" {
		readBool, err := strconv.ParseBool(readStr)
		if err == nil {
			readPtr = &readBool
		}
	}

	return models.QueryParams{
		Search:       c.Query("search"),
		Status:       c.Query("status"),
		Plan:         c.Query("plan"),
		Location:     c.Query("location"),
		BillingCycle: c.Query("billingCycle"),
		CustomerID:   c.Query("customerId"),
		Type:         c.Query("type"),
		Read:         readPtr,
		Page:         page,
		Limit:        limit,
		SortBy:       c.Query("sortBy"),
		SortOrder:    c.Query("sortOrder"),
	}
}

func RespondSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}

func RespondCreated(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    data,
	})
}

func RespondList[T any](c *gin.Context, list models.PaginatedList[T]) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    list.Items,
		"meta":    list.Meta,
	})
}

func RespondError(c *gin.Context, err error) {
	status := http.StatusInternalServerError
	code := "INTERNAL_ERROR"
	message := err.Error()

	if errors.Is(err, store.ErrCustomerNotFound) {
		status = http.StatusNotFound
		code = "CUSTOMER_NOT_FOUND"
	} else if errors.Is(err, store.ErrSubscriptionNotFound) {
		status = http.StatusNotFound
		code = "SUBSCRIPTION_NOT_FOUND"
	} else if errors.Is(err, store.ErrTransactionNotFound) {
		status = http.StatusNotFound
		code = "TRANSACTION_NOT_FOUND"
	} else if errors.Is(err, store.ErrUserNotFound) {
		status = http.StatusNotFound
		code = "USER_NOT_FOUND"
	} else if errors.Is(err, store.ErrNotificationNotFound) {
		status = http.StatusNotFound
		code = "NOTIFICATION_NOT_FOUND"
	} else if errors.Is(err, store.ErrNotFound) {
		status = http.StatusNotFound
		code = "NOT_FOUND"
	} else if errors.Is(err, store.ErrInvalidInput) {
		status = http.StatusBadRequest
		code = "INVALID_INPUT"
	} else if errors.Is(err, store.ErrCustomerEmailExists) {
		status = http.StatusConflict
		code = "CUSTOMER_EMAIL_EXISTS"
		message = "A customer with this email already exists."
	} else if errors.Is(err, store.ErrCustomerHasDependencies) || errors.Is(err, store.ErrConflict) {
		status = http.StatusConflict
		code = "CUSTOMER_HAS_DEPENDENCIES"
		message = "This customer cannot be deleted because related subscriptions or transactions exist."
	} else if errors.Is(err, store.ErrActiveSubscriptionExists) {
		status = http.StatusConflict
		code = "ACTIVE_SUBSCRIPTION_EXISTS"
		message = "This customer already has an active subscription."
	} else if errors.Is(err, store.ErrInvalidStatusTransition) {
		status = http.StatusBadRequest
		code = "INVALID_STATUS_TRANSITION"
		message = "Invalid subscription status transition."
	} else if errors.Is(err, store.ErrTransactionNotRefundable) {
		status = http.StatusConflict
		code = "TRANSACTION_NOT_REFUNDABLE"
		message = "Only completed transactions can be refunded."
	} else if errors.Is(err, store.ErrAlreadyRefunded) {
		status = http.StatusConflict
		code = "ALREADY_REFUNDED"
		message = "This transaction has already been refunded."
	}

	c.JSON(status, models.APIErrorResponse{
		Success: false,
		Error: models.APIErrorDetails{
			Code:    code,
			Message: message,
		},
	})
}
