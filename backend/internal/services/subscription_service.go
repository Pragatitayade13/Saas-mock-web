package services

import (
	"fmt"
	"strings"
	"time"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

type SubscriptionService struct {
	st store.Store
}

func NewSubscriptionService(st store.Store) *SubscriptionService {
	return &SubscriptionService{st: st}
}

func isValidPlanTier(plan models.PlanTier) bool {
	switch plan {
	case models.PlanFree, models.PlanStarter, models.PlanProfessional, models.PlanEnterprise:
		return true
	default:
		return false
	}
}

func isValidSubStatus(status models.SubscriptionStatus) bool {
	switch status {
	case models.SubscriptionStatusActive, models.SubscriptionStatusTrial, models.SubscriptionStatusPastDue, models.SubscriptionStatusCancelled, models.SubscriptionStatusExpired:
		return true
	default:
		return false
	}
}

func isValidBillingCycle(cycle models.BillingCycle) bool {
	switch cycle {
	case models.BillingCycleMonthly, models.BillingCycleYearly:
		return true
	default:
		return false
	}
}

// CalculateNextBillingDate adds 1 month or 1 year with month-end date clamping bounds
func CalculateNextBillingDate(startDate time.Time, cycle models.BillingCycle) time.Time {
	if startDate.IsZero() {
		startDate = time.Now().UTC()
	}

	if cycle == models.BillingCycleYearly {
		return startDate.AddDate(1, 0, 0)
	}

	// Monthly calculation with month-end clamping (e.g. Jan 31 + 1 month -> Feb 28/29)
	year, month, day := startDate.Date()
	targetMonth := month + 1
	targetYear := year
	if targetMonth > 12 {
		targetMonth = 1
		targetYear++
	}

	// Get number of days in target month
	firstOfTargetMonth := time.Date(targetYear, targetMonth, 1, startDate.Hour(), startDate.Minute(), startDate.Second(), startDate.Nanosecond(), startDate.Location())
	lastOfTargetMonth := firstOfTargetMonth.AddDate(0, 1, -1)
	maxDays := lastOfTargetMonth.Day()

	targetDay := day
	if targetDay > maxDays {
		targetDay = maxDays
	}

	return time.Date(targetYear, targetMonth, targetDay, startDate.Hour(), startDate.Minute(), startDate.Second(), startDate.Nanosecond(), startDate.Location())
}

func (s *SubscriptionService) GetSubscription(id string) (models.Subscription, error) {
	if strings.TrimSpace(id) == "" {
		return models.Subscription{}, store.ErrInvalidInput
	}
	return s.st.GetSubscription(id)
}

func (s *SubscriptionService) ListSubscriptions(params models.QueryParams) (models.PaginatedList[models.Subscription], error) {
	return s.st.ListSubscriptions(params)
}

func (s *SubscriptionService) CreateSubscription(sub models.Subscription) (models.Subscription, error) {
	sub.CustomerID = strings.TrimSpace(sub.CustomerID)
	if sub.CustomerID == "" {
		return models.Subscription{}, fmt.Errorf("%w: customerId is required", store.ErrInvalidInput)
	}

	// Verify customer exists
	cust, err := s.st.GetCustomer(sub.CustomerID)
	if err != nil {
		return models.Subscription{}, err
	}

	// Rule: One active subscription per customer
	if sub.Status == "" || sub.Status == models.SubscriptionStatusActive || sub.Status == models.SubscriptionStatusTrial {
		if activeSub, err := s.st.FindActiveByCustomer(sub.CustomerID); err == nil && activeSub.ID != "" {
			return models.Subscription{}, store.ErrActiveSubscriptionExists
		}
	}

	if sub.Plan == "" {
		sub.Plan = models.PlanStarter
	} else if !isValidPlanTier(sub.Plan) {
		return models.Subscription{}, fmt.Errorf("%w: invalid plan tier", store.ErrInvalidInput)
	}

	if sub.BillingCycle == "" {
		sub.BillingCycle = models.BillingCycleMonthly
	} else if !isValidBillingCycle(sub.BillingCycle) {
		return models.Subscription{}, fmt.Errorf("%w: invalid billing cycle", store.ErrInvalidInput)
	}

	if sub.Status == "" {
		sub.Status = models.SubscriptionStatusActive
	} else if !isValidSubStatus(sub.Status) {
		return models.Subscription{}, fmt.Errorf("%w: invalid subscription status", store.ErrInvalidInput)
	}

	// Derive Amount from centralized pricing engine
	sub.Amount = models.GetPlanPricing(sub.Plan, sub.BillingCycle)

	if sub.StartDate.IsZero() {
		sub.StartDate = time.Now().UTC()
	}

	// Derive NextBillingDate
	sub.NextBillingDate = CalculateNextBillingDate(sub.StartDate, sub.BillingCycle)

	created, err := s.st.CreateSubscription(sub)
	if err != nil {
		return models.Subscription{}, err
	}

	// Notification
	_, _ = s.st.CreateNotification(models.Notification{
		Type:    models.NotificationTypeSubscription,
		Title:   "Subscription created",
		Message: fmt.Sprintf("Subscription for %s (%s) created on %s plan.", cust.Name, cust.Company, created.Plan),
		Read:    false,
	})

	return created, nil
}

func (s *SubscriptionService) UpdateSubscription(id string, sub models.Subscription) (models.Subscription, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return models.Subscription{}, store.ErrInvalidInput
	}

	existing, err := s.st.GetSubscription(id)
	if err != nil {
		return models.Subscription{}, err
	}

	cust, _ := s.st.GetCustomer(existing.CustomerID)

	// Validate Status Transition rules
	if sub.Status != "" && sub.Status != existing.Status {
		if !isValidSubStatus(sub.Status) {
			return models.Subscription{}, fmt.Errorf("%w: invalid status value", store.ErrInvalidInput)
		}
		if existing.Status == models.SubscriptionStatusCancelled || existing.Status == models.SubscriptionStatusExpired {
			return models.Subscription{}, store.ErrInvalidStatusTransition
		}
	} else {
		sub.Status = existing.Status
	}

	if sub.Plan != "" {
		if !isValidPlanTier(sub.Plan) {
			return models.Subscription{}, fmt.Errorf("%w: invalid plan tier", store.ErrInvalidInput)
		}
	} else {
		sub.Plan = existing.Plan
	}

	if sub.BillingCycle != "" {
		if !isValidBillingCycle(sub.BillingCycle) {
			return models.Subscription{}, fmt.Errorf("%w: invalid billing cycle", store.ErrInvalidInput)
		}
	} else {
		sub.BillingCycle = existing.BillingCycle
	}

	// Derive updated amount
	sub.Amount = models.GetPlanPricing(sub.Plan, sub.BillingCycle)

	if sub.StartDate.IsZero() {
		sub.StartDate = existing.StartDate
	}
	sub.NextBillingDate = CalculateNextBillingDate(sub.StartDate, sub.BillingCycle)

	updated, err := s.st.UpdateSubscription(id, sub)
	if err != nil {
		return models.Subscription{}, err
	}

	// Create Notification
	_, _ = s.st.CreateNotification(models.Notification{
		Type:    models.NotificationTypeSubscription,
		Title:   "Subscription updated",
		Message: fmt.Sprintf("Subscription for %s was updated.", cust.Company),
		Read:    false,
	})

	return updated, nil
}

