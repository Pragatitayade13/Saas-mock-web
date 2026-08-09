package models

type PlanConfig struct {
	Plan         PlanTier `json:"plan"`
	DisplayName  string   `json:"displayName"`
	MonthlyPrice float64  `json:"monthlyPrice"`
	YearlyPrice  float64  `json:"yearlyPrice"`
	Description  string   `json:"description"`
	Features     []string `json:"features"`
}

var DefaultPlanConfigs = []PlanConfig{
	{
		Plan:         PlanFree,
		DisplayName:  "Free",
		MonthlyPrice: 0.0,
		YearlyPrice:  0.0,
		Description:  "Basic entry plan for exploring the Nexora workspace platform.",
		Features: []string{
			"Single user seat",
			"1GB storage limit",
			"Standard community support",
		},
	},
	{
		Plan:         PlanStarter,
		DisplayName:  "Starter",
		MonthlyPrice: 29.0,
		YearlyPrice:  290.0,
		Description:  "Essential tools for small teams scaling their analytics workflow.",
		Features: []string{
			"Up to 5 team members",
			"10GB In-Memory cache",
			"Standard API access",
			"Email & chat support",
		},
	},
	{
		Plan:         PlanProfessional,
		DisplayName:  "Professional",
		MonthlyPrice: 99.0,
		YearlyPrice:  990.0,
		Description:  "Advanced features and high frequency capabilities for growing businesses.",
		Features: []string{
			"Up to 25 team members",
			"100GB In-Memory cache",
			"High-frequency API access",
			"24/7 priority support",
			"Custom CSV & PDF export pipelines",
		},
	},
	{
		Plan:         PlanEnterprise,
		DisplayName:  "Enterprise",
		MonthlyPrice: 299.0,
		YearlyPrice:  2990.0,
		Description:  "Maximum performance, dedicated SLAs, and custom integration infrastructure.",
		Features: []string{
			"Unlimited team members",
			"1TB dedicated memory cluster",
			"Custom SLA & dedicated account manager",
			"SOC2 compliance audit logging",
			"Tailored Go microservices integration",
		},
	},
}

func GetPlanConfigs() []PlanConfig {
	return DefaultPlanConfigs
}

func GetPlanPricing(plan PlanTier, cycle BillingCycle) float64 {
	for _, cfg := range DefaultPlanConfigs {
		if cfg.Plan == plan {
			if cycle == BillingCycleYearly {
				return cfg.YearlyPrice
			}
			return cfg.MonthlyPrice
		}
	}
	// Fallback to starter monthly price if unrecognized
	return 29.0
}
