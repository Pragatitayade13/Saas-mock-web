package store

import (
	"sort"
	"strings"
	"time"

	"nexora/backend/internal/models"
)

func (s *MemoryStore) GetTransaction(id string) (models.Transaction, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	txn, ok := s.transactions[id]
	if !ok {
		return models.Transaction{}, ErrTransactionNotFound
	}
	return txn, nil
}

func (s *MemoryStore) ListTransactions(params models.QueryParams) (models.PaginatedList[models.Transaction], error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Transaction
	searchLower := strings.ToLower(strings.TrimSpace(params.Search))

	for _, txn := range s.transactions {
		if params.CustomerID != "" && txn.CustomerID != params.CustomerID {
			continue
		}
		if params.SubscriptionID != "" && txn.SubscriptionID != params.SubscriptionID {
			continue
		}
		if params.Status != "" && !strings.EqualFold(string(txn.Status), params.Status) {
			continue
		}
		if params.Type != "" && !strings.EqualFold(string(txn.Type), params.Type) {
			continue
		}
		if params.PaymentMethod != "" && !strings.EqualFold(txn.PaymentMethod, params.PaymentMethod) {
			continue
		}

		// Amount Range Filter
		if params.MinAmount > 0 && txn.Amount < params.MinAmount {
			continue
		}
		if params.MaxAmount > 0 && txn.Amount > params.MaxAmount {
			continue
		}

		// Date Range Filter
		if !params.StartDate.IsZero() && txn.TransactionDate.Before(params.StartDate) {
			continue
		}
		if !params.EndDate.IsZero() && txn.TransactionDate.After(params.EndDate) {
			continue
		}

		// Search Filter (ID, Description, Customer Name, Customer Email)
		if searchLower != "" {
			cust, ok := s.customers[txn.CustomerID]
			idMatch := strings.Contains(strings.ToLower(txn.ID), searchLower)
			descMatch := strings.Contains(strings.ToLower(txn.Description), searchLower)
			nameMatch := ok && strings.Contains(strings.ToLower(cust.Name), searchLower)
			emailMatch := ok && strings.Contains(strings.ToLower(cust.Email), searchLower)

			if !idMatch && !descMatch && !nameMatch && !emailMatch {
				continue
			}
		}

		result = append(result, txn)
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
	case "transactiondate":
		sort.Slice(result, func(i, j int) bool {
			if sortOrder == "asc" {
				return result[i].TransactionDate.Before(result[j].TransactionDate)
			}
			return result[i].TransactionDate.After(result[j].TransactionDate)
		})
	case "customername":
		sort.Slice(result, func(i, j int) bool {
			nameI := s.customers[result[i].CustomerID].Name
			nameJ := s.customers[result[j].CustomerID].Name
			if sortOrder == "asc" {
				return nameI < nameJ
			}
			return nameI > nameJ
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

	return models.PaginatedList[models.Transaction]{
		Items: paginated,
		Meta: models.PaginationMeta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *MemoryStore) CreateTransaction(txn models.Transaction) (models.Transaction, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Verify customer exists if specified
	if txn.CustomerID != "" {
		if _, ok := s.customers[txn.CustomerID]; !ok {
			return models.Transaction{}, ErrCustomerNotFound
		}
	}

	if txn.ID == "" {
		txn.ID = s.idGen.NextTransactionID()
	}

	now := time.Now().UTC()
	if txn.CreatedAt.IsZero() {
		txn.CreatedAt = now
	}
	if txn.TransactionDate.IsZero() {
		txn.TransactionDate = now
	}
	txn.UpdatedAt = now

	s.transactions[txn.ID] = txn
	return txn, nil
}

func (s *MemoryStore) UpdateTransaction(id string, txn models.Transaction) (models.Transaction, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, ok := s.transactions[id]
	if !ok {
		return models.Transaction{}, ErrTransactionNotFound
	}

	txn.ID = existing.ID
	txn.CreatedAt = existing.CreatedAt
	txn.UpdatedAt = time.Now().UTC()

	s.transactions[id] = txn
	return txn, nil
}

func (s *MemoryStore) FindTransactionsByCustomer(customerID string) ([]models.Transaction, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Transaction
	for _, txn := range s.transactions {
		if txn.CustomerID == customerID {
			result = append(result, txn)
		}
	}
	return result, nil
}

func (s *MemoryStore) FindTransactionsBySubscription(subscriptionID string) ([]models.Transaction, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Transaction
	for _, txn := range s.transactions {
		if txn.SubscriptionID == subscriptionID {
			result = append(result, txn)
		}
	}
	return result, nil
}

func (s *MemoryStore) FindTransactionsByStatus(status models.TransactionStatus) ([]models.Transaction, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Transaction
	for _, txn := range s.transactions {
		if txn.Status == status {
			result = append(result, txn)
		}
	}
	return result, nil
}

func (s *MemoryStore) FindTransactionsByDateRange(startDate, endDate time.Time) ([]models.Transaction, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Transaction
	for _, txn := range s.transactions {
		if !startDate.IsZero() && txn.TransactionDate.Before(startDate) {
			continue
		}
		if !endDate.IsZero() && txn.TransactionDate.After(endDate) {
			continue
		}
		result = append(result, txn)
	}
	return result, nil
}
