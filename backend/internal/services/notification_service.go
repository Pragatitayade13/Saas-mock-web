package services

import (
	"strings"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

type NotificationService struct {
	st store.Store
}

func NewNotificationService(st store.Store) *NotificationService {
	return &NotificationService{st: st}
}

func (s *NotificationService) GetNotification(id string) (models.Notification, error) {
	if strings.TrimSpace(id) == "" {
		return models.Notification{}, store.ErrInvalidInput
	}
	return s.st.GetNotification(id)
}

func (s *NotificationService) ListNotifications(params models.QueryParams) (models.PaginatedList[models.Notification], error) {
	return s.st.ListNotifications(params)
}

func (s *NotificationService) MarkNotificationRead(id string) (models.Notification, error) {
	if strings.TrimSpace(id) == "" {
		return models.Notification{}, store.ErrInvalidInput
	}
	return s.st.MarkNotificationRead(id)
}

func (s *NotificationService) MarkNotificationUnread(id string) (models.Notification, error) {
	if strings.TrimSpace(id) == "" {
		return models.Notification{}, store.ErrInvalidInput
	}
	return s.st.MarkNotificationUnread(id)
}

func (s *NotificationService) MarkAllNotificationsRead(userID string) ([]models.Notification, error) {
	return s.st.MarkAllNotificationsRead(userID)
}
