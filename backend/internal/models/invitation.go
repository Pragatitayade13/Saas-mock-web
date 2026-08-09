package models

import "time"

type InvitationStatus string

const (
	InvitationStatusPending  InvitationStatus = "Pending"
	InvitationStatusAccepted InvitationStatus = "Accepted"
	InvitationStatusExpired  InvitationStatus = "Expired"
	InvitationStatusRevoked  InvitationStatus = "Revoked"
)

type Invitation struct {
	ID             string           `json:"id"`
	OrganizationID string           `json:"organizationId"`
	Email          string           `json:"email"`
	Name           string           `json:"name"`
	Role           UserRole         `json:"role"`
	Token          string           `json:"token"`
	Status         InvitationStatus `json:"status"`
	CreatedBy      string           `json:"createdBy"`
	CreatedAt      time.Time        `json:"createdAt"`
	ExpiresAt      time.Time        `json:"expiresAt"`
}
