package models

import "time"

type AuditResult string

const (
	AuditResultSuccess AuditResult = "Success"
	AuditResultFailed  AuditResult = "Failed"
	AuditResultDenied  AuditResult = "Denied"
)

type AuditLog struct {
	ID         string            `json:"id"`
	ActorID    string            `json:"actorId"`
	ActorName  string            `json:"actorName"`
	Action     string            `json:"action"`
	EntityType string            `json:"entityType"`
	EntityID   string            `json:"entityId"`
	EntityName string            `json:"entityName"`
	Timestamp  time.Time         `json:"timestamp"`
	Result     AuditResult       `json:"result"`
	Reason     string            `json:"reason,omitempty"`
	Metadata   map[string]string `json:"metadata,omitempty"`
	IPAddress  string            `json:"ipAddress"`
}

type AuditSummary struct {
	TotalEventsToday int `json:"totalEventsToday"`
	SuccessCount     int `json:"successCount"`
	DeniedCount      int `json:"deniedCount"`
	FailedCount      int `json:"failedCount"`
}
