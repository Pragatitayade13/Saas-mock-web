package models

type MetricItem struct {
	ID         string  `json:"id"`
	Title      string  `json:"title"`
	Value      string  `json:"value"`
	RawValue   float64 `json:"rawValue"`
	Change     string  `json:"change"`
	IsPositive bool    `json:"isPositive"`
	Period     string  `json:"period"`
}

type RevenueChartPoint struct {
	Name    string  `json:"name"`
	Revenue float64 `json:"revenue"`
	Target  float64 `json:"target"`
}

type SubscriptionMixItem struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
	Color string `json:"color"`
}

type CustomerGrowthPoint struct {
	Month string `json:"month"`
	Users int    `json:"users"`
}

type RecentTransactionView struct {
	ID       string `json:"id"`
	Customer string `json:"customer"`
	Plan     string `json:"plan"`
	Amount   string `json:"amount"`
	Status   string `json:"status"`
	Date     string `json:"date"`
}

type RecentActivityView struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	Time  string `json:"time"`
	Type  string `json:"type"`
}

type DashboardData struct {
	RevenueMetrics       MetricItem              `json:"revenue"`
	CustomerMetrics      MetricItem              `json:"customers"`
	SubscriptionMetrics  MetricItem              `json:"subscriptions"`
	ConversionMetrics    MetricItem              `json:"conversion"`
	MRR                  float64                 `json:"mrr"`
	ARR                  float64                 `json:"arr"`
	PendingTransactions  int                     `json:"pendingTransactions"`
	FailedTransactions   int                     `json:"failedTransactions"`
	MonthlyRevenueChart  []RevenueChartPoint     `json:"monthlyRevenueChart"`
	WeeklyRevenueChart   []RevenueChartPoint     `json:"weeklyRevenueChart"`
	SubscriptionMixChart []SubscriptionMixItem   `json:"subscriptionMixChart"`
	UserGrowthChart      []CustomerGrowthPoint   `json:"userGrowthChart"`
	RecentTransactions   []RecentTransactionView `json:"recentTransactions"`
	RecentActivity       []RecentActivityView    `json:"recentActivity"`
}
