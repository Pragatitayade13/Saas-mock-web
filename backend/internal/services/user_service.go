package services

import (
	"strings"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

type UserService struct {
	st store.Store
}

func NewUserService(st store.Store) *UserService {
	return &UserService{st: st}
}

func (s *UserService) GetUser(id string) (models.User, error) {
	if strings.TrimSpace(id) == "" {
		return models.User{}, store.ErrInvalidInput
	}
	return s.st.GetUser(id)
}

func (s *UserService) ListUsers(params models.QueryParams) (models.PaginatedList[models.User], error) {
	return s.st.ListUsers(params)
}

func (s *UserService) UpdateUser(id string, user models.User) (models.User, error) {
	if strings.TrimSpace(id) == "" {
		return models.User{}, store.ErrInvalidInput
	}
	return s.st.UpdateUser(id, user)
}
