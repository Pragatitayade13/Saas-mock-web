package models

import "time"

type TransactionStatus string
type TransactionType string

const (
	TransactionStatusCompleted TransactionStatus = "Completed"
	TransactionStatusPending   TransactionStatus = "Pending"
	TransactionStatusFailed    TransactionStatus = "Failed"
	TransactionStatusRefunded  TransactionStatus = "Refunded"

	TransactionTypeSubscription TransactionType = "Subscription"
	TransactionTypeUpgrade      TransactionType = "Upgrade"
	TransactionTypeDowngrade    TransactionType = "Downgrade"
	TransactionTypeRefund       TransactionType = "Refund"
	TransactionTypeCredit       TransactionType = "Credit"
	TransactionTypeAdjustment   TransactionType = "Adjustment"
)

type Transaction struct {
	ID                    string            `json:"id"`
	CustomerID            string            `json:"customerId"`
	SubscriptionID        string            `json:"subscriptionId,omitempty"`
	Amount                float64           `json:"amount"`
	Currency              string            `json:"currency"`
	Status                TransactionStatus `json:"status"`
	Type                  TransactionType   `json:"type"`
	PaymentMethod         string            `json:"paymentMethod"`
	Description           string            `json:"description,omitempty"`
	TransactionDate       time.Time         `json:"transactionDate"`
	OriginalTransactionID string            `json:"originalTransactionId,omitempty"`
	CreatedAt             time.Time         `json:"createdAt"`
	UpdatedAt             time.Time         `json:"updatedAt"`
}

type TransactionSummary struct {
	TotalRevenue           float64 `json:"totalRevenue"`
	SuccessfulTransactions int     `json:"successfulTransactions"`
	PendingAmount          float64 `json:"pendingAmount"`
	RefundedAmount         float64 `json:"refundedAmount"`
}

type RevenueTimePoint struct {
	Date    string  `json:"date"`
	Revenue float64 `json:"revenue"`
}

type RevenuePlanPoint struct {
	Plan    PlanTier `json:"plan"`
	Revenue float64  `json:"revenue"`
}

type RevenueMethodPoint struct {
	PaymentMethod string  `json:"paymentMethod"`
	Revenue       float64 `json:"revenue"`
}

type RevenueAnalytics struct {
	Daily           []RevenueTimePoint   `json:"daily"`
	Monthly         []RevenueTimePoint   `json:"monthly"`
	ByPlan          []RevenuePlanPoint   `json:"byPlan"`
	ByPaymentMethod []RevenueMethodPoint `json:"byPaymentMethod"`
}