func (s *SubscriptionService) ChangePlan(id string, newPlan models.PlanTier) (models.Subscription, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return models.Subscription{}, store.ErrInvalidInput
	}

	if !isValidPlanTier(newPlan) {
		return models.Subscription{}, fmt.Errorf("%w: invalid target plan tier", store.ErrInvalidInput)
	}

	existing, err := s.st.GetSubscription(id)
	if err != nil {
		return models.Subscription{}, err
	}

	if existing.Status == models.SubscriptionStatusCancelled || existing.Status == models.SubscriptionStatusExpired {
		return models.Subscription{}, store.ErrInvalidStatusTransition
	}

	oldPlan := existing.Plan
	existing.Plan = newPlan
	existing.Amount = models.GetPlanPricing(newPlan, existing.BillingCycle)

	updated, err := s.st.UpdateSubscription(id, existing)
	if err != nil {
		return models.Subscription{}, err
	}

	cust, _ := s.st.GetCustomer(existing.CustomerID)

	// Create Notification
	_, _ = s.st.CreateNotification(models.Notification{
		Type:    models.NotificationTypeSubscription,
		Title:   "Subscription plan changed",
		Message: fmt.Sprintf("%s moved from %s to %s plan.", cust.Company, oldPlan, newPlan),
		Read:    false,
	})

	return updated, nil
}

func (s *SubscriptionService) CancelSubscription(id string) (models.Subscription, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return models.Subscription{}, store.ErrInvalidInput
	}

	existing, err := s.st.GetSubscription(id)
	if err != nil {
		return models.Subscription{}, err
	}

	if existing.Status == models.SubscriptionStatusCancelled {
		return existing, nil
	}

	existing.Status = models.SubscriptionStatusCancelled
	updated, err := s.st.UpdateSubscription(id, existing)
	if err != nil {
		return models.Subscription{}, err
	}

	cust, _ := s.st.GetCustomer(existing.CustomerID)

	// Notification
	_, _ = s.st.CreateNotification(models.Notification{
		Type:    models.NotificationTypeSubscription,
		Title:   "Subscription cancelled",
		Message: fmt.Sprintf("Subscription for %s was cancelled.", cust.Company),
		Read:    false,
	})

	return updated, nil
}

func (s *SubscriptionService) DeleteSubscription(id string) error {
	id = strings.TrimSpace(id)
	if id == "" {
		return store.ErrInvalidInput
	}
	return s.st.DeleteSubscription(id)
}

func (s *SubscriptionService) GetCustomerSubscription(customerID string) (models.Subscription, error) {
	customerID = strings.TrimSpace(customerID)
	if customerID == "" {
		return models.Subscription{}, store.ErrInvalidInput
	}
	return s.st.FindActiveByCustomer(customerID)
}

func (s *SubscriptionService) GetSubscriptionTransactions(subscriptionID string) (models.PaginatedList[models.Transaction], error) {
	subscriptionID = strings.TrimSpace(subscriptionID)
	if subscriptionID == "" {
		return models.PaginatedList[models.Transaction]{}, store.ErrInvalidInput
	}
	if _, err := s.st.GetSubscription(subscriptionID); err != nil {
		return models.PaginatedList[models.Transaction]{}, err
	}

	// Filter transactions where SubscriptionID matches
	allTxns, err := s.st.ListTransactions(models.QueryParams{Limit: 100})
	if err != nil {
		return models.PaginatedList[models.Transaction]{}, err
	}

	var filtered []models.Transaction
	for _, t := range allTxns.Items {
		if t.SubscriptionID == subscriptionID {
			filtered = append(filtered, t)
		}
	}

	return models.PaginatedList[models.Transaction]{
		Items: filtered,
		Meta: models.PaginationMeta{
			Page:       1,
			Limit:      100,
			Total:      len(filtered),
			TotalPages: 1,
		},
	}, nil
}
