package services

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

const LargeTransactionThreshold = 1000.0

type TransactionService struct {
	st store.Store
}

func NewTransactionService(st store.Store) *TransactionService {
	return &TransactionService{st: st}
}

func isValidTxnType(t models.TransactionType) bool {
	switch t {
	case models.TransactionTypeSubscription, models.TransactionTypeUpgrade, models.TransactionTypeDowngrade, models.TransactionTypeRefund, models.TransactionTypeCredit, models.TransactionTypeAdjustment:
		return true
	default:
		return false
	}
}

func isValidTxnStatus(s models.TransactionStatus) bool {
	switch s {
	case models.TransactionStatusCompleted, models.TransactionStatusPending, models.TransactionStatusFailed, models.TransactionStatusRefunded:
		return true
	default:
		return false
	}
}

func (s *TransactionService) GetTransaction(id string) (models.Transaction, error) {
	if strings.TrimSpace(id) == "" {
		return models.Transaction{}, store.ErrInvalidInput
	}
	return s.st.GetTransaction(id)
}

func (s *TransactionService) ListTransactions(params models.QueryParams) (models.PaginatedList[models.Transaction], error) {
	return s.st.ListTransactions(params)
}

func (s *TransactionService) CreateTransaction(txn models.Transaction) (models.Transaction, error) {
	txn.CustomerID = strings.TrimSpace(txn.CustomerID)
	if txn.CustomerID == "" {
		return models.Transaction{}, fmt.Errorf("%w: customerId is required", store.ErrInvalidInput)
	}

	cust, err := s.st.GetCustomer(txn.CustomerID)
	if err != nil {
		return models.Transaction{}, err
	}

	if txn.SubscriptionID != "" {
		if _, err := s.st.GetSubscription(txn.SubscriptionID); err != nil {
			return models.Transaction{}, err
		}
	}

	if txn.Amount < 0 {
		return models.Transaction{}, fmt.Errorf("%w: transaction amount cannot be negative", store.ErrInvalidInput)
	}

	if txn.Currency == "" {
		txn.Currency = "USD"
	}

	if txn.Type == "" {
		txn.Type = models.TransactionTypeSubscription
	} else if !isValidTxnType(txn.Type) {
		return models.Transaction{}, fmt.Errorf("%w: invalid transaction type", store.ErrInvalidInput)
	}

	if txn.Status == "" {
		txn.Status = models.TransactionStatusCompleted
	} else if !isValidTxnStatus(txn.Status) {
		return models.Transaction{}, fmt.Errorf("%w: invalid transaction status", store.ErrInvalidInput)
	}

	if txn.PaymentMethod == "" {
		txn.PaymentMethod = "Card"
	}

	if txn.TransactionDate.IsZero() {
		txn.TransactionDate = time.Now().UTC()
	}

	created, err := s.st.CreateTransaction(txn)
	if err != nil {
		return models.Transaction{}, err
	}

	// Create Standard Payment Notification
	if created.Status == models.TransactionStatusCompleted {
		_, _ = s.st.CreateNotification(models.Notification{
			Type:    models.NotificationTypePayment,
			Title:   "Payment received",
			Message: fmt.Sprintf("%s completed a $%.2f %s payment.", cust.Name, created.Amount, created.Type),
			Read:    false,
		})

		// Create Large Payment Notification if threshold met
		if created.Amount >= LargeTransactionThreshold {
			_, _ = s.st.CreateNotification(models.Notification{
				Type:    models.NotificationTypePayment,
				Title:   "Large payment received",
				Message: fmt.Sprintf("Large payment of $%.2f received from %s.", created.Amount, cust.Company),
				Read:    false,
			})
		}
	}

	return created, nil
}

func (s *TransactionService) RefundTransaction(id string) (models.Transaction, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return models.Transaction{}, store.ErrInvalidInput
	}

	original, err := s.st.GetTransaction(id)
	if err != nil {
		return models.Transaction{}, err
	}

	// Only Completed transactions can be refunded
	if original.Status == models.TransactionStatusRefunded {
		return models.Transaction{}, store.ErrAlreadyRefunded
	}
	if original.Status != models.TransactionStatusCompleted {
		return models.Transaction{}, store.ErrTransactionNotRefundable
	}

	cust, _ := s.st.GetCustomer(original.CustomerID)

	// Create negative/refund transaction record
	refundRecord := models.Transaction{
		CustomerID:            original.CustomerID,
		SubscriptionID:        original.SubscriptionID,
		Amount:                original.Amount,
		Currency:              original.Currency,
		Type:                  models.TransactionTypeRefund,
		Status:                models.TransactionStatusRefunded,
		PaymentMethod:         original.PaymentMethod,
		Description:           fmt.Sprintf("Refund for transaction %s", original.ID),
		OriginalTransactionID: original.ID,
		TransactionDate:       time.Now().UTC(),
	}

	createdRefund, err := s.st.CreateTransaction(refundRecord)
	if err != nil {
		return models.Transaction{}, err
	}

	// Mark original status as Refunded
	original.Status = models.TransactionStatusRefunded
	_, _ = s.st.UpdateTransaction(original.ID, original)

	// Notification
	_, _ = s.st.CreateNotification(models.Notification{
		Type:    models.NotificationTypePayment,
		Title:   "Refund processed",
		Message: fmt.Sprintf("A $%.2f refund was created for %s.", createdRefund.Amount, cust.Name),
		Read:    false,
	})

	return createdRefund, nil
}

