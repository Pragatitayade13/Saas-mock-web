package store

import "errors"

var (
	ErrNotFound             = errors.New("record not found")
	ErrAlreadyExists        = errors.New("record already exists")
	ErrInvalidInput         = errors.New("invalid input data")
	ErrCustomerNotFound     = errors.New("customer not found")
	ErrSubscriptionNotFound = errors.New("subscription not found")
	ErrTransactionNotFound  = errors.New("transaction not found")
	ErrUserNotFound         = errors.New("user not found")
	ErrNotificationNotFound = errors.New("notification not found")
	ErrInvalidStatus        = errors.New("invalid status value")
	ErrInvalidPagination    = errors.New("invalid pagination parameters")
	ErrConflict             = errors.New("resource has dependent records and cannot be deleted")
	ErrCustomerEmailExists  = errors.New("a customer with this email already exists")
	ErrCustomerHasDependencies = errors.New("this customer cannot be deleted because related subscriptions or transactions exist")
	ErrActiveSubscriptionExists = errors.New("this customer already has an active subscription")
	ErrInvalidStatusTransition = errors.New("invalid subscription status transition")
	ErrTransactionNotRefundable = errors.New("only completed transactions can be refunded")
	ErrAlreadyRefunded         = errors.New("this transaction has already been refunded")
	ErrForbidden                = errors.New("action forbidden")
	ErrUnauthorized             = errors.New("unauthorized action")
)
