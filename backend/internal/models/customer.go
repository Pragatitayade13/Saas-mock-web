package models

import "time"

type CustomerStatus string
type PlanTier string

const (
	CustomerStatusActive   CustomerStatus = "Active"
	CustomerStatusInactive CustomerStatus = "Inactive"
	CustomerStatusTrial    CustomerStatus = "Trial"
	CustomerStatusSuspended CustomerStatus = "Suspended"

	PlanFree         PlanTier = "Free"
	PlanStarter      PlanTier = "Starter"
	PlanProfessional PlanTier = "Professional"
	PlanEnterprise   PlanTier = "Enterprise"
)

type Customer struct {
	ID             string         `json:"id"`
	Name           string         `json:"name"`
	Email          string         `json:"email"`
	Company        string         `json:"company"`
	Avatar         string         `json:"avatar"`
	Plan           PlanTier       `json:"plan"`
	Status         CustomerStatus `json:"status"`
	MonthlyRevenue float64        `json:"monthlyRevenue"`
	Location       string         `json:"location"`
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
}
