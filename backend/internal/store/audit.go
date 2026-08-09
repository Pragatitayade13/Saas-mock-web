package store

import (
	"sort"
	"strings"
	"time"

	"nexora/backend/internal/models"
)

func (s *MemoryStore) GetAuditLog(id string) (models.AuditLog, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	audit, ok := s.auditLogs[id]
	if !ok {
		return models.AuditLog{}, ErrNotFound
	}
	return audit, nil
}

func (s *MemoryStore) ListAuditLogs(params models.QueryParams) (models.PaginatedList[models.AuditLog], error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.AuditLog
	searchLower := strings.ToLower(strings.TrimSpace(params.Search))

	for _, audit := range s.auditLogs {
		if params.Action != "" && !strings.EqualFold(audit.Action, params.Action) {
			continue
		}
		if params.EntityType != "" && !strings.EqualFold(audit.EntityType, params.EntityType) {
			continue
		}
		if params.ActorID != "" && !strings.EqualFold(audit.ActorID, params.ActorID) {
			continue
		}
		if params.Result != "" && !strings.EqualFold(string(audit.Result), params.Result) {
			continue
		}

		if searchLower != "" {
			actionMatch := strings.Contains(strings.ToLower(audit.Action), searchLower)
			nameMatch := strings.Contains(strings.ToLower(audit.EntityName), searchLower)
			actorMatch := strings.Contains(strings.ToLower(audit.ActorName), searchLower)
			idMatch := strings.Contains(strings.ToLower(audit.ID), searchLower)
			reasonMatch := strings.Contains(strings.ToLower(audit.Reason), searchLower)

			if !actionMatch && !nameMatch && !actorMatch && !idMatch && !reasonMatch {
				continue
			}
		}

		result = append(result, audit)
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
	case "result":
		sort.Slice(result, func(i, j int) bool {
			if sortOrder == "asc" {
				return result[i].Result < result[j].Result
			}
			return result[i].Result > result[j].Result
		})
	default: // "timestamp"
		sort.Slice(result, func(i, j int) bool {
			if sortOrder == "asc" {
				return result[i].Timestamp.Before(result[j].Timestamp)
			}
			return result[i].Timestamp.After(result[j].Timestamp)
		})
	}

	total := len(result)
	page, limit := sanitizePagination(params.Page, params.Limit)
	start, end := calculateBounds(total, page, limit)

	paginated := result[start:end]
	totalPages := calculateTotalPages(total, limit)

	return models.PaginatedList[models.AuditLog]{
		Items: paginated,
		Meta: models.PaginationMeta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *MemoryStore) CreateAuditLog(audit models.AuditLog) (models.AuditLog, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if audit.ID == "" {
		audit.ID = s.idGen.NextAuditID()
	}
	if audit.Timestamp.IsZero() {
		audit.Timestamp = time.Now().UTC()
	}
	if audit.Result == "" {
		audit.Result = models.AuditResultSuccess
	}
	if audit.IPAddress == "" {
		audit.IPAddress = "127.0.0.1 (Mock)"
	}

	s.auditLogs[audit.ID] = audit
	return audit, nil
}
