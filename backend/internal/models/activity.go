package models

import "time"

type ActivitySeverity string

const (
	SeverityInfo     ActivitySeverity = "Info"
	SeveritySuccess  ActivitySeverity = "Success"
	SeverityWarning  ActivitySeverity = "Warning"
	SeverityCritical ActivitySeverity = "Critical"
)

type Activity struct {
	ID          string            `json:"id"`
	ActorID     string            `json:"actorId"`
	ActorName   string            `json:"actorName"`
	Action      string            `json:"action"`
	EntityType  string            `json:"entityType"`
	EntityID    string            `json:"entityId"`
	EntityName  string            `json:"entityName"`
	Description string            `json:"description"`
	Metadata    map[string]string `json:"metadata,omitempty"`
	CreatedAt   time.Time         `json:"createdAt"`
	Severity    ActivitySeverity  `json:"severity"`
}

type ActivitySummary struct {
	TotalToday      int `json:"totalToday"`
	SuccessfulCount int `json:"successfulCount"`
	WarningCount    int `json:"warningCount"`
	CriticalCount   int `json:"criticalCount"`
}
