package store

import (
	"sort"
	"strings"
	"time"

	"nexora/backend/internal/models"
)

func (s *MemoryStore) GetCustomer(id string) (models.Customer, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	c, ok := s.customers[id]
	if !ok {
		return models.Customer{}, ErrCustomerNotFound
	}
	return c, nil
}

func (s *MemoryStore) ListCustomers(params models.QueryParams) (models.PaginatedList[models.Customer], error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Customer
	searchLower := strings.ToLower(strings.TrimSpace(params.Search))

	for _, c := range s.customers {
		if searchLower != "" {
			nameMatch := strings.Contains(strings.ToLower(c.Name), searchLower)
			companyMatch := strings.Contains(strings.ToLower(c.Company), searchLower)
			emailMatch := strings.Contains(strings.ToLower(c.Email), searchLower)
			if !nameMatch && !companyMatch && !emailMatch {
				continue
			}
		}

		if params.Status != "" && !strings.EqualFold(string(c.Status), params.Status) {
			continue
		}
		if params.Plan != "" && !strings.EqualFold(string(c.Plan), params.Plan) {
			continue
		}
		if params.Location != "" && !strings.Contains(strings.ToLower(c.Location), strings.ToLower(params.Location)) {
			continue
		}

		result = append(result, c)
	}

	// Controlled Sorting
	sortOrder := strings.ToLower(params.SortOrder)
	if sortOrder != "asc" {
		sortOrder = "desc"
	}

	switch strings.ToLower(params.SortBy) {
	case "name":
		sort.Slice(result, func(i, j int) bool {
			if sortOrder == "asc" {
				return result[i].Name < result[j].Name
			}
			return result[i].Name > result[j].Name
		})
	case "monthlyrevenue", "revenue":
		sort.Slice(result, func(i, j int) bool {
			if sortOrder == "asc" {
				return result[i].MonthlyRevenue < result[j].MonthlyRevenue
			}
			return result[i].MonthlyRevenue > result[j].MonthlyRevenue
		})
	case "status":
		sort.Slice(result, func(i, j int) bool {
			if sortOrder == "asc" {
				return result[i].Status < result[j].Status
			}
			return result[i].Status > result[j].Status
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

	return models.PaginatedList[models.Customer]{
		Items: paginated,
		Meta: models.PaginationMeta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *MemoryStore) CreateCustomer(customer models.Customer) (models.Customer, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if customer.ID == "" {
		customer.ID = s.idGen.NextCustomerID()
	}

	now := time.Now().UTC()
	if customer.CreatedAt.IsZero() {
		customer.CreatedAt = now
	}
	customer.UpdatedAt = now

	s.customers[customer.ID] = customer
	return customer, nil
}

func (s *MemoryStore) UpdateCustomer(id string, customer models.Customer) (models.Customer, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, ok := s.customers[id]
	if !ok {
		return models.Customer{}, ErrCustomerNotFound
	}

	customer.ID = existing.ID
	customer.CreatedAt = existing.CreatedAt
	customer.UpdatedAt = time.Now().UTC()

	s.customers[id] = customer
	return customer, nil
}

func (s *MemoryStore) FindCustomerByEmail(email string) (models.Customer, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	cleanEmail := strings.ToLower(strings.TrimSpace(email))
	if cleanEmail == "" {
		return models.Customer{}, ErrCustomerNotFound
	}

	for _, c := range s.customers {
		if strings.ToLower(strings.TrimSpace(c.Email)) == cleanEmail {
			return c, nil
		}
	}
	return models.Customer{}, ErrCustomerNotFound
}

func (s *MemoryStore) DeleteCustomer(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.customers[id]; !ok {
		return ErrCustomerNotFound
	}

	// Dependency Protection Rule: Prevent deleting customer if any subscriptions or transactions exist
	for _, sub := range s.subscriptions {
		if sub.CustomerID == id {
			return ErrCustomerHasDependencies
		}
	}
	for _, txn := range s.transactions {
		if txn.CustomerID == id {
			return ErrCustomerHasDependencies
		}
	}

	delete(s.customers, id)
	return nil
}

// Helpers for pagination
func sanitizePagination(page, limit int) (int, int) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	} else if limit > 100 {
		limit = 100
	}
	return page, limit
}

func calculateBounds(total, page, limit int) (int, int) {
	start := (page - 1) * limit
	if start > total {
		start = total
	}
	end := start + limit
	if end > total {
		end = total
	}
	return start, end
}

func calculateTotalPages(total, limit int) int {
	if total == 0 {
		return 1
	}
	pages := total / limit
	if total%limit != 0 {
		pages++
	}
	return pages
}
