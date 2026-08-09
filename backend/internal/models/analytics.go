package models

type MetricWithChange struct {
	Value         float64 `json:"value"`
	PreviousValue float64 `json:"previousValue"`
	ChangePercent float64 `json:"changePercent"`
}

type AnalyticsSummary struct {
	Revenue             MetricWithChange `json:"revenue"`
	Customers           MetricWithChange `json:"customers"`
	ActiveSubscriptions MetricWithChange `json:"activeSubscriptions"`
	MRR                 MetricWithChange `json:"mrr"`
}

type CustomerAnalytics struct {
	TotalCustomers           int `json:"totalCustomers"`
	NewCustomers             int `json:"newCustomers"`
	ActiveCustomers          int `json:"activeCustomers"`
	CustomersWithoutSubCount int `json:"customersWithoutSubCount"`
}

type AnalyticsCustomerGrowthPoint struct {
	Date                string `json:"date"`
	NewCustomers        int    `json:"newCustomers"`
	CumulativeCustomers int    `json:"cumulativeCustomers"`
}

type SubscriptionAnalytics struct {
	Total     int `json:"total"`
	Active    int `json:"active"`
	Trial     int `json:"trial"`
	PastDue   int `json:"pastDue"`
	Cancelled int `json:"cancelled"`
	Expired   int `json:"expired"`
}

type MRRAnalytics struct {
	MRR          float64 `json:"mrr"`
	ARR          float64 `json:"arr"`
	NetMRRGrowth float64 `json:"netMrrGrowth"`
}

type ChurnAnalytics struct {
	ChurnRate      float64 `json:"churnRate"`
	CancelledCount int     `json:"cancelledCount"`
	BaselineCount  int     `json:"baselineCount"`
}

type TransactionAnalytics struct {
	Total        int     `json:"total"`
	Completed    int     `json:"completed"`
	Pending      int     `json:"pending"`
	Failed       int     `json:"failed"`
	Refunded     int     `json:"refunded"`
	SuccessRate  float64 `json:"successRate"`
	RefundRate   float64 `json:"refundRate"`
	FailureRate  float64 `json:"failureRate"`
}

type TopCustomer struct {
	ID      string  `json:"id"`
	Name    string  `json:"name"`
	Company string  `json:"company"`
	Email   string  `json:"email"`
	Revenue float64 `json:"revenue"`
}

type TopPlan struct {
	Plan              PlanTier `json:"plan"`
	Revenue           float64  `json:"revenue"`
	SubscriptionCount int      `json:"subscriptionCount"`
}
