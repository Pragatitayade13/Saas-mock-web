package services

import (
	"fmt"
	"net/mail"
	"strings"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

type OrganizationService struct {
	st store.Store
}

func NewOrganizationService(st store.Store) *OrganizationService {
	return &OrganizationService{st: st}
}

func (s *OrganizationService) GetOrganization() (models.Organization, error) {
	return s.st.GetOrganization()
}

func (s *OrganizationService) UpdateOrganization(org models.Organization, actorName string) (models.Organization, error) {
	org.Name = strings.TrimSpace(org.Name)
	org.Email = strings.TrimSpace(org.Email)

	if org.Name == "" {
		return models.Organization{}, fmt.Errorf("%w: organization name is required", store.ErrInvalidInput)
	}
	if org.Email != "" {
		if _, err := mail.ParseAddress(org.Email); err != nil {
			return models.Organization{}, fmt.Errorf("%w: invalid organization email address", store.ErrInvalidInput)
		}
	}

	updated, err := s.st.UpdateOrganization(org)
	if err != nil {
		return models.Organization{}, err
	}

	if actorName == "" {
		actorName = "Administrator"
	}

	// Auto-track Activity & Audit Log
	_, _ = s.st.CreateActivity(models.Activity{
		ActorName:   actorName,
		Action:      "Updated",
		EntityType:  "Organization",
		EntityID:    updated.ID,
		EntityName:  updated.Name,
		Description: fmt.Sprintf("Updated organization settings (%s).", updated.Name),
		Severity:    models.SeverityInfo,
	})

	_, _ = s.st.CreateAuditLog(models.AuditLog{
		ActorName:  actorName,
		Action:     "Organization Updated",
		EntityType: "Organization",
		EntityID:   updated.ID,
		EntityName: updated.Name,
		Result:     models.AuditResultSuccess,
	})

	return updated, nil
}
