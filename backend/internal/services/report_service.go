package services

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"strings"
	"time"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

type ReportService struct {
	st store.Store
}

func NewReportService(st store.Store) *ReportService {
	return &ReportService{st: st}
}

func (s *ReportService) GetReport(id string) (models.Report, error) {
	if strings.TrimSpace(id) == "" {
		return models.Report{}, store.ErrInvalidInput
	}
	return s.st.GetReport(id)
}

func (s *ReportService) ListReports(params models.QueryParams) (models.PaginatedList[models.Report], error) {
	return s.st.ListReports(params)
}

func (s *ReportService) CreateReport(rpt models.Report) (models.Report, error) {
	if rpt.Name == "" {
		rpt.Name = fmt.Sprintf("%s Report", rpt.Type)
	}
	if rpt.CreatedBy == "" {
		rpt.CreatedBy = "Administrator"
	}
	if rpt.Type == "" {
		rpt.Type = models.ReportTypeRevenue
	}
	if rpt.Format == "" {
		rpt.Format = "CSV"
	}

	// Count matching records for metrics
	var recordCount int
	switch rpt.Type {
	case models.ReportTypeRevenue, models.ReportTypeTransaction:
		txns, _ := s.st.ListTransactions(models.QueryParams{Limit: 10000})
		recordCount = len(txns.Items)
	case models.ReportTypeCustomer:
		custs, _ := s.st.ListCustomers(models.QueryParams{Limit: 10000})
		recordCount = len(custs.Items)
	case models.ReportTypeSubscription:
		subs, _ := s.st.ListSubscriptions(models.QueryParams{Limit: 10000})
		recordCount = len(subs.Items)
	case models.ReportTypeActivity:
		acts, _ := s.st.ListActivities(models.QueryParams{Limit: 10000})
		recordCount = len(acts.Items)
	default:
		recordCount = 100
	}

	rpt.RecordCount = recordCount
	rpt.Status = models.ReportStatusCompleted
	now := time.Now().UTC()
	rpt.CompletedAt = &now

	created, err := s.st.CreateReport(rpt)
	if err != nil {
		return models.Report{}, err
	}

	// Auto-track Activity & Audit
	_, _ = s.st.CreateActivity(models.Activity{
		ActorName:   created.CreatedBy,
		Action:      "Created",
		EntityType:  "Report",
		EntityID:    created.ID,
		EntityName:  created.Name,
		Description: fmt.Sprintf("Generated new %s report containing %d records.", created.Type, created.RecordCount),
		Severity:    models.SeveritySuccess,
	})

	_, _ = s.st.CreateAuditLog(models.AuditLog{
		ActorName:  created.CreatedBy,
		Action:     "Report Created",
		EntityType: "Report",
		EntityID:   created.ID,
		EntityName: created.Name,
		Result:     models.AuditResultSuccess,
	})

	return created, nil
}

func (s *ReportService) DeleteReport(id string) error {
	rpt, err := s.st.GetReport(id)
	if err != nil {
		return err
	}

	if err := s.st.DeleteReport(id); err != nil {
		return err
	}

	// Auto-track Activity & Audit
	_, _ = s.st.CreateActivity(models.Activity{
		ActorName:   "Administrator",
		Action:      "Deleted",
		EntityType:  "Report",
		EntityID:    rpt.ID,
		EntityName:  rpt.Name,
		Description: fmt.Sprintf("Deleted report %s.", rpt.ID),
		Severity:    models.SeverityWarning,
	})

	_, _ = s.st.CreateAuditLog(models.AuditLog{
		ActorName:  "Administrator",
		Action:     "Report Deleted",
		EntityType: "Report",
		EntityID:   rpt.ID,
		EntityName: rpt.Name,
		Result:     models.AuditResultSuccess,
	})

	return nil
}

func (s *ReportService) GenerateCSV(id string) (string, error) {
	rpt, err := s.st.GetReport(id)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	w := csv.NewWriter(&buf)

	switch rpt.Type {
	case models.ReportTypeCustomer:
		custs, _ := s.st.ListCustomers(models.QueryParams{Limit: 10000})
		_ = w.Write([]string{"Customer ID", "Name", "Email", "Company", "Status", "Plan", "MRR", "Created At"})
		for _, c := range custs.Items {
			_ = w.Write([]string{c.ID, c.Name, c.Email, c.Company, string(c.Status), string(c.Plan), fmt.Sprintf("%.2f", c.MonthlyRevenue), c.CreatedAt.Format(time.RFC3339)})
		}
	case models.ReportTypeSubscription:
		subs, _ := s.st.ListSubscriptions(models.QueryParams{Limit: 10000})
		_ = w.Write([]string{"Subscription ID", "Customer ID", "Plan", "Billing Cycle", "Amount", "Status", "Next Billing Date"})
		for _, sub := range subs.Items {
			_ = w.Write([]string{sub.ID, sub.CustomerID, string(sub.Plan), string(sub.BillingCycle), fmt.Sprintf("%.2f", sub.Amount), string(sub.Status), sub.NextBillingDate.Format(time.RFC3339)})
		}
	case models.ReportTypeTransaction, models.ReportTypeRevenue:
		txns, _ := s.st.ListTransactions(models.QueryParams{Limit: 10000})
		_ = w.Write([]string{"Transaction ID", "Customer ID", "Subscription ID", "Type", "Amount", "Currency", "Status", "Payment Method", "Date"})
		for _, t := range txns.Items {
			_ = w.Write([]string{t.ID, t.CustomerID, t.SubscriptionID, string(t.Type), fmt.Sprintf("%.2f", t.Amount), t.Currency, string(t.Status), t.PaymentMethod, t.TransactionDate.Format(time.RFC3339)})
		}
	default:
		acts, _ := s.st.ListActivities(models.QueryParams{Limit: 10000})
		_ = w.Write([]string{"Activity ID", "Actor", "Action", "Entity Type", "Entity ID", "Description", "Timestamp"})
		for _, a := range acts.Items {
			_ = w.Write([]string{a.ID, a.ActorName, a.Action, a.EntityType, a.EntityID, a.Description, a.CreatedAt.Format(time.RFC3339)})
		}
	}

	w.Flush()

	// Track Download Activity & Audit Log
	_, _ = s.st.CreateActivity(models.Activity{
		ActorName:   "User",
		Action:      "Exported",
		EntityType:  "Report",
		EntityID:    rpt.ID,
		EntityName:  rpt.Name,
		Description: fmt.Sprintf("Downloaded report %s (%s format).", rpt.Name, rpt.Format),
		Severity:    models.SeverityInfo,
	})

	_, _ = s.st.CreateAuditLog(models.AuditLog{
		ActorName:  "User",
		Action:     "Report Downloaded",
		EntityType: "Report",
		EntityID:   rpt.ID,
		EntityName: rpt.Name,
		Result:     models.AuditResultSuccess,
	})

	return buf.String(), nil
}

func (s *ReportService) GetReportSummary() (models.ReportSummary, error) {
	list, err := s.st.ListReports(models.QueryParams{Limit: 10000})
	if err != nil {
		return models.ReportSummary{}, err
	}

	thisMonth := time.Now().UTC().Format("2006-01")
	var res models.ReportSummary
	res.TotalGenerated = len(list.Items)

	for _, r := range list.Items {
		if r.Status == models.ReportStatusCompleted {
			res.CompletedCount++
		} else if r.Status == models.ReportStatusFailed {
			res.FailedCount++
		}
		if r.CreatedAt.Format("2006-01") == thisMonth {
			res.ThisMonthCount++
		}
	}
	return res, nil
}
