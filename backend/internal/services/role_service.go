package services

import (
	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

type RoleDefinition struct {
	ID          string          `json:"id"`
	Name        models.UserRole `json:"name"`
	Description string          `json:"description"`
	MemberCount int             `json:"memberCount"`
	Permissions []string        `json:"permissions"`
}

type PermissionGroup struct {
	Category    string            `json:"category"`
	Permissions []PermissionEntry `json:"permissions"`
}

type PermissionEntry struct {
	Key     string `json:"key"`
	Label   string `json:"label"`
	Admin   bool   `json:"admin"`
	Manager bool   `json:"manager"`
	Viewer  bool   `json:"viewer"`
}

type RoleService struct {
	st store.Store
}

func NewRoleService(st store.Store) *RoleService {
	return &RoleService{st: st}
}

func (s *RoleService) ListRoles() ([]RoleDefinition, error) {
	users, err := s.st.ListUsers(models.QueryParams{Limit: 10000})
	if err != nil {
		return nil, err
	}

	adminCount, mgrCount, viewerCount := 0, 0, 0
	for _, u := range users.Items {
		switch u.Role {
		case models.RoleAdministrator:
			adminCount++
		case models.RoleManager:
			mgrCount++
		case models.RoleViewer:
			viewerCount++
		}
	}

	return []RoleDefinition{
		{
			ID:          "ROLE-ADMIN",
			Name:        models.RoleAdministrator,
			Description: "Full unrestricted workspace administration and security control.",
			MemberCount: adminCount,
			Permissions: []string{"*"},
		},
		{
			ID:          "ROLE-MANAGER",
			Name:        models.RoleManager,
			Description: "Full access to business operations, customer CRUD, subscriptions, transactions, reports, and activity.",
			MemberCount: mgrCount,
			Permissions: []string{"customers.*", "subscriptions.*", "transactions.*", "reports.create", "reports.view", "reports.download", "activity.view", "audit.view"},
		},
		{
			ID:          "ROLE-VIEWER",
			Name:        models.RoleViewer,
			Description: "Read-only access to workspace dashboards, analytics, reports history, and activity timeline.",
			MemberCount: viewerCount,
			Permissions: []string{"dashboard.view", "customers.view", "subscriptions.view", "transactions.view", "analytics.view", "reports.view", "activity.view"},
		},
	}, nil
}

func (s *RoleService) GetPermissionMatrix() ([]PermissionGroup, error) {
	return []PermissionGroup{
		{
			Category: "Dashboard & Analytics",
			Permissions: []PermissionEntry{
				{Key: "dashboard.view", Label: "View Dashboard Overview", Admin: true, Manager: true, Viewer: true},
				{Key: "analytics.view", Label: "View Business Analytics", Admin: true, Manager: true, Viewer: true},
			},
		},
		{
			Category: "Customers & Subscriptions",
			Permissions: []PermissionEntry{
				{Key: "customers.view", Label: "View Customer Records", Admin: true, Manager: true, Viewer: true},
				{Key: "customers.create", Label: "Create Customers", Admin: true, Manager: true, Viewer: false},
				{Key: "customers.update", Label: "Update Customers", Admin: true, Manager: true, Viewer: false},
				{Key: "customers.delete", Label: "Delete Customers", Admin: true, Manager: false, Viewer: false},
				{Key: "subscriptions.manage", Label: "Manage Subscriptions & Plans", Admin: true, Manager: true, Viewer: false},
			},
		},
		{
			Category: "Financial Transactions",
			Permissions: []PermissionEntry{
				{Key: "transactions.view", Label: "View Financial Transactions", Admin: true, Manager: true, Viewer: true},
				{Key: "transactions.refund", Label: "Process Transaction Refunds", Admin: true, Manager: true, Viewer: false},
			},
		},
		{
			Category: "Reports & Audits",
			Permissions: []PermissionEntry{
				{Key: "reports.create", Label: "Generate Reports", Admin: true, Manager: true, Viewer: false},
				{Key: "reports.download", Label: "Download CSV Reports", Admin: true, Manager: true, Viewer: true},
				{Key: "reports.delete", Label: "Delete Reports", Admin: true, Manager: false, Viewer: false},
				{Key: "audit.view", Label: "View Security Audit Log", Admin: true, Manager: true, Viewer: false},
			},
		},
		{
			Category: "Team & Organization",
			Permissions: []PermissionEntry{
				{Key: "organization.update", Label: "Update Organization Profile", Admin: true, Manager: false, Viewer: false},
				{Key: "team.invite", Label: "Invite Team Members", Admin: true, Manager: false, Viewer: false},
				{Key: "team.roles", Label: "Assign Roles & Suspend Members", Admin: true, Manager: false, Viewer: false},
			},
		},
	}, nil
}
