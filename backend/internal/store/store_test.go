package store_test

import (
	"sync"
	"testing"
	"time"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

func createTestStore() *store.MemoryStore {
	st := store.NewMemoryStore()
	seed := store.SeedData{
		Users: []models.User{
			{ID: "USR-5001", Name: "Admin User", Email: "admin@test.com", Role: models.RoleAdministrator, Status: models.UserStatusActive},
		},
		Customers: []models.Customer{
			{ID: "CUS-1001", Name: "Acme Corp", Email: "info@acme.com", Company: "Acme Corp", Plan: models.PlanEnterprise, Status: models.CustomerStatusActive, MonthlyRevenue: 2400.0, Location: "New York"},
			{ID: "CUS-1002", Name: "Beta LLC", Email: "info@beta.com", Company: "Beta LLC", Plan: models.PlanStarter, Status: models.CustomerStatusInactive, MonthlyRevenue: 99.0, Location: "London"},
		},
		Subscriptions: []models.Subscription{
			{ID: "SUB-2001", CustomerID: "CUS-1001", Plan: models.PlanEnterprise, Status: models.SubscriptionStatusActive, Amount: 2400.0, BillingCycle: models.BillingCycleMonthly},
		},
		Transactions: []models.Transaction{
			{ID: "TXN-3001", CustomerID: "CUS-1001", SubscriptionID: "SUB-2001", Amount: 2400.0, Currency: "USD", Status: models.TransactionStatusCompleted, Type: models.TransactionTypeSubscription, CreatedAt: time.Now()},
		},
		Notifications: []models.Notification{
			{ID: "NOT-4001", UserID: "USR-5001", Type: models.NotificationTypePayment, Title: "Payment received", Message: "Received $2,400.00", Read: false, CreatedAt: time.Now()},
		},
	}
	_ = st.ResetStore(seed)
	return st
}

func TestCustomerCRUD(t *testing.T) {
	st := createTestStore()

	// Get Customer
	c, err := st.GetCustomer("CUS-1001")
	if err != nil || c.Name != "Acme Corp" {
		t.Fatalf("expected customer Acme Corp, got error %v", err)
	}

	// Create Customer
	newCust, err := st.CreateCustomer(models.Customer{
		Name:    "Gamma Inc",
		Email:   "gamma@test.com",
		Company: "Gamma Inc",
		Plan:    models.PlanProfessional,
		Status:  models.CustomerStatusActive,
	})
	if err != nil || newCust.ID == "" {
		t.Fatalf("failed to create customer: %v", err)
	}

	// Update Customer
	newCust.Company = "Gamma Global"
	updated, err := st.UpdateCustomer(newCust.ID, newCust)
	if err != nil || updated.Company != "Gamma Global" {
		t.Fatalf("failed to update customer: %v", err)
	}

	// FindCustomerByEmail
	found, err := st.FindCustomerByEmail("info@acme.com")
	if err != nil || found.ID != "CUS-1001" {
		t.Fatalf("expected to find customer by email info@acme.com, got %v", err)
	}

	// Delete Customer with active subscription should fail with ErrCustomerHasDependencies
	err = st.DeleteCustomer("CUS-1001")
	if err != store.ErrCustomerHasDependencies && err != store.ErrConflict {
		t.Fatalf("expected ErrCustomerHasDependencies when deleting customer with active subscription, got %v", err)
	}

	// Delete customer without subscriptions
	err = st.DeleteCustomer(newCust.ID)
	if err != nil {
		t.Fatalf("failed to delete customer: %v", err)
	}
}

func TestSearchPaginationSorting(t *testing.T) {
	st := createTestStore()

	// Filter by search
	res, err := st.ListCustomers(models.QueryParams{Search: "acme", Page: 1, Limit: 10})
	if err != nil || len(res.Items) != 1 {
		t.Fatalf("expected 1 search result for 'acme', got %d", len(res.Items))
	}

	// Pagination bounds check
	res, err = st.ListCustomers(models.QueryParams{Page: 1, Limit: 1})
	if err != nil || len(res.Items) != 1 || res.Meta.TotalPages != 2 {
		t.Fatalf("expected 1 item per page, totalPages 2, got %d and %d", len(res.Items), res.Meta.TotalPages)
	}
}

func TestConcurrencySafety(t *testing.T) {
	st := createTestStore()
	var wg sync.WaitGroup

	// Concurrently read and write to verify race condition detector
	for i := 0; i < 50; i++ {
		wg.Add(3)

		go func(idx int) {
			defer wg.Done()
			_, _ = st.ListCustomers(models.QueryParams{Page: 1, Limit: 20})
		}(i)

		go func(idx int) {
			defer wg.Done()
			_, _ = st.CreateCustomer(models.Customer{
				Name:    "Concurrent Customer",
				Email:   "concurrent@test.com",
				Company: "Concurrent Corp",
			})
		}(i)

		go func(idx int) {
			defer wg.Done()
			_, _ = st.ListTransactions(models.QueryParams{Limit: 10})
		}(i)
	}

	// Subscription Query Methods
	activeSub, err := st.FindActiveByCustomer("CUS-1001")
	if err != nil || activeSub.ID != "SUB-2001" {
		t.Fatalf("expected to find active subscription for CUS-1001, got %v", err)
	}

	subsByCust, err := st.FindByCustomer("CUS-1001")
	if err != nil || len(subsByCust) != 1 {
		t.Fatalf("expected 1 subscription for CUS-1001, got %d", len(subsByCust))
	}

	subsByPlan, err := st.FindByPlan(models.PlanEnterprise)
	if err != nil || len(subsByPlan) != 1 {
		t.Fatalf("expected 1 Enterprise subscription, got %d", len(subsByPlan))
	}

	subsByStatus, err := st.FindByStatus(models.SubscriptionStatusActive)
	if err != nil || len(subsByStatus) != 1 {
		t.Fatalf("expected 1 Active subscription, got %d", len(subsByStatus))
	}
}
