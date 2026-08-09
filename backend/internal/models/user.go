package models

import "time"

type UserRole string
type UserStatus string

const (
	RoleAdministrator UserRole = "Administrator"
	RoleManager       UserRole = "Manager"
	RoleViewer        UserRole = "Viewer"

	UserStatusActive    UserStatus = "Active"
	UserStatusInactive  UserStatus = "Inactive"
	UserStatusInvited   UserStatus = "Invited"
	UserStatusSuspended UserStatus = "Suspended"
)

type User struct {
	ID             string     `json:"id"`
	OrganizationID string     `json:"organizationId,omitempty"`
	Name           string     `json:"name"`
	Email          string     `json:"email"`
	Role           UserRole   `json:"role"`
	Avatar         string     `json:"avatar"`
	Status         UserStatus `json:"status"`
	PasswordHash   string     `json:"passwordHash,omitempty"`
	LastActiveAt   *time.Time `json:"lastActiveAt,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

func (u User) Sanitize() User {
	u.PasswordHash = ""
	return u
}

