package services

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/mail"
	"strings"
	"time"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

type InvitationService struct {
	st store.Store
}

func NewInvitationService(st store.Store) *InvitationService {
	return &InvitationService{st: st}
}

func generateToken() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return fmt.Sprintf("INV-TOKEN-%s", hex.EncodeToString(b))
}

func (s *InvitationService) ListInvitations(params models.QueryParams) (models.PaginatedList[models.Invitation], error) {
	return s.st.ListInvitations(params)
}

func (s *InvitationService) CreateInvitation(input models.Invitation, actor *models.User) (models.Invitation, error) {
	input.Email = strings.TrimSpace(input.Email)
	input.Name = strings.TrimSpace(input.Name)

	if input.Name == "" {
		return models.Invitation{}, fmt.Errorf("%w: invitee name is required", store.ErrInvalidInput)
	}
	if input.Email == "" {
		return models.Invitation{}, fmt.Errorf("%w: invitee email is required", store.ErrInvalidInput)
	}
	if _, err := mail.ParseAddress(input.Email); err != nil {
		return models.Invitation{}, fmt.Errorf("%w: invalid email address format", store.ErrInvalidInput)
	}
	if input.Role == "" {
		input.Role = models.RoleViewer
	}

	// Check existing user
	if _, err := s.st.GetUserByEmail(input.Email); err == nil {
		return models.Invitation{}, fmt.Errorf("%w: user with this email already exists in workspace", store.ErrInvalidInput)
	}

	// Check duplicate pending invitation
	list, _ := s.st.ListInvitations(models.QueryParams{Limit: 1000})
	for _, inv := range list.Items {
		if strings.EqualFold(inv.Email, input.Email) && inv.Status == models.InvitationStatusPending {
			return models.Invitation{}, fmt.Errorf("%w: pending invitation already exists for this email", store.ErrInvalidInput)
		}
	}

	input.Token = generateToken()
	input.Status = models.InvitationStatusPending
	now := time.Now().UTC()
	input.CreatedAt = now
	input.ExpiresAt = now.Add(7 * 24 * time.Hour)

	if actor != nil {
		input.CreatedBy = actor.Name
	} else {
		input.CreatedBy = "Administrator"
	}

	created, err := s.st.CreateInvitation(input)
	if err != nil {
		return models.Invitation{}, err
	}

	// Auto-track Activity, Audit & Notification
	_, _ = s.st.CreateActivity(models.Activity{
		ActorName:   created.CreatedBy,
		Action:      "Invited",
		EntityType:  "User",
		EntityID:    created.ID,
		EntityName:  created.Name,
		Description: fmt.Sprintf("Invited %s (%s) to join workspace as %s.", created.Name, created.Email, created.Role),
		Severity:    models.SeverityInfo,
	})

	_, _ = s.st.CreateAuditLog(models.AuditLog{
		ActorName:  created.CreatedBy,
		Action:     "Member Invited",
		EntityType: "User",
		EntityID:   created.ID,
		EntityName: created.Name,
		Result:     models.AuditResultSuccess,
	})

	_, _ = s.st.CreateNotification(models.Notification{
		Type:    models.NotificationTypeSystem,
		Title:   "Team Member Invited",
		Message: fmt.Sprintf("%s was invited to join as %s.", created.Name, created.Role),
		Read:    false,
	})

	return created, nil
}

func (s *InvitationService) RevokeInvitation(id string, actor *models.User) (models.Invitation, error) {
	inv, err := s.st.GetInvitation(id)
	if err != nil {
		return models.Invitation{}, err
	}

	inv.Status = models.InvitationStatusRevoked
	updated, err := s.st.UpdateInvitation(id, inv)
	if err != nil {
		return models.Invitation{}, err
	}

	actorName := "Administrator"
	if actor != nil {
		actorName = actor.Name
	}

	// Auto-track Activity & Audit Log
	_, _ = s.st.CreateActivity(models.Activity{
		ActorName:   actorName,
		Action:      "Revoked",
		EntityType:  "Invitation",
		EntityID:    updated.ID,
		EntityName:  updated.Name,
		Description: fmt.Sprintf("Revoked pending invitation for %s.", updated.Email),
		Severity:    models.SeverityWarning,
	})

	_, _ = s.st.CreateAuditLog(models.AuditLog{
		ActorName:  actorName,
		Action:     "Invitation Revoked",
		EntityType: "Invitation",
		EntityID:   updated.ID,
		EntityName: updated.Name,
		Result:     models.AuditResultSuccess,
	})

	return updated, nil
}

func (s *InvitationService) ResendInvitation(id string, actor *models.User) (models.Invitation, error) {
	inv, err := s.st.GetInvitation(id)
	if err != nil {
		return models.Invitation{}, err
	}

	now := time.Now().UTC()
	inv.CreatedAt = now
	inv.ExpiresAt = now.Add(7 * 24 * time.Hour)
	updated, err := s.st.UpdateInvitation(id, inv)
	if err != nil {
		return models.Invitation{}, err
	}

	return updated, nil
}

func (s *InvitationService) AcceptInvitation(token string) (models.User, error) {
	inv, err := s.st.GetInvitationByToken(token)
	if err != nil {
		return models.User{}, fmt.Errorf("%w: invitation token not found", store.ErrNotFound)
	}

	if inv.Status != models.InvitationStatusPending {
		return models.User{}, fmt.Errorf("%w: invitation is no longer pending", store.ErrInvalidInput)
	}

	if time.Now().UTC().After(inv.ExpiresAt) {
		inv.Status = models.InvitationStatusExpired
		_, _ = s.st.UpdateInvitation(inv.ID, inv)
		return models.User{}, fmt.Errorf("%w: invitation token has expired", store.ErrInvalidInput)
	}

	// Create User in Store
	newUser, err := s.st.CreateUser(models.User{
		Name:         inv.Name,
		Email:        inv.Email,
		Role:         inv.Role,
		Avatar:       "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
		Status:       models.UserStatusActive,
		PasswordHash: "hashed_demo_password",
	})
	if err != nil {
		return models.User{}, err
	}

	// Mark Invitation Accepted
	inv.Status = models.InvitationStatusAccepted
	_, _ = s.st.UpdateInvitation(inv.ID, inv)

	// Auto-track Activity, Audit, Notification
	_, _ = s.st.CreateActivity(models.Activity{
		ActorID:     newUser.ID,
		ActorName:   newUser.Name,
		Action:      "Accepted",
		EntityType:  "Invitation",
		EntityID:    inv.ID,
		EntityName:  newUser.Name,
		Description: fmt.Sprintf("%s joined the workspace as %s.", newUser.Name, newUser.Role),
		Severity:    models.SeveritySuccess,
	})

	_, _ = s.st.CreateAuditLog(models.AuditLog{
		ActorID:    newUser.ID,
		ActorName:  newUser.Name,
		Action:     "Invitation Accepted",
		EntityType: "Invitation",
		EntityID:   inv.ID,
		EntityName: newUser.Name,
		Result:     models.AuditResultSuccess,
	})

	_, _ = s.st.CreateNotification(models.Notification{
		Type:    models.NotificationTypeSystem,
		Title:   "New Team Member Joined",
		Message: fmt.Sprintf("%s accepted invitation and joined as %s.", newUser.Name, newUser.Role),
		Read:    false,
	})

	return newUser.Sanitize(), nil
}
