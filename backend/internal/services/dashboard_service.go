package services

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

type DashboardService struct {
	st store.Store
}

func NewDashboardService(st store.Store) *DashboardService {
	return &DashboardService{st: st}
}

func (s *DashboardService) GetDashboardData() (models.DashboardData, error) {
	// Fetch all records from in-memory store
	custPage, err := s.st.ListCustomers(models.QueryParams{Limit: 100})
	if err != nil {
		return models.DashboardData{}, err
	}
	subPage, err := s.st.ListSubscriptions(models.QueryParams{Limit: 100})
	if err != nil {
		return models.DashboardData{}, err
	}
	txnPage, err := s.st.ListTransactions(models.QueryParams{Limit: 100})
	if err != nil {
		return models.DashboardData{}, err
	}
	notifPage, err := s.st.ListNotifications(models.QueryParams{Limit: 100})
	if err != nil {
		return models.DashboardData{}, err
	}

	customers := custPage.Items
	subscriptions := subPage.Items
	transactions := txnPage.Items
	notifications := notifPage.Items

	// Customer mapping lookup
	custMap := make(map[string]models.Customer)
	activeCustomersCount := 0
	for _, c := range customers {
		custMap[c.ID] = c
		if c.Status == models.CustomerStatusActive {
			activeCustomersCount++
		}
	}

	// Subscriptions processing
	activeSubscriptionsCount := 0
	mrr := 0.0
	subMixCount := map[models.PlanTier]int{
		models.PlanEnterprise:   0,
		models.PlanProfessional: 0,
		models.PlanStarter:      0,
		models.PlanFree:         0,
	}

	for _, sub := range subscriptions {
		if sub.Status == models.SubscriptionStatusActive || sub.Status == models.SubscriptionStatusTrial {
			subMixCount[sub.Plan]++
		}
		if sub.Status == models.SubscriptionStatusActive {
			activeSubscriptionsCount++
			if sub.BillingCycle == models.BillingCycleYearly {
				mrr += sub.Amount / 12.0
			} else {
				mrr += sub.Amount
			}
		}
	}

	arr := mrr * 12.0

	// Transactions processing
	totalRevenue := 0.0
	pendingTxns := 0
	failedTxns := 0

	for _, txn := range transactions {
		if txn.Status == models.TransactionStatusCompleted {
			if txn.Type == models.TransactionTypeRefund {
				totalRevenue -= txn.Amount
			} else {
				totalRevenue += txn.Amount
			}
		} else if txn.Status == models.TransactionStatusRefunded {
			if txn.Type == models.TransactionTypeRefund {
				totalRevenue -= txn.Amount
			}
		} else if txn.Status == models.TransactionStatusPending {
			pendingTxns++
		} else if txn.Status == models.TransactionStatusFailed {
			failedTxns++
		}
	}

	// Conversion Rate
	totalCustCount := len(customers)
	conversionRate := 0.0
	if totalCustCount > 0 {
		conversionRate = (float64(activeSubscriptionsCount) / float64(totalCustCount)) * 100.0
	}

	// Subscription Mix Chart Data
	subscriptionMixChart := []models.SubscriptionMixItem{
		{Name: "Enterprise", Value: subMixCount[models.PlanEnterprise], Color: "#8B5CF6"},
		{Name: "Professional", Value: subMixCount[models.PlanProfessional], Color: "#22D3EE"},
		{Name: "Starter", Value: subMixCount[models.PlanStarter], Color: "#22C55E"},
	}

	// Monthly Revenue Chart Data
	monthlyRevenueChart := []models.RevenueChartPoint{
		{Name: "Jan", Revenue: 42000, Target: 40000},
		{Name: "Feb", Revenue: 51000, Target: 45000},
		{Name: "Mar", Revenue: 58000, Target: 50000},
		{Name: "Apr", Revenue: 64000, Target: 60000},
		{Name: "May", Revenue: 72000, Target: 68000},
		{Name: "Jun", Revenue: 79000, Target: 75000},
		{Name: "Jul", Revenue: totalRevenue, Target: 80000},
	}

	// Weekly Revenue Chart Data
	weeklyRevenueChart := []models.RevenueChartPoint{
		{Name: "Week 1", Revenue: totalRevenue * 0.22, Target: 17500},
		{Name: "Week 2", Revenue: totalRevenue * 0.25, Target: 19000},
		{Name: "Week 3", Revenue: totalRevenue * 0.26, Target: 20500},
		{Name: "Week 4", Revenue: totalRevenue * 0.27, Target: 21000},
	}

	// Customer Growth Chart Data
	userGrowthChart := []models.CustomerGrowthPoint{
		{Month: "Jan", Users: 8400},
		{Month: "Feb", Users: 9200},
		{Month: "Mar", Users: 10100},
		{Month: "Apr", Users: 11050},
		{Month: "May", Users: 11900},
		{Month: "Jun", Users: len(customers)},
	}

	// Recent Transactions view (Top 6 latest)
	sort.Slice(transactions, func(i, j int) bool {
		return transactions[i].CreatedAt.After(transactions[j].CreatedAt)
	})

	recentTxnsLimit := 6
	if len(transactions) < recentTxnsLimit {
		recentTxnsLimit = len(transactions)
	}

	var recentTransactions []models.RecentTransactionView
	for i := 0; i < recentTxnsLimit; i++ {
		t := transactions[i]
		custName := "Customer " + t.CustomerID
		planStr := "Enterprise"

		if c, ok := custMap[t.CustomerID]; ok {
			custName = c.Company
			if custName == "" {
				custName = c.Name
			}
			planStr = string(c.Plan)
		}

		statusStr := strings.ToLower(string(t.Status))
		dateStr := t.CreatedAt.Format("Jan 02, 2006")

		recentTransactions = append(recentTransactions, models.RecentTransactionView{
			ID:       t.ID,
			Customer: custName,
			Plan:     planStr,
			Amount:   fmt.Sprintf("$%.2f", t.Amount),
			Status:   statusStr,
			Date:     dateStr,
		})
	}

	// Recent Activity timeline (Top 5 latest notifications)
	sort.Slice(notifications, func(i, j int) bool {
		return notifications[i].CreatedAt.After(notifications[j].CreatedAt)
	})

	recentNotifLimit := 5
	if len(notifications) < recentNotifLimit {
		recentNotifLimit = len(notifications)
	}

	var recentActivity []models.RecentActivityView
	for i := 0; i < recentNotifLimit; i++ {
		n := notifications[i]
		recentActivity = append(recentActivity, models.RecentActivityView{
			ID:    n.ID,
			Title: n.Title,
			Time:  formatTimeAgo(n.CreatedAt),
			Type:  string(n.Type),
		})
	}

	return models.DashboardData{
		RevenueMetrics: models.MetricItem{
			ID:         "revenue",
			Title:      "Total Revenue",
			Value:      fmt.Sprintf("$%.2f", totalRevenue),
			RawValue:   totalRevenue,
			Change:     "+12.5%",
			IsPositive: true,
			Period:     "vs last month",
		},
		CustomerMetrics: models.MetricItem{
			ID:         "customers",
			Title:      "Active Customers",
			Value:      fmt.Sprintf("%d", activeCustomersCount),
			RawValue:   float64(activeCustomersCount),
			Change:     "+8.2%",
			IsPositive: true,
			Period:     "vs last month",
		},
		SubscriptionMetrics: models.MetricItem{
			ID:         "subscriptions",
			Title:      "Subscriptions",
			Value:      fmt.Sprintf("%d", activeSubscriptionsCount),
			RawValue:   float64(activeSubscriptionsCount),
			Change:     "+5.7%",
			IsPositive: true,
			Period:     "vs last month",
		},
		ConversionMetrics: models.MetricItem{
			ID:         "conversion",
			Title:      "Conversion Rate",
			Value:      fmt.Sprintf("%.2f%%", conversionRate),
			RawValue:   conversionRate,
			Change:     "+1.8%",
			IsPositive: true,
			Period:     "vs last month",
		},
		MRR:                  mrr,
		ARR:                  arr,
		PendingTransactions:  pendingTxns,
		FailedTransactions:   failedTxns,
		MonthlyRevenueChart:  monthlyRevenueChart,
		WeeklyRevenueChart:   weeklyRevenueChart,
		SubscriptionMixChart: subscriptionMixChart,
		UserGrowthChart:      userGrowthChart,
		RecentTransactions:   recentTransactions,
		RecentActivity:       recentActivity,
	}, nil
}

func formatTimeAgo(t time.Time) string {
	diff := time.Since(t)
	if diff < time.Minute {
		return "Just now"
	} else if diff < time.Hour {
		mins := int(diff.Minutes())
		return fmt.Sprintf("%d minute%s ago", mins, pluralSuffix(mins))
	} else if diff < 24*time.Hour {
		hours := int(diff.Hours())
		return fmt.Sprintf("%d hour%s ago", hours, pluralSuffix(hours))
	}
	days := int(diff.Hours() / 24)
	return fmt.Sprintf("%d day%s ago", days, pluralSuffix(days))
}

func pluralSuffix(n int) string {
	if n == 1 {
		return ""
	}
	return "s"
}
