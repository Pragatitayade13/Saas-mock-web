package store

import (
	"sync"
	"time"

	"golang.org/x/crypto/bcrypt"

	"nexora/backend/internal/models"
)

type Store interface {
	// Customers
	GetCustomer(id string) (models.Customer, error)
	ListCustomers(params models.QueryParams) (models.PaginatedList[models.Customer], error)
	CreateCustomer(customer models.Customer) (models.Customer, error)
	UpdateCustomer(id string, customer models.Customer) (models.Customer, error)
	DeleteCustomer(id string) error
	FindCustomerByEmail(email string) (models.Customer, error)

	// Subscriptions
	GetSubscription(id string) (models.Subscription, error)
	ListSubscriptions(params models.QueryParams) (models.PaginatedList[models.Subscription], error)
	CreateSubscription(subscription models.Subscription) (models.Subscription, error)
	UpdateSubscription(id string, subscription models.Subscription) (models.Subscription, error)
	DeleteSubscription(id string) error
	FindActiveByCustomer(customerID string) (models.Subscription, error)
	FindByCustomer(customerID string) ([]models.Subscription, error)
	FindByPlan(plan models.PlanTier) ([]models.Subscription, error)
	FindByStatus(status models.SubscriptionStatus) ([]models.Subscription, error)

	// Transactions
	GetTransaction(id string) (models.Transaction, error)
	ListTransactions(params models.QueryParams) (models.PaginatedList[models.Transaction], error)
	CreateTransaction(transaction models.Transaction) (models.Transaction, error)
	UpdateTransaction(id string, transaction models.Transaction) (models.Transaction, error)
	FindTransactionsByCustomer(customerID string) ([]models.Transaction, error)
	FindTransactionsBySubscription(subscriptionID string) ([]models.Transaction, error)
	FindTransactionsByStatus(status models.TransactionStatus) ([]models.Transaction, error)
	FindTransactionsByDateRange(startDate, endDate time.Time) ([]models.Transaction, error)

	// Notifications
	GetNotification(id string) (models.Notification, error)
	ListNotifications(params models.QueryParams) (models.PaginatedList[models.Notification], error)
	CreateNotification(notification models.Notification) (models.Notification, error)
	MarkNotificationRead(id string) (models.Notification, error)
	MarkNotificationUnread(id string) (models.Notification, error)
	MarkAllNotificationsRead(userID string) ([]models.Notification, error)

	// Reports
	GetReport(id string) (models.Report, error)
	ListReports(params models.QueryParams) (models.PaginatedList[models.Report], error)
	CreateReport(report models.Report) (models.Report, error)
	DeleteReport(id string) error

	// Activities
	GetActivity(id string) (models.Activity, error)
	ListActivities(params models.QueryParams) (models.PaginatedList[models.Activity], error)
	CreateActivity(activity models.Activity) (models.Activity, error)

	// Audit Logs (Append-Only)
	GetAuditLog(id string) (models.AuditLog, error)
	ListAuditLogs(params models.QueryParams) (models.PaginatedList[models.AuditLog], error)
	CreateAuditLog(audit models.AuditLog) (models.AuditLog, error)

	// Organization
	GetOrganization() (models.Organization, error)
	UpdateOrganization(org models.Organization) (models.Organization, error)

	// Invitations
	GetInvitation(id string) (models.Invitation, error)
	GetInvitationByToken(token string) (models.Invitation, error)
	ListInvitations(params models.QueryParams) (models.PaginatedList[models.Invitation], error)
	CreateInvitation(inv models.Invitation) (models.Invitation, error)
	UpdateInvitation(id string, inv models.Invitation) (models.Invitation, error)

	// Users
	GetUser(id string) (models.User, error)
	GetUserByEmail(email string) (models.User, error)
	ListUsers(params models.QueryParams) (models.PaginatedList[models.User], error)
	CreateUser(user models.User) (models.User, error)
	UpdateUser(id string, user models.User) (models.User, error)

	// Sessions
	CreateSession(session models.Session) (models.Session, error)
	GetSession(id string) (models.Session, error)
	DeleteSession(id string) error
	ValidateSession(id string) (models.Session, bool)
	CleanupExpiredSessions() int
	ListSessionsByUser(userID string) ([]models.Session, error)
	RevokeOtherSessions(userID string, currentSessionID string) error

	// Store Metadata & Maintenance
	GetStateCounts() map[string]int
	ResetStore(data SeedData) error
	IDGen() *IDGenerator
}

