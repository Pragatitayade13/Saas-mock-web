package services

import (
	"fmt"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

type TeamService struct {
	st store.Store
}

func NewTeamService(st store.Store) *TeamService {
	return &TeamService{st: st}
}

func (s *TeamService) ListMembers(params models.QueryParams) (models.PaginatedList[models.User], error) {
	list, err := s.st.ListUsers(params)
	if err != nil {
		return models.PaginatedList[models.User]{}, err
	}
	// Sanitize password hash
	for i := range list.Items {
		list.Items[i] = list.Items[i].Sanitize()
	}
	return list, nil
}

func (s *TeamService) GetMember(id string) (models.User, error) {
	user, err := s.st.GetUser(id)
	if err != nil {
		return models.User{}, err
	}
	return user.Sanitize(), nil
}

func (s *TeamService) countActiveAdmins() int {
	users, err := s.st.ListUsers(models.QueryParams{Limit: 10000})
	if err != nil {
		return 0
	}
	count := 0
	for _, u := range users.Items {
		if u.Role == models.RoleAdministrator && u.Status == models.UserStatusActive {
			count++
		}
	}
	return count
}

func (s *TeamService) UpdateRole(targetID string, newRole models.UserRole, actor *models.User) (models.User, error) {
	target, err := s.st.GetUser(targetID)
	if err != nil {
		return models.User{}, err
	}

	// Self protection
	if actor != nil && actor.ID == target.ID {
		return models.User{}, fmt.Errorf("%w: you cannot change your own role", store.ErrForbidden)
	}

	// Last-Admin protection
	if target.Role == models.RoleAdministrator && newRole != models.RoleAdministrator {
		if s.countActiveAdmins() <= 1 {
			return models.User{}, fmt.Errorf("%w: at least one active administrator is required", store.ErrForbidden)
		}
	}

	prevRole := target.Role
	target.Role = newRole
	updated, err := s.st.UpdateUser(target.ID, target)
	if err != nil {
		return models.User{}, err
	}

	actorName := "Administrator"
	if actor != nil {
		actorName = actor.Name
	}

	// Auto-track Activity, Audit, Notification
	_, _ = s.st.CreateActivity(models.Activity{
		ActorID:     actor.ID,
		ActorName:   actorName,
		Action:      "Role Changed",
		EntityType:  "User",
		EntityID:    target.ID,
		EntityName:  target.Name,
		Description: fmt.Sprintf("Changed role of %s from %s to %s.", target.Name, prevRole, newRole),
		Severity:    models.SeverityInfo,
	})

	_, _ = s.st.CreateAuditLog(models.AuditLog{
		ActorID:    actor.ID,
		ActorName:  actorName,
		Action:     "Role Changed",
		EntityType: "User",
		EntityID:   target.ID,
		EntityName: target.Name,
		Result:     models.AuditResultSuccess,
		Metadata:   map[string]string{"prevRole": string(prevRole), "newRole": string(newRole)},
	})

	_, _ = s.st.CreateNotification(models.Notification{
		Type:    models.NotificationTypeSystem,
		Title:   "Team Member Role Updated",
		Message: fmt.Sprintf("%s's role was changed to %s.", target.Name, newRole),
		Read:    false,
	})

	return updated.Sanitize(), nil
}

func (s *TeamService) UpdateStatus(targetID string, newStatus models.UserStatus, actor *models.User) (models.User, error) {
	target, err := s.st.GetUser(targetID)
	if err != nil {
		return models.User{}, err
	}

	// Self protection
	if actor != nil && actor.ID == target.ID {
		return models.User{}, fmt.Errorf("%w: you cannot suspend or alter your own account status", store.ErrForbidden)
	}

	// Last-Admin protection
	if target.Role == models.RoleAdministrator && newStatus != models.UserStatusActive {
		if s.countActiveAdmins() <= 1 {
			return models.User{}, fmt.Errorf("%w: at least one active administrator is required", store.ErrForbidden)
		}
	}

	target.Status = newStatus
	updated, err := s.st.UpdateUser(target.ID, target)
	if err != nil {
		return models.User{}, err
	}

	actorName := "Administrator"
	if actor != nil {
		actorName = actor.Name
	}

	severity := models.SeverityInfo
	if newStatus == models.UserStatusSuspended {
		severity = models.SeverityWarning
	}

	// Auto-track Activity, Audit, Notification
	_, _ = s.st.CreateActivity(models.Activity{
		ActorID:     actor.ID,
		ActorName:   actorName,
		Action:      fmt.Sprintf("Status %s", newStatus),
		EntityType:  "User",
		EntityID:    target.ID,
		EntityName:  target.Name,
		Description: fmt.Sprintf("Changed status of team member %s to %s.", target.Name, newStatus),
		Severity:    severity,
	})

	_, _ = s.st.CreateAuditLog(models.AuditLog{
		ActorID:    actor.ID,
		ActorName:  actorName,
		Action:     fmt.Sprintf("Member %s", newStatus),
		EntityType: "User",
		EntityID:   target.ID,
		EntityName: target.Name,
		Result:     models.AuditResultSuccess,
	})

	return updated.Sanitize(), nil
}
