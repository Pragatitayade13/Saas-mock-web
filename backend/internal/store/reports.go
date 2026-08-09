package store

import (
	"sort"
	"strings"
	"time"

	"nexora/backend/internal/models"
)

func (s *MemoryStore) GetReport(id string) (models.Report, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	rpt, ok := s.reports[id]
	if !ok {
		return models.Report{}, ErrNotFound
	}
	return rpt, nil
}

func (s *MemoryStore) ListReports(params models.QueryParams) (models.PaginatedList[models.Report], error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Report
	searchLower := strings.ToLower(strings.TrimSpace(params.Search))

	for _, rpt := range s.reports {
		if params.Type != "" && !strings.EqualFold(string(rpt.Type), params.Type) {
			continue
		}
		if params.Status != "" && !strings.EqualFold(string(rpt.Status), params.Status) {
			continue
		}
		if params.ActorID != "" && !strings.EqualFold(rpt.CreatedBy, params.ActorID) {
			continue
		}

		if searchLower != "" {
			nameMatch := strings.Contains(strings.ToLower(rpt.Name), searchLower)
			typeMatch := strings.Contains(strings.ToLower(string(rpt.Type)), searchLower)
			byMatch := strings.Contains(strings.ToLower(rpt.CreatedBy), searchLower)
			idMatch := strings.Contains(strings.ToLower(rpt.ID), searchLower)

			if !nameMatch && !typeMatch && !byMatch && !idMatch {
				continue
			}
		}

		result = append(result, rpt)
	}

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

	return models.PaginatedList[models.Report]{
		Items: paginated,
		Meta: models.PaginationMeta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *MemoryStore) CreateReport(report models.Report) (models.Report, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if report.ID == "" {
		report.ID = s.idGen.NextReportID()
	}
	if report.CreatedAt.IsZero() {
		report.CreatedAt = time.Now().UTC()
	}
	if report.Status == "" {
		report.Status = models.ReportStatusCompleted
	}
	if report.Format == "" {
		report.Format = "CSV"
	}

	s.reports[report.ID] = report
	return report, nil
}

func (s *MemoryStore) DeleteReport(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.reports[id]; !ok {
		return ErrNotFound
	}
	delete(s.reports, id)
	return nil
}
