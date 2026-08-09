package store

import (
	"sort"
	"strings"
	"time"

	"nexora/backend/internal/models"
)

func (s *MemoryStore) GetUser(id string) (models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	user, ok := s.users[id]
	if !ok {
		return models.User{}, ErrUserNotFound
	}
	return user, nil
}

func (s *MemoryStore) GetUserByEmail(email string) (models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	emailClean := strings.ToLower(strings.TrimSpace(email))
	for _, u := range s.users {
		if strings.ToLower(strings.TrimSpace(u.Email)) == emailClean {
			return u, nil
		}
	}
	return models.User{}, ErrUserNotFound
}

func (s *MemoryStore) ListUsers(params models.QueryParams) (models.PaginatedList[models.User], error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.User
	searchLower := strings.ToLower(strings.TrimSpace(params.Search))

	for _, u := range s.users {
		if searchLower != "" {
			nameMatch := strings.Contains(strings.ToLower(u.Name), searchLower)
			emailMatch := strings.Contains(strings.ToLower(u.Email), searchLower)
			if !nameMatch && !emailMatch {
				continue
			}
		}

		if params.Status != "" && !strings.EqualFold(string(u.Status), params.Status) {
			continue
		}

		result = append(result, u)
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Name < result[j].Name
	})

	total := len(result)
	page, limit := sanitizePagination(params.Page, params.Limit)
	start, end := calculateBounds(total, page, limit)

	paginated := result[start:end]
	totalPages := calculateTotalPages(total, limit)

	return models.PaginatedList[models.User]{
		Items: paginated,
		Meta: models.PaginationMeta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *MemoryStore) CreateUser(user models.User) (models.User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if user.ID == "" {
		user.ID = s.idGen.NextUserID()
	}
	now := time.Now().UTC()
	if user.CreatedAt.IsZero() {
		user.CreatedAt = now
	}
	user.UpdatedAt = now

	if user.OrganizationID == "" {
		user.OrganizationID = s.organization.ID
	}
	if user.Status == "" {
		user.Status = models.UserStatusActive
	}

	s.users[user.ID] = user
	return user, nil
}

func (s *MemoryStore) UpdateUser(id string, user models.User) (models.User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, ok := s.users[id]
	if !ok {
		return models.User{}, ErrUserNotFound
	}

	user.ID = existing.ID
	user.CreatedAt = existing.CreatedAt
	user.UpdatedAt = time.Now().UTC()

	s.users[id] = user
	return user, nil
}
