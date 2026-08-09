package models

import "time"

type NotificationType string

const (
	NotificationTypePayment      NotificationType = "Payment"
	NotificationTypeCustomer     NotificationType = "Customer"
	NotificationTypeSubscription NotificationType = "Subscription"
	NotificationTypeSystem       NotificationType = "System"
	NotificationTypeReport       NotificationType = "Report"
)

type Notification struct {
	ID        string           `json:"id"`
	UserID    string           `json:"userId"`
	Type      NotificationType `json:"type"`
	Title     string           `json:"title"`
	Message   string           `json:"message"`
	Read      bool             `json:"read"`
	CreatedAt time.Time        `json:"createdAt"`
}
