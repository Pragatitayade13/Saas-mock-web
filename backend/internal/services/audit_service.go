package services

import (
	"strings"
	"time"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

type AuditService struct {
	st store.Store
}

func NewAuditService(st store.Store) *AuditService {
	return &AuditService{st: st}
}

func (s *AuditService) GetAuditLog(id string) (models.AuditLog, error) {
	if strings.TrimSpace(id) == "" {
		return models.AuditLog{}, store.ErrInvalidInput
	}
	return s.st.GetAuditLog(id)
}

func (s *AuditService) ListAuditLogs(params models.QueryParams) (models.PaginatedList[models.AuditLog], error) {
	return s.st.ListAuditLogs(params)
}

func (s *AuditService) CreateAuditLog(audit models.AuditLog) (models.AuditLog, error) {
	if audit.ActorName == "" {
		audit.ActorName = "System / Administrator"
	}
	if audit.Timestamp.IsZero() {
		audit.Timestamp = time.Now().UTC()
	}
	if audit.Result == "" {
		audit.Result = models.AuditResultSuccess
	}
	if audit.IPAddress == "" {
		audit.IPAddress = "192.168.1.100 (Demo IP)"
	}
	return s.st.CreateAuditLog(audit)
}

func (s *AuditService) GetAuditSummary() (models.AuditSummary, error) {
	list, err := s.st.ListAuditLogs(models.QueryParams{Limit: 10000})
	if err != nil {
		return models.AuditSummary{}, err
	}

	today := time.Now().UTC().Format("2006-01-02")
	var res models.AuditSummary

	for _, a := range list.Items {
		if a.Timestamp.Format("2006-01-02") == today {
			res.TotalEventsToday++
			switch a.Result {
			case models.AuditResultSuccess:
				res.SuccessCount++
			case models.AuditResultDenied:
				res.DeniedCount++
			case models.AuditResultFailed:
				res.FailedCount++
			}
		}
	}
	return res, nil
}
