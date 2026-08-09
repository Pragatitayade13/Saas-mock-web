package services

import (
	"time"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

type SessionItem struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	UserAgent string    `json:"userAgent"`
	IPAddress string    `json:"ipAddress"`
	IsCurrent bool      `json:"isCurrent"`
	CreatedAt time.Time `json:"createdAt"`
	ExpiresAt time.Time `json:"expiresAt"`
}

type SecurityService struct {
	st store.Store
}

func NewSecurityService(st store.Store) *SecurityService {
	return &SecurityService{st: st}
}

func (s *SecurityService) GetActiveSessions(userID string, currentSessionID string) ([]SessionItem, error) {
	sessions, err := s.st.ListSessionsByUser(userID)
	if err != nil {
		return nil, err
	}

	var items []SessionItem
	for _, sess := range sessions {
		items = append(items, SessionItem{
			ID:        sess.ID,
			UserID:    sess.UserID,
			UserAgent: "Chrome 128.0 (Windows 11)",
			IPAddress: "192.168.1.100 (Demo IP)",
			IsCurrent: sess.ID == currentSessionID,
			CreatedAt: sess.CreatedAt,
			ExpiresAt: sess.ExpiresAt,
		})
	}
	return items, nil
}

func (s *SecurityService) RevokeOtherSessions(userID string, currentSessionID string, actorName string) error {
	if err := s.st.RevokeOtherSessions(userID, currentSessionID); err != nil {
		return err
	}

	if actorName == "" {
		actorName = "User"
	}

	// Auto-track Activity & Audit
	_, _ = s.st.CreateActivity(models.Activity{
		ActorID:     userID,
		ActorName:   actorName,
		Action:      "Revoked Sessions",
		EntityType:  "Security",
		EntityID:    userID,
		EntityName:  actorName,
		Description: "Signed out all other active browser sessions.",
		Severity:    models.SeverityInfo,
	})

	_, _ = s.st.CreateAuditLog(models.AuditLog{
		ActorID:    userID,
		ActorName:  actorName,
		Action:     "Sessions Revoked",
		EntityType: "Security",
		EntityID:   userID,
		EntityName: actorName,
		Result:     models.AuditResultSuccess,
	})

	return nil
}