type SeedData struct {
	Organization  *models.Organization
	Users         []models.User
	Customers     []models.Customer
	Subscriptions []models.Subscription
	Transactions  []models.Transaction
	Notifications []models.Notification
}

type MemoryStore struct {
	mu            sync.RWMutex
	idGen         *IDGenerator
	organization  models.Organization
	customers     map[string]models.Customer
	subscriptions map[string]models.Subscription
	transactions  map[string]models.Transaction
	notifications map[string]models.Notification
	users         map[string]models.User
	sessions      map[string]models.Session
	reports       map[string]models.Report
	activities    map[string]models.Activity
	auditLogs     map[string]models.AuditLog
	invitations   map[string]models.Invitation
}

func NewMemoryStore() *MemoryStore {
	now := time.Now().UTC()
	return &MemoryStore{
		idGen: NewIDGenerator(),
		organization: models.Organization{
			ID:        "ORG-1001",
			Name:      "Nexora Technologies",
			Slug:      "nexora-technologies",
			Email:     "admin@nexora.demo",
			Website:   "https://nexora.demo",
			Industry:  "Software & Technology",
			Timezone:  "Asia/Kolkata",
			Currency:  "INR",
			Country:   "India",
			CreatedAt: now,
			UpdatedAt: now,
		},
		customers:     make(map[string]models.Customer),
		subscriptions: make(map[string]models.Subscription),
		transactions:  make(map[string]models.Transaction),
		notifications: make(map[string]models.Notification),
		users:         make(map[string]models.User),
		sessions:      make(map[string]models.Session),
		reports:       make(map[string]models.Report),
		activities:    make(map[string]models.Activity),
		auditLogs:     make(map[string]models.AuditLog),
		invitations:   make(map[string]models.Invitation),
	}
}

func (s *MemoryStore) IDGen() *IDGenerator {
	return s.idGen
}

func (s *MemoryStore) GetStateCounts() map[string]int {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return map[string]int{
		"customers":     len(s.customers),
		"subscriptions": len(s.subscriptions),
		"transactions":  len(s.transactions),
		"notifications": len(s.notifications),
		"users":         len(s.users),
		"sessions":      len(s.sessions),
		"reports":       len(s.reports),
		"activities":    len(s.activities),
		"auditLogs":     len(s.auditLogs),
	}
}

func (s *MemoryStore) ResetStore(data SeedData) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.customers = make(map[string]models.Customer)
	s.subscriptions = make(map[string]models.Subscription)
	s.transactions = make(map[string]models.Transaction)
	s.notifications = make(map[string]models.Notification)
	s.users = make(map[string]models.User)
	s.sessions = make(map[string]models.Session)

	for _, u := range data.Users {
		if u.PasswordHash == "" {
			var defaultPassword string
			switch u.Role {
			case models.RoleAdministrator:
				defaultPassword = "Admin@123"
			case models.RoleManager:
				defaultPassword = "Manager@123"
			case models.RoleViewer:
				defaultPassword = "Viewer@123"
			default:
				defaultPassword = "Admin@123"
			}
			hash, err := bcrypt.GenerateFromPassword([]byte(defaultPassword), bcrypt.DefaultCost)
			if err == nil {
				u.PasswordHash = string(hash)
			}
		}
		s.users[u.ID] = u
	}
	for _, c := range data.Customers {
		s.customers[c.ID] = c
	}
	for _, sub := range data.Subscriptions {
		s.subscriptions[sub.ID] = sub
	}
	for _, txn := range data.Transactions {
		s.transactions[txn.ID] = txn
	}
	for _, notif := range data.Notifications {
		s.notifications[notif.ID] = notif
	}

	return nil
}
