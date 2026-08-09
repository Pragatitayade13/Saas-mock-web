package store

import (
	"sort"
	"strings"
	"time"

	"nexora/backend/internal/models"
)

func (s *MemoryStore) GetInvitation(id string) (models.Invitation, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	inv, ok := s.invitations[id]
	if !ok {
		return models.Invitation{}, ErrNotFound
	}
	return inv, nil
}

func (s *MemoryStore) GetInvitationByToken(token string) (models.Invitation, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, inv := range s.invitations {
		if inv.Token == token {
			return inv, nil
		}
	}
	return models.Invitation{}, ErrNotFound
}

func (s *MemoryStore) ListInvitations(params models.QueryParams) (models.PaginatedList[models.Invitation], error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Invitation
	searchLower := strings.ToLower(strings.TrimSpace(params.Search))

	for _, inv := range s.invitations {
		if params.Status != "" && !strings.EqualFold(string(inv.Status), params.Status) {
			continue
		}

		if searchLower != "" {
			emailMatch := strings.Contains(strings.ToLower(inv.Email), searchLower)
			nameMatch := strings.Contains(strings.ToLower(inv.Name), searchLower)
			roleMatch := strings.Contains(strings.ToLower(string(inv.Role)), searchLower)
			idMatch := strings.Contains(strings.ToLower(inv.ID), searchLower)

			if !emailMatch && !nameMatch && !roleMatch && !idMatch {
				continue
			}
		}

		result = append(result, inv)
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].CreatedAt.After(result[j].CreatedAt)
	})

	total := len(result)
	page, limit := sanitizePagination(params.Page, params.Limit)
	start, end := calculateBounds(total, page, limit)

	paginated := result[start:end]
	totalPages := calculateTotalPages(total, limit)

	return models.PaginatedList[models.Invitation]{
		Items: paginated,
		Meta: models.PaginationMeta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *MemoryStore) CreateInvitation(inv models.Invitation) (models.Invitation, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if inv.ID == "" {
		inv.ID = s.idGen.NextReportID() // reuse ID generator prefix or custom
	}
	if inv.CreatedAt.IsZero() {
		inv.CreatedAt = time.Now().UTC()
	}
	if inv.ExpiresAt.IsZero() {
		inv.ExpiresAt = inv.CreatedAt.Add(7 * 24 * time.Hour) // 7 days expiration
	}
	if inv.Status == "" {
		inv.Status = models.InvitationStatusPending
	}
	if inv.OrganizationID == "" {
		inv.OrganizationID = s.organization.ID
	}

	s.invitations[inv.ID] = inv
	return inv, nil
}

func (s *MemoryStore) UpdateInvitation(id string, inv models.Invitation) (models.Invitation, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.invitations[id]; !ok {
		return models.Invitation{}, ErrNotFound
	}
	s.invitations[id] = inv
	return inv, nil
}
