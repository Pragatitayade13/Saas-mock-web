package services_test

import (
	"testing"
	"time"

	"nexora/backend/internal/models"
	"nexora/backend/internal/services"
	"nexora/backend/internal/store"
)

func TestDashboardCalculations(t *testing.T) {
	st := store.NewMemoryStore()
	_ = st.ResetStore(store.SeedData{
		Customers: []models.Customer{
			{ID: "CUS-1", Name: "Customer 1", Email: "c1@test.com", Status: models.CustomerStatusActive, Plan: models.PlanEnterprise},
			{ID: "CUS-2", Name: "Customer 2", Email: "c2@test.com", Status: models.CustomerStatusActive, Plan: models.PlanProfessional},
		},
		Subscriptions: []models.Subscription{
			{ID: "SUB-1", CustomerID: "CUS-1", Plan: models.PlanEnterprise, Status: models.SubscriptionStatusActive, Amount: 2400.0, BillingCycle: models.BillingCycleMonthly},
			{ID: "SUB-2", CustomerID: "CUS-2", Plan: models.PlanProfessional, Status: models.SubscriptionStatusActive, Amount: 499.0, BillingCycle: models.BillingCycleMonthly},
		},
		Transactions: []models.Transaction{
			{ID: "TXN-1", CustomerID: "CUS-1", Amount: 2400.0, Currency: "USD", Status: models.TransactionStatusCompleted, CreatedAt: time.Now()},
			{ID: "TXN-2", CustomerID: "CUS-2", Amount: 499.0, Currency: "USD", Status: models.TransactionStatusCompleted, CreatedAt: time.Now()},
		},
		Notifications: []models.Notification{
			{ID: "NOT-1", UserID: "USR-1", Title: "Test Notification", Type: models.NotificationTypeSystem, CreatedAt: time.Now()},
		},
	})

	dashSvc := services.NewDashboardService(st)
	data, err := dashSvc.GetDashboardData()
	if err != nil {
		t.Fatalf("unexpected error fetching dashboard data: %v", err)
	}

	// Verify Total Revenue
	expectedRevenue := 2899.0
	if data.RevenueMetrics.RawValue != expectedRevenue {
		t.Errorf("expected revenue %.2f, got %.2f", expectedRevenue, data.RevenueMetrics.RawValue)
	}

	// Verify MRR & ARR
	expectedMRR := 2899.0
	expectedARR := 2899.0 * 12.0
	if data.MRR != expectedMRR {
		t.Errorf("expected MRR %.2f, got %.2f", expectedMRR, data.MRR)
	}
	if data.ARR != expectedARR {
		t.Errorf("expected ARR %.2f, got %.2f", expectedARR, data.ARR)
	}

	// Verify Active Counts
	if data.CustomerMetrics.RawValue != 2 {
		t.Errorf("expected 2 active customers, got %v", data.CustomerMetrics.RawValue)
	}
	if data.SubscriptionMetrics.RawValue != 2 {
		t.Errorf("expected 2 active subscriptions, got %v", data.SubscriptionMetrics.RawValue)
	}
}

func TestCustomerService(t *testing.T) {
	st := store.NewMemoryStore()
	custSvc := services.NewCustomerService(st)

	// Create Customer Validation
	_, err := custSvc.CreateCustomer(models.Customer{Name: "", Email: "test@test.com", Company: "Test"})
	if err == nil {
		t.Fatal("expected error for missing name")
	}

	_, err = custSvc.CreateCustomer(models.Customer{Name: "John", Email: "invalid-email", Company: "Test"})
	if err == nil {
		t.Fatal("expected error for invalid email")
	}

	c1, err := custSvc.CreateCustomer(models.Customer{
		Name:           "John Doe",
		Email:          "john@example.com",
		Company:        "Acme Corp",
		Plan:           models.PlanProfessional,
		Status:         models.CustomerStatusActive,
		MonthlyRevenue: 499.0,
	})
	if err != nil {
		t.Fatalf("unexpected error creating customer: %v", err)
	}

	// Duplicate Email Prevention
	_, err = custSvc.CreateCustomer(models.Customer{
		Name:    "Jane Doe",
		Email:   "john@example.com",
		Company: "Beta Corp",
	})
	if err != store.ErrCustomerEmailExists {
		t.Fatalf("expected ErrCustomerEmailExists, got %v", err)
	}

	// Update Customer
	updated, err := custSvc.UpdateCustomer(c1.ID, models.Customer{
		Name:    "John Updated",
		Company: "Acme Enterprise",
	})
	if err != nil || updated.Name != "John Updated" {
		t.Fatalf("failed updating customer: %v", err)
	}

	// Customer Transactions Lookup
	txns, err := custSvc.GetCustomerTransactions(c1.ID)
	if err != nil || txns.Meta.Total != 0 {
		t.Fatalf("expected 0 transactions for new customer, got %d", txns.Meta.Total)
	}
}