func (s *TransactionService) GetTransactionSummary() (models.TransactionSummary, error) {
	page, err := s.st.ListTransactions(models.QueryParams{Limit: 1000})
	if err != nil {
		return models.TransactionSummary{}, err
	}

	var totalRevenue float64
	var successfulCount int
	var pendingAmount float64
	var refundedAmount float64

	for _, t := range page.Items {
		if t.Type == models.TransactionTypeRefund {
			refundedAmount += t.Amount
			if t.Status == models.TransactionStatusCompleted || t.Status == models.TransactionStatusRefunded {
				totalRevenue -= t.Amount
			}
		} else {
			if t.Status == models.TransactionStatusCompleted || t.Status == models.TransactionStatusRefunded {
				totalRevenue += t.Amount
			}
			if t.Status == models.TransactionStatusCompleted {
				successfulCount++
			} else if t.Status == models.TransactionStatusPending {
				pendingAmount += t.Amount
			}
		}
	}

	return models.TransactionSummary{
		TotalRevenue:           totalRevenue,
		SuccessfulTransactions: successfulCount,
		PendingAmount:          pendingAmount,
		RefundedAmount:         refundedAmount,
	}, nil
}

func (s *TransactionService) GetRevenueAnalytics(timeRange string) (models.RevenueAnalytics, error) {
	txnsPage, err := s.st.ListTransactions(models.QueryParams{Limit: 1000})
	if err != nil {
		return models.RevenueAnalytics{}, err
	}
	subsPage, err := s.st.ListSubscriptions(models.QueryParams{Limit: 1000})
	if err != nil {
		return models.RevenueAnalytics{}, err
	}

	// Map subscription ID -> plan
	subPlanMap := make(map[string]models.PlanTier)
	for _, sub := range subsPage.Items {
		subPlanMap[sub.ID] = sub.Plan
	}

	dailyMap := make(map[string]float64)
	monthlyMap := make(map[string]float64)
	planMap := make(map[models.PlanTier]float64)
	methodMap := make(map[string]float64)

	for _, t := range txnsPage.Items {
		if t.Status != models.TransactionStatusCompleted && t.Status != models.TransactionStatusRefunded {
			continue
		}

		amt := t.Amount
		if t.Type == models.TransactionTypeRefund {
			amt = -t.Amount
		}

		dateKey := t.TransactionDate.Format("2006-01-02")
		monthKey := t.TransactionDate.Format("2006-01")

		dailyMap[dateKey] += amt
		monthlyMap[monthKey] += amt

		if t.SubscriptionID != "" {
			if plan, ok := subPlanMap[t.SubscriptionID]; ok {
				planMap[plan] += amt
			} else {
				planMap[models.PlanStarter] += amt
			}
		} else {
			planMap[models.PlanProfessional] += amt
		}

		methodKey := t.PaymentMethod
		if methodKey == "" {
			methodKey = "Card"
		}
		methodMap[methodKey] += amt
	}

	// Format Daily Points (sorted by date)
	var daily []models.RevenueTimePoint
	var dailyKeys []string
	for k := range dailyMap {
		dailyKeys = append(dailyKeys, k)
	}
	sort.Strings(dailyKeys)
	for _, k := range dailyKeys {
		daily = append(daily, models.RevenueTimePoint{Date: k, Revenue: dailyMap[k]})
	}

	// Format Monthly Points (sorted)
	var monthly []models.RevenueTimePoint
	var monthlyKeys []string
	for k := range monthlyMap {
		monthlyKeys = append(monthlyKeys, k)
	}
	sort.Strings(monthlyKeys)
	for _, k := range monthlyKeys {
		monthly = append(monthly, models.RevenueTimePoint{Date: k, Revenue: monthlyMap[k]})
	}

	// Format ByPlan
	plans := []models.PlanTier{models.PlanProfessional, models.PlanEnterprise, models.PlanStarter, models.PlanFree}
	var byPlan []models.RevenuePlanPoint
	for _, p := range plans {
		byPlan = append(byPlan, models.RevenuePlanPoint{Plan: p, Revenue: planMap[p]})
	}

	// Format ByPaymentMethod
	methods := []string{"Card", "UPI", "Bank Transfer", "Demo Payment"}
	var byMethod []models.RevenueMethodPoint
	for _, m := range methods {
		byMethod = append(byMethod, models.RevenueMethodPoint{PaymentMethod: m, Revenue: methodMap[m]})
	}

	return models.RevenueAnalytics{
		Daily:           daily,
		Monthly:         monthly,
		ByPlan:          byPlan,
		ByPaymentMethod: byMethod,
	}, nil
}
