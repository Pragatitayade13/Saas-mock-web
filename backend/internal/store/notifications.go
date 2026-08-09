package store

import (
	"sort"
	"strings"
	"time"

	"nexora/backend/internal/models"
)

func (s *MemoryStore) GetNotification(id string) (models.Notification, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	notif, ok := s.notifications[id]
	if !ok {
		return models.Notification{}, ErrNotificationNotFound
	}
	return notif, nil
}

func (s *MemoryStore) ListNotifications(params models.QueryParams) (models.PaginatedList[models.Notification], error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Notification

	for _, notif := range s.notifications {
		if params.Read != nil && notif.Read != *params.Read {
			continue
		}
		if params.Type != "" && !strings.EqualFold(string(notif.Type), params.Type) {
			continue
		}

		result = append(result, notif)
	}

	sortOrder := strings.ToLower(params.SortOrder)
	if sortOrder != "asc" {
		sortOrder = "desc"
	}

	sort.Slice(result, func(i, j int) bool {
		if sortOrder == "asc" {
			return result[i].CreatedAt.Before(result[j].CreatedAt)
		}
		return result[i].CreatedAt.After(result[j].CreatedAt)
	})

	total := len(result)
	page, limit := sanitizePagination(params.Page, params.Limit)
	start, end := calculateBounds(total, page, limit)

	paginated := result[start:end]
	totalPages := calculateTotalPages(total, limit)

	return models.PaginatedList[models.Notification]{
		Items: paginated,
		Meta: models.PaginationMeta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *MemoryStore) CreateNotification(notif models.Notification) (models.Notification, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if notif.ID == "" {
		notif.ID = s.idGen.NextNotificationID()
	}

	if notif.CreatedAt.IsZero() {
		notif.CreatedAt = time.Now().UTC()
	}

	s.notifications[notif.ID] = notif
	return notif, nil
}

func (s *MemoryStore) MarkNotificationRead(id string) (models.Notification, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	notif, ok := s.notifications[id]
	if !ok {
		return models.Notification{}, ErrNotificationNotFound
	}

	notif.Read = true
	s.notifications[id] = notif
	return notif, nil
}

func (s *MemoryStore) MarkNotificationUnread(id string) (models.Notification, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	notif, ok := s.notifications[id]
	if !ok {
		return models.Notification{}, ErrNotificationNotFound
	}

	notif.Read = false
	s.notifications[id] = notif
	return notif, nil
}

func (s *MemoryStore) MarkAllNotificationsRead(userID string) ([]models.Notification, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	var updated []models.Notification
	for id, notif := range s.notifications {
		if userID == "" || notif.UserID == userID {
			notif.Read = true
			s.notifications[id] = notif
			updated = append(updated, notif)
		}
	}
	return updated, nil
}