func TestSubscriptionService(t *testing.T) {
	st := store.NewMemoryStore()
	custSvc := services.NewCustomerService(st)
	subSvc := services.NewSubscriptionService(st)

	c1, err := custSvc.CreateCustomer(models.Customer{
		Name:    "Alice Smith",
		Email:   "alice@acme.com",
		Company: "Acme Corp",
	})
	if err != nil {
		t.Fatalf("failed to create customer: %v", err)
	}

	// Create Subscription
	sub, err := subSvc.CreateSubscription(models.Subscription{
		CustomerID:   c1.ID,
		Plan:         models.PlanProfessional,
		BillingCycle: models.BillingCycleMonthly,
		StartDate:    time.Date(2026, 1, 31, 0, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("failed to create subscription: %v", err)
	}

	// Amount calculation check ($99.00 for Professional Monthly)
	if sub.Amount != 99.0 {
		t.Fatalf("expected amount $99.00, got %.2f", sub.Amount)
	}

	// NextBillingDate calculation check (Jan 31 + 1 month -> Feb 28/29)
	if sub.NextBillingDate.Month() != time.February {
		t.Fatalf("expected next billing month to be February, got %v", sub.NextBillingDate.Month())
	}

	// One active subscription rule
	_, err = subSvc.CreateSubscription(models.Subscription{
		CustomerID:   c1.ID,
		Plan:         models.PlanStarter,
		BillingCycle: models.BillingCycleMonthly,
	})
	if err != store.ErrActiveSubscriptionExists {
		t.Fatalf("expected ErrActiveSubscriptionExists when creating second active subscription, got %v", err)
	}

	// Change Plan
	upgraded, err := subSvc.ChangePlan(sub.ID, models.PlanEnterprise)
	if err != nil || upgraded.Plan != models.PlanEnterprise || upgraded.Amount != 299.0 {
		t.Fatalf("failed to change plan to Enterprise: %v", err)
	}

	// Cancel Subscription
	cancelled, err := subSvc.CancelSubscription(sub.ID)
	if err != nil || cancelled.Status != models.SubscriptionStatusCancelled {
		t.Fatalf("failed to cancel subscription: %v", err)
	}
}

func TestTransactionService(t *testing.T) {
	st := store.NewMemoryStore()
	custSvc := services.NewCustomerService(st)
	txnSvc := services.NewTransactionService(st)

	c1, err := custSvc.CreateCustomer(models.Customer{
		Name:    "Bob Builder",
		Email:   "bob@builder.com",
		Company: "Build Co",
	})
	if err != nil {
		t.Fatalf("failed to create customer: %v", err)
	}

	// 1. Create Completed Transaction
	t1, err := txnSvc.CreateTransaction(models.Transaction{
		CustomerID: c1.ID,
		Amount:     100.0,
		Status:     models.TransactionStatusCompleted,
		Type:       models.TransactionTypeSubscription,
	})
	if err != nil {
		t.Fatalf("failed to create completed transaction: %v", err)
	}

	// 2. Create Pending & Failed Transactions
	_, _ = txnSvc.CreateTransaction(models.Transaction{
		CustomerID: c1.ID,
		Amount:     50.0,
		Status:     models.TransactionStatusPending,
		Type:       models.TransactionTypeSubscription,
	})
	_, _ = txnSvc.CreateTransaction(models.Transaction{
		CustomerID: c1.ID,
		Amount:     25.0,
		Status:     models.TransactionStatusFailed,
		Type:       models.TransactionTypeSubscription,
	})

	// 3. Verify Realized Revenue (should only include completed $100)
	summary, err := txnSvc.GetTransactionSummary()
	if err != nil || summary.TotalRevenue != 100.0 || summary.PendingAmount != 50.0 {
		t.Fatalf("expected total revenue $100.00 and pending $50.00, got revenue %.2f, pending %.2f", summary.TotalRevenue, summary.PendingAmount)
	}

	// 4. Refund Completed Transaction
	refund, err := txnSvc.RefundTransaction(t1.ID)
	if err != nil || refund.Type != models.TransactionTypeRefund {
		t.Fatalf("failed to refund transaction: %v", err)
	}

	// 5. Verify Realized Revenue after refund (should be $0)
	summaryAfterRefund, err := txnSvc.GetTransactionSummary()
	if err != nil || summaryAfterRefund.TotalRevenue != 0.0 {
		t.Fatalf("expected realized revenue $0 after refund, got %.2f", summaryAfterRefund.TotalRevenue)
	}

	// 6. Prevent Duplicate Refund
	_, err = txnSvc.RefundTransaction(t1.ID)
	if err != store.ErrAlreadyRefunded {
		t.Fatalf("expected ErrAlreadyRefunded, got %v", err)
	}
}

func TestAnalyticsService(t *testing.T) {
	st := store.NewMemoryStore()
	analyticsSvc := services.NewAnalyticsService(st)
	custSvc := services.NewCustomerService(st)
	subSvc := services.NewSubscriptionService(st)

	c1, _ := custSvc.CreateCustomer(models.Customer{
		Name:    "Alice Smith",
		Email:   "alice@smith.com",
		Company: "Smith LLC",
	})

	_, _ = subSvc.CreateSubscription(models.Subscription{
		CustomerID:   c1.ID,
		Plan:         models.PlanProfessional,
		BillingCycle: models.BillingCycleMonthly,
	})

	// 1. Verify MRR (Professional Monthly = $99)
	mrrData, err := analyticsSvc.GetMRR(models.QueryParams{})
	if err != nil || mrrData.MRR != 99.0 || mrrData.ARR != 1188.0 {
		t.Fatalf("expected MRR $99.00 and ARR $1188.00, got MRR %.2f, ARR %.2f", mrrData.MRR, mrrData.ARR)
	}

	// 2. Verify Analytics Summary
	summary, err := analyticsSvc.GetSummary(models.QueryParams{})
	if err != nil {
		t.Fatalf("failed to get analytics summary: %v", err)
	}
	if summary.ActiveSubscriptions.Value != 1.0 {
		t.Fatalf("expected 1 active subscription in summary, got %.0f", summary.ActiveSubscriptions.Value)
	}

	// 3. Verify Churn calculation with 0 baseline (safe division-by-zero)
	churn, err := analyticsSvc.GetChurn(models.QueryParams{})
	if err != nil || churn.ChurnRate < 0 {
		t.Fatalf("unexpected churn calculation: %v, rate: %.2f", err, churn.ChurnRate)
	}
}

func TestReportsActivityAuditServices(t *testing.T) {
	st := store.NewMemoryStore()
	reportSvc := services.NewReportService(st)
	actSvc := services.NewActivityService(st)
	auditSvc := services.NewAuditService(st)
	custSvc := services.NewCustomerService(st)

	// 1. Customer creation should trigger activity and audit entries
	_, err := custSvc.CreateCustomer(models.Customer{
		Name:    "Audit User",
		Email:   "audit@test.com",
		Company: "Audit Inc",
	})
	if err != nil {
		t.Fatalf("failed to create customer: %v", err)
	}

	activities, err := actSvc.ListActivities(models.QueryParams{})
	if err != nil || len(activities.Items) == 0 {
		t.Fatalf("expected auto-tracked activity record after customer creation, got %d items", len(activities.Items))
	}

	audits, err := auditSvc.ListAuditLogs(models.QueryParams{})
	if err != nil || len(audits.Items) == 0 {
		t.Fatalf("expected auto-tracked audit record after customer creation, got %d items", len(audits.Items))
	}

	// 2. Create Report
	rpt, err := reportSvc.CreateReport(models.Report{
		Name:      "Revenue Performance Report",
		Type:      models.ReportTypeRevenue,
		CreatedBy: "Administrator",
	})
	if err != nil || rpt.Status != models.ReportStatusCompleted {
		t.Fatalf("failed to create report: %v", err)
	}

	// 3. Generate CSV
	csvData, err := reportSvc.GenerateCSV(rpt.ID)
	if err != nil || len(csvData) == 0 {
		t.Fatalf("failed to generate report CSV: %v", err)
	}

	// 4. Delete Report
	if err := reportSvc.DeleteReport(rpt.ID); err != nil {
		t.Fatalf("failed to delete report: %v", err)
	}

	// Verify report is gone
	_, err = reportSvc.GetReport(rpt.ID)
	if err != store.ErrNotFound {
		t.Fatalf("expected ErrNotFound after report deletion, got %v", err)
	}
}

func TestSlice10Services(t *testing.T) {
	st := store.NewMemoryStore()
	orgSvc := services.NewOrganizationService(st)
	teamSvc := services.NewTeamService(st)
	invSvc := services.NewInvitationService(st)
	secSvc := services.NewSecurityService(st)

	// 1. Organization Update
	org, err := orgSvc.GetOrganization()
	if err != nil || org.Name == "" {
		t.Fatalf("failed to get organization: %v", err)
	}

	org.Name = "Updated Tech Enterprise"
	updatedOrg, err := orgSvc.UpdateOrganization(org, "Administrator")
	if err != nil || updatedOrg.Name != "Updated Tech Enterprise" {
		t.Fatalf("failed to update organization: %v", err)
	}

	// 2. Create Admin User
	adminUser, err := st.CreateUser(models.User{
		Name:   "Sole Admin",
		Email:  "admin@test.com",
		Role:   models.RoleAdministrator,
		Status: models.UserStatusActive,
	})
	if err != nil {
		t.Fatalf("failed to create admin user: %v", err)
	}

	// 3. Last-Admin Protection: attempt to demote sole admin
	_, err = teamSvc.UpdateRole(adminUser.ID, models.RoleViewer, &models.User{ID: "OTHER-USER"})
	if err == nil {
		t.Fatalf("expected Last-Admin protection error when demoting sole admin, got nil")
	}

	// 4. Self-Protection: attempt to alter own status
	_, err = teamSvc.UpdateStatus(adminUser.ID, models.UserStatusSuspended, &adminUser)
	if err == nil {
		t.Fatalf("expected Self-Protection error when suspending self, got nil")
	}

	// 5. Invitation Flow & Acceptance
	inv, err := invSvc.CreateInvitation(models.Invitation{
		Name:  "Invited Teammate",
		Email: "teammate@test.com",
		Role:  models.RoleManager,
	}, &adminUser)
	if err != nil || inv.Status != models.InvitationStatusPending {
		t.Fatalf("failed to create invitation: %v", err)
	}

	acceptedUser, err := invSvc.AcceptInvitation(inv.Token)
	if err != nil || acceptedUser.Role != models.RoleManager {
		t.Fatalf("failed to accept invitation: %v", err)
	}

	// 6. Security Session Revocation
	sess1, _ := st.CreateSession(models.Session{UserID: adminUser.ID})
	sess2, _ := st.CreateSession(models.Session{UserID: adminUser.ID})
	if err := secSvc.RevokeOtherSessions(adminUser.ID, sess1.ID, adminUser.Name); err != nil {
		t.Fatalf("failed to revoke other sessions: %v", err)
	}

	// Verify sess2 is gone and sess1 remains
	_, ok1 := st.ValidateSession(sess1.ID)
	_, ok2 := st.ValidateSession(sess2.ID)
	if !ok1 || ok2 {
		t.Fatalf("expected current session active and other session revoked, got ok1=%v ok2=%v", ok1, ok2)
	}
}
