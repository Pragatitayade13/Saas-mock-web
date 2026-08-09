package services

import (
	"strings"
	"time"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

type ActivityService struct {
	st store.Store
}

func NewActivityService(st store.Store) *ActivityService {
	return &ActivityService{st: st}
}

func (s *ActivityService) GetActivity(id string) (models.Activity, error) {
	if strings.TrimSpace(id) == "" {
		return models.Activity{}, store.ErrInvalidInput
	}
	return s.st.GetActivity(id)
}

func (s *ActivityService) ListActivities(params models.QueryParams) (models.PaginatedList[models.Activity], error) {
	return s.st.ListActivities(params)
}

func (s *ActivityService) CreateActivity(act models.Activity) (models.Activity, error) {
	if act.ActorName == "" {
		act.ActorName = "System"
	}
	if act.CreatedAt.IsZero() {
		act.CreatedAt = time.Now().UTC()
	}
	if act.Severity == "" {
		act.Severity = models.SeverityInfo
	}
	return s.st.CreateActivity(act)
}

func (s *ActivityService) GetActivitySummary() (models.ActivitySummary, error) {
	list, err := s.st.ListActivities(models.QueryParams{Limit: 10000})
	if err != nil {
		return models.ActivitySummary{}, err
	}

	today := time.Now().UTC().Format("2006-01-02")
	var res models.ActivitySummary

	for _, a := range list.Items {
		if a.CreatedAt.Format("2006-01-02") == today {
			res.TotalToday++
			switch a.Severity {
			case models.SeveritySuccess, models.SeverityInfo:
				res.SuccessfulCount++
			case models.SeverityWarning:
				res.WarningCount++
			case models.SeverityCritical:
				res.CriticalCount++
			}
		}
	}
	return res, nil
}
