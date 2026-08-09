package services

import (
	"fmt"
	"net/mail"
	"strings"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

type CustomerService struct {
	st store.Store
}

func NewCustomerService(st store.Store) *CustomerService {
	return &CustomerService{st: st}
}

func isValidPlan(plan models.PlanTier) bool {
	switch plan {
	case models.PlanFree, models.PlanStarter, models.PlanProfessional, models.PlanEnterprise:
		return true
	default:
		return false
	}
}

func isValidStatus(status models.CustomerStatus) bool {
	switch status {
	case models.CustomerStatusActive, models.CustomerStatusInactive, models.CustomerStatusTrial, models.CustomerStatusSuspended:
		return true
	default:
		return false
	}
}

func (s *CustomerService) GetCustomer(id string) (models.Customer, error) {
	if strings.TrimSpace(id) == "" {
		return models.Customer{}, store.ErrInvalidInput
	}
	return s.st.GetCustomer(id)
}

func (s *CustomerService) ListCustomers(params models.QueryParams) (models.PaginatedList[models.Customer], error) {
	return s.st.ListCustomers(params)
}

func (s *CustomerService) CreateCustomer(cust models.Customer) (models.Customer, error) {
	cust.Name = strings.TrimSpace(cust.Name)
	cust.Email = strings.TrimSpace(cust.Email)
	cust.Company = strings.TrimSpace(cust.Company)
	cust.Location = strings.TrimSpace(cust.Location)

	if cust.Name == "" {
		return models.Customer{}, fmt.Errorf("%w: customer name is required", store.ErrInvalidInput)
	}
	if cust.Email == "" {
		return models.Customer{}, fmt.Errorf("%w: customer email is required", store.ErrInvalidInput)
	}
	if _, err := mail.ParseAddress(cust.Email); err != nil {
		return models.Customer{}, fmt.Errorf("%w: invalid email address format", store.ErrInvalidInput)
	}
	if cust.Company == "" {
		return models.Customer{}, fmt.Errorf("%w: company name is required", store.ErrInvalidInput)
	}
	if cust.MonthlyRevenue < 0 {
		return models.Customer{}, fmt.Errorf("%w: monthly revenue cannot be negative", store.ErrInvalidInput)
	}

	if cust.Status == "" {
		cust.Status = models.CustomerStatusActive
	} else if !isValidStatus(cust.Status) {
		return models.Customer{}, fmt.Errorf("%w: invalid customer status", store.ErrInvalidInput)
	}

	if cust.Plan == "" {
		cust.Plan = models.PlanStarter
	} else if !isValidPlan(cust.Plan) {
		return models.Customer{}, fmt.Errorf("%w: invalid customer plan tier", store.ErrInvalidInput)
	}

	// Email Uniqueness Check
	if _, err := s.st.FindCustomerByEmail(cust.Email); err == nil {
		return models.Customer{}, store.ErrCustomerEmailExists
	}

	created, err := s.st.CreateCustomer(cust)
	if err != nil {
		return models.Customer{}, err
	}

	// Create In-Memory Notification
	_, _ = s.st.CreateNotification(models.Notification{
		Type:    models.NotificationTypeCustomer,
		Title:   "New customer created",
		Message: fmt.Sprintf("%s (%s) was added to your workspace.", created.Name, created.Company),
		Read:    false,
	})

	// Create Activity & Audit Log
	_, _ = s.st.CreateActivity(models.Activity{
		ActorName:   "Administrator",
		Action:      "Created",
		EntityType:  "Customer",
		EntityID:    created.ID,
		EntityName:  created.Name,
		Description: fmt.Sprintf("%s (%s) was added to workspace.", created.Name, created.Company),
		Severity:    models.SeveritySuccess,
	})

	_, _ = s.st.CreateAuditLog(models.AuditLog{
		ActorName:  "Administrator",
		Action:     "Customer Created",
		EntityType: "Customer",
		EntityID:   created.ID,
		EntityName: created.Name,
		Result:     models.AuditResultSuccess,
	})

	return created, nil
}

func (s *CustomerService) UpdateCustomer(id string, cust models.Customer) (models.Customer, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return models.Customer{}, store.ErrInvalidInput
	}

	existing, err := s.st.GetCustomer(id)
	if err != nil {
		return models.Customer{}, err
	}

	cust.Name = strings.TrimSpace(cust.Name)
	cust.Email = strings.TrimSpace(cust.Email)
	cust.Company = strings.TrimSpace(cust.Company)
	cust.Location = strings.TrimSpace(cust.Location)

	if cust.Name == "" {
		cust.Name = existing.Name
	}
	if cust.Company == "" {
		cust.Company = existing.Company
	}
	if cust.Location == "" {
		cust.Location = existing.Location
	}
	if cust.Avatar == "" {
		cust.Avatar = existing.Avatar
	}

	if cust.Email != "" && cust.Email != existing.Email {
		if _, err := mail.ParseAddress(cust.Email); err != nil {
			return models.Customer{}, fmt.Errorf("%w: invalid email address format", store.ErrInvalidInput)
		}
		found, err := s.st.FindCustomerByEmail(cust.Email)
		if err == nil && found.ID != id {
			return models.Customer{}, store.ErrCustomerEmailExists
		}
	} else {
		cust.Email = existing.Email
	}

	if cust.Plan != "" {
		if !isValidPlan(cust.Plan) {
			return models.Customer{}, fmt.Errorf("%w: invalid customer plan tier", store.ErrInvalidInput)
		}
	} else {
		cust.Plan = existing.Plan
	}

	statusChanged := false
	oldStatus := existing.Status
	if cust.Status != "" {
		if !isValidStatus(cust.Status) {
			return models.Customer{}, fmt.Errorf("%w: invalid customer status", store.ErrInvalidInput)
		}
		if cust.Status != existing.Status {
			statusChanged = true
		}
	} else {
		cust.Status = existing.Status
	}

	if cust.MonthlyRevenue < 0 {
		return models.Customer{}, fmt.Errorf("%w: monthly revenue cannot be negative", store.ErrInvalidInput)
	}

	updated, err := s.st.UpdateCustomer(id, cust)
	if err != nil {
		return models.Customer{}, err
	}

	// Create Notification
	if statusChanged {
		_, _ = s.st.CreateNotification(models.Notification{
			Type:    models.NotificationTypeCustomer,
			Title:   "Customer status changed",
			Message: fmt.Sprintf("%s status was updated from %s to %s.", updated.Name, oldStatus, updated.Status),
			Read:    false,
		})
	} else {
		_, _ = s.st.CreateNotification(models.Notification{
			Type:    models.NotificationTypeCustomer,
			Title:   "Customer updated",
			Message: fmt.Sprintf("Customer profile for %s was updated.", updated.Name),
			Read:    false,
		})
	}

	return updated, nil
}

func (s *CustomerService) DeleteCustomer(id string) error {
	id = strings.TrimSpace(id)
	if id == "" {
		return store.ErrInvalidInput
	}
	return s.st.DeleteCustomer(id)
}

func (s *CustomerService) GetCustomerTransactions(customerID string) (models.PaginatedList[models.Transaction], error) {
	customerID = strings.TrimSpace(customerID)
	if customerID == "" {
		return models.PaginatedList[models.Transaction]{}, store.ErrInvalidInput
	}
	if _, err := s.st.GetCustomer(customerID); err != nil {
		return models.PaginatedList[models.Transaction]{}, err
	}
	return s.st.ListTransactions(models.QueryParams{
		CustomerID: customerID,
		Page:       1,
		Limit:      100,
		SortBy:     "createdAt",
		SortOrder:  "desc",
	})
}
