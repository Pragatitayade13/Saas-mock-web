package models

import "time"

type SubscriptionStatus string
type BillingCycle string

const (
	SubscriptionStatusActive    SubscriptionStatus = "Active"
	SubscriptionStatusTrial     SubscriptionStatus = "Trial"
	SubscriptionStatusCancelled SubscriptionStatus = "Cancelled"
	SubscriptionStatusExpired   SubscriptionStatus = "Expired"
	SubscriptionStatusPastDue   SubscriptionStatus = "PastDue"

	BillingCycleMonthly BillingCycle = "Monthly"
	BillingCycleYearly  BillingCycle = "Yearly"
)

type Subscription struct {
	ID              string             `json:"id"`
	CustomerID      string             `json:"customerId"`
	Plan            PlanTier           `json:"plan"`
	Status          SubscriptionStatus `json:"status"`
	Amount          float64            `json:"amount"`
	BillingCycle    BillingCycle       `json:"billingCycle"`
	StartDate       time.Time          `json:"startDate"`
	NextBillingDate time.Time          `json:"nextBillingDate"`
	CreatedAt       time.Time          `json:"createdAt"`
	UpdatedAt       time.Time          `json:"updatedAt"`
}
