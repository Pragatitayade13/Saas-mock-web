package models

import "time"

type QueryParams struct {
	Search         string    `json:"search,omitempty"`
	Status         string    `json:"status,omitempty"`
	Plan           string    `json:"plan,omitempty"`
	Location       string    `json:"location,omitempty"`
	BillingCycle   string    `json:"billingCycle,omitempty"`
	CustomerID     string    `json:"customerId,omitempty"`
	SubscriptionID string    `json:"subscriptionId,omitempty"`
	Type           string    `json:"type,omitempty"`
	PaymentMethod  string    `json:"paymentMethod,omitempty"`
	MinAmount      float64   `json:"minAmount,omitempty"`
	MaxAmount      float64   `json:"maxAmount,omitempty"`
	StartDate      time.Time `json:"startDate,omitempty"`
	EndDate        time.Time `json:"endDate,omitempty"`
	Action         string    `json:"action,omitempty"`
	EntityType     string    `json:"entityType,omitempty"`
	ActorID        string    `json:"actorId,omitempty"`
	Severity       string    `json:"severity,omitempty"`
	Result         string    `json:"result,omitempty"`
	Read           *bool     `json:"read,omitempty"`
	Page           int       `json:"page"`
	Limit          int       `json:"limit"`
	SortBy         string    `json:"sortBy,omitempty"`
	SortOrder      string    `json:"sortOrder,omitempty"`
}

type PaginationMeta struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"totalPages"`
}

type PaginatedList[T any] struct {
	Items []T            `json:"items"`
	Meta  PaginationMeta `json:"meta"`
}
