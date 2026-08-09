package store

import (
	"time"

	"nexora/backend/internal/models"
)

func (s *MemoryStore) GetOrganization() (models.Organization, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.organization, nil
}

func (s *MemoryStore) UpdateOrganization(org models.Organization) (models.Organization, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	org.ID = s.organization.ID
	org.CreatedAt = s.organization.CreatedAt
	org.UpdatedAt = time.Now().UTC()

	s.organization = org
	return org, nil
}
