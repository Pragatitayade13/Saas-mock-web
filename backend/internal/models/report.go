package models

import "time"

type ReportType string
type ReportStatus string

const (
	ReportTypeRevenue      ReportType = "Revenue"
	ReportTypeCustomer     ReportType = "Customer"
	ReportTypeSubscription ReportType = "Subscription"
	ReportTypeTransaction  ReportType = "Transaction"
	ReportTypeAnalytics    ReportType = "Analytics"
	ReportTypeActivity     ReportType = "Activity"

	ReportStatusPending    ReportStatus = "Pending"
	ReportStatusProcessing ReportStatus = "Processing"
	ReportStatusCompleted  ReportStatus = "Completed"
	ReportStatusFailed     ReportStatus = "Failed"
)

type Report struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Type        ReportType        `json:"type"`
	Format      string            `json:"format"`
	Status      ReportStatus      `json:"status"`
	CreatedBy   string            `json:"createdBy"`
	CreatedAt   time.Time         `json:"createdAt"`
	CompletedAt *time.Time        `json:"completedAt,omitempty"`
	Parameters  map[string]string `json:"parameters,omitempty"`
	RecordCount int               `json:"recordCount"`
}

type ReportSummary struct {
	TotalGenerated int `json:"totalGenerated"`
	CompletedCount int `json:"completedCount"`
	FailedCount    int `json:"failedCount"`
	ThisMonthCount int `json:"thisMonthCount"`
}
