package store

import (
	"sort"
	"strings"
	"time"

	"nexora/backend/internal/models"
)

func (s *MemoryStore) GetSubscription(id string) (models.Subscription, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	sub, ok := s.subscriptions[id]
	if !ok {
		return models.Subscription{}, ErrSubscriptionNotFound
	}
	return sub, nil
}

func (s *MemoryStore) ListSubscriptions(params models.QueryParams) (models.PaginatedList[models.Subscription], error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Subscription
	searchLower := strings.ToLower(strings.TrimSpace(params.Search))

	for _, sub := range s.subscriptions {
		if params.CustomerID != "" && sub.CustomerID != params.CustomerID {
			continue
		}
		if params.Status != "" && !strings.EqualFold(string(sub.Status), params.Status) {
			continue
		}
		if params.Plan != "" && !strings.EqualFold(string(sub.Plan), params.Plan) {
			continue
		}
		if params.BillingCycle != "" && !strings.EqualFold(string(sub.BillingCycle), params.BillingCycle) {
			continue
		}

		if searchLower != "" {
			cust, ok := s.customers[sub.CustomerID]
			idMatch := strings.Contains(strings.ToLower(sub.ID), searchLower)
			nameMatch := ok && strings.Contains(strings.ToLower(cust.Name), searchLower)
			emailMatch := ok && strings.Contains(strings.ToLower(cust.Email), searchLower)
			companyMatch := ok && strings.Contains(strings.ToLower(cust.Company), searchLower)

			if !idMatch && !nameMatch && !emailMatch && !companyMatch {
				continue
			}
		}

		result = append(result, sub)
	}

	sortOrder := strings.ToLower(params.SortOrder)
	if sortOrder != "asc" {
		sortOrder = "desc"
	}

	switch strings.ToLower(params.SortBy) {
	case "amount":
		sort.Slice(result, func(i, j int) bool {
			if sortOrder == "asc" {
				return result[i].Amount < result[j].Amount
			}
			return result[i].Amount > result[j].Amount
		})
	case "status":
		sort.Slice(result, func(i, j int) bool {
			if sortOrder == "asc" {
				return result[i].Status < result[j].Status
			}
			return result[i].Status > result[j].Status
		})
	case "startdate":
		sort.Slice(result, func(i, j int) bool {
			if sortOrder == "asc" {
				return result[i].StartDate.Before(result[j].StartDate)
			}
			return result[i].StartDate.After(result[j].StartDate)
		})
	case "nextbillingdate":
		sort.Slice(result, func(i, j int) bool {
			if sortOrder == "asc" {
				return result[i].NextBillingDate.Before(result[j].NextBillingDate)
			}
			return result[i].NextBillingDate.After(result[j].NextBillingDate)
		})
	case "customername":
		sort.Slice(result, func(i, j int) bool {
			custI := s.customers[result[i].CustomerID].Name
			custJ := s.customers[result[j].CustomerID].Name
			if sortOrder == "asc" {
				return custI < custJ
			}
			return custI > custJ
		})
	default: // "createdAt"
		sort.Slice(result, func(i, j int) bool {
			if sortOrder == "asc" {
				return result[i].CreatedAt.Before(result[j].CreatedAt)
			}
			return result[i].CreatedAt.After(result[j].CreatedAt)
		})
	}

	total := len(result)
	page, limit := sanitizePagination(params.Page, params.Limit)
	start, end := calculateBounds(total, page, limit)

	paginated := result[start:end]
	totalPages := calculateTotalPages(total, limit)

	return models.PaginatedList[models.Subscription]{
		Items: paginated,
		Meta: models.PaginationMeta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *MemoryStore) CreateSubscription(sub models.Subscription) (models.Subscription, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Verify customer exists
	if _, ok := s.customers[sub.CustomerID]; !ok {
		return models.Subscription{}, ErrCustomerNotFound
	}

	if sub.ID == "" {
		sub.ID = s.idGen.NextSubscriptionID()
	}

	now := time.Now().UTC()
	if sub.CreatedAt.IsZero() {
		sub.CreatedAt = now
	}
	sub.UpdatedAt = now

	s.subscriptions[sub.ID] = sub
	return sub, nil
}

func (s *MemoryStore) UpdateSubscription(id string, sub models.Subscription) (models.Subscription, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, ok := s.subscriptions[id]
	if !ok {
		return models.Subscription{}, ErrSubscriptionNotFound
	}

	if sub.CustomerID != "" {
		if _, ok := s.customers[sub.CustomerID]; !ok {
			return models.Subscription{}, ErrCustomerNotFound
		}
	} else {
		sub.CustomerID = existing.CustomerID
	}

	sub.ID = existing.ID
	sub.CreatedAt = existing.CreatedAt
	sub.UpdatedAt = time.Now().UTC()

	s.subscriptions[id] = sub
	return sub, nil
}

func (s *MemoryStore) DeleteSubscription(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.subscriptions[id]; !ok {
		return ErrSubscriptionNotFound
	}

	delete(s.subscriptions, id)
	return nil
}

func (s *MemoryStore) FindActiveByCustomer(customerID string) (models.Subscription, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	customerID = strings.TrimSpace(customerID)
	if customerID == "" {
		return models.Subscription{}, ErrSubscriptionNotFound
	}

	for _, sub := range s.subscriptions {
		if sub.CustomerID == customerID && (sub.Status == models.SubscriptionStatusActive || sub.Status == models.SubscriptionStatusTrial) {
			return sub, nil
		}
	}
	return models.Subscription{}, ErrSubscriptionNotFound
}

func (s *MemoryStore) FindByCustomer(customerID string) ([]models.Subscription, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Subscription
	for _, sub := range s.subscriptions {
		if sub.CustomerID == customerID {
			result = append(result, sub)
		}
	}
	return result, nil
}

func (s *MemoryStore) FindByPlan(plan models.PlanTier) ([]models.Subscription, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Subscription
	for _, sub := range s.subscriptions {
		if sub.Plan == plan {
			result = append(result, sub)
		}
	}
	return result, nil
}

func (s *MemoryStore) FindByStatus(status models.SubscriptionStatus) ([]models.Subscription, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Subscription
	for _, sub := range s.subscriptions {
		if sub.Status == status {
			result = append(result, sub)
		}
	}
	return result, nil
}
