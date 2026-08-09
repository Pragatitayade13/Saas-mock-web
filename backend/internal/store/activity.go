package store

import (
	"sort"
	"strings"
	"time"

	"nexora/backend/internal/models"
)

func (s *MemoryStore) GetActivity(id string) (models.Activity, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	act, ok := s.activities[id]
	if !ok {
		return models.Activity{}, ErrNotFound
	}
	return act, nil
}

func (s *MemoryStore) ListActivities(params models.QueryParams) (models.PaginatedList[models.Activity], error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Activity
	searchLower := strings.ToLower(strings.TrimSpace(params.Search))

	for _, act := range s.activities {
		if params.Action != "" && !strings.EqualFold(act.Action, params.Action) {
			continue
		}
		if params.EntityType != "" && !strings.EqualFold(act.EntityType, params.EntityType) {
			continue
		}
		if params.CustomerID != "" && act.EntityID != params.CustomerID && act.Metadata["customerId"] != params.CustomerID {
			continue
		}
		if params.SubscriptionID != "" && act.EntityID != params.SubscriptionID && act.Metadata["subscriptionId"] != params.SubscriptionID {
			continue
		}
		if params.ActorID != "" && !strings.EqualFold(act.ActorID, params.ActorID) {
			continue
		}
		if params.Severity != "" && !strings.EqualFold(string(act.Severity), params.Severity) {
			continue
		}

		if searchLower != "" {
			actionMatch := strings.Contains(strings.ToLower(act.Action), searchLower)
			descMatch := strings.Contains(strings.ToLower(act.Description), searchLower)
			nameMatch := strings.Contains(strings.ToLower(act.EntityName), searchLower)
			actorMatch := strings.Contains(strings.ToLower(act.ActorName), searchLower)
			idMatch := strings.Contains(strings.ToLower(act.ID), searchLower)

			if !actionMatch && !descMatch && !nameMatch && !actorMatch && !idMatch {
				continue
			}
		}

		result = append(result, act)
	}

	sortOrder := strings.ToLower(params.SortOrder)
	if sortOrder != "asc" {
		sortOrder = "desc"
	}

	switch strings.ToLower(params.SortBy) {
	case "action":
		sort.Slice(result, func(i, j int) bool {
			if sortOrder == "asc" {
				return result[i].Action < result[j].Action
			}
			return result[i].Action > result[j].Action
		})
	case "actorname":
		sort.Slice(result, func(i, j int) bool {
			if sortOrder == "asc" {
				return result[i].ActorName < result[j].ActorName
			}
			return result[i].ActorName > result[j].ActorName
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

	return models.PaginatedList[models.Activity]{
		Items: paginated,
		Meta: models.PaginationMeta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *MemoryStore) CreateActivity(activity models.Activity) (models.Activity, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if activity.ID == "" {
		activity.ID = s.idGen.NextActivityID()
	}
	if activity.CreatedAt.IsZero() {
		activity.CreatedAt = time.Now().UTC()
	}
	if activity.Severity == "" {
		activity.Severity = models.SeverityInfo
	}

	s.activities[activity.ID] = activity
	return activity, nil
}
