package services

import (
	"context"
	"errors"
	"regexp"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"

	"nexora/backend/internal/models"
	"nexora/backend/internal/store"
)

var (
	ErrInvalidCredentials = errors.New("Invalid email or password.")
	ErrUserInactive       = errors.New("User account is inactive.")
	ErrUnauthorized       = errors.New("Authentication required.")
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

type AuthService struct {
	st         store.Store
	sessionTTL time.Duration
}

func NewAuthService(st store.Store, sessionTTL time.Duration) *AuthService {
	if sessionTTL <= 0 {
		sessionTTL = 24 * time.Hour
	}
	return &AuthService{
		st:         st,
		sessionTTL: sessionTTL,
	}
}

func (s *AuthService) Login(ctx context.Context, email, password string) (models.User, models.Session, error) {
	emailClean := strings.TrimSpace(email)
	if emailClean == "" || !emailRegex.MatchString(emailClean) {
		return models.User{}, models.Session{}, ErrInvalidCredentials
	}

	if password == "" {
		return models.User{}, models.Session{}, ErrInvalidCredentials
	}

	user, err := s.st.GetUserByEmail(emailClean)
	if err != nil {
		return models.User{}, models.Session{}, ErrInvalidCredentials
	}

	if user.Status != models.UserStatusActive {
		return models.User{}, models.Session{}, ErrUserInactive
	}

	if user.PasswordHash == "" {
		return models.User{}, models.Session{}, ErrInvalidCredentials
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return models.User{}, models.Session{}, ErrInvalidCredentials
	}

	now := time.Now().UTC()
	sess := models.Session{
		UserID:    user.ID,
		CreatedAt: now,
		ExpiresAt: now.Add(s.sessionTTL),
	}

	createdSess, err := s.st.CreateSession(sess)
	if err != nil {
		return models.User{}, models.Session{}, err
	}

	return user.Sanitize(), createdSess, nil
}

func (s *AuthService) ValidateSession(ctx context.Context, sessionID string) (models.Session, models.User, error) {
	if strings.TrimSpace(sessionID) == "" {
		return models.Session{}, models.User{}, ErrUnauthorized
	}

	sess, valid := s.st.ValidateSession(sessionID)
	if !valid {
		return models.Session{}, models.User{}, ErrUnauthorized
	}

	user, err := s.st.GetUser(sess.UserID)
	if err != nil {
		return models.Session{}, models.User{}, ErrUnauthorized
	}

	if user.Status != models.UserStatusActive {
		return models.Session{}, models.User{}, ErrUserInactive
	}

	return sess, user.Sanitize(), nil
}

func (s *AuthService) GetCurrentUser(ctx context.Context, userID string) (models.User, error) {
	if strings.TrimSpace(userID) == "" {
		return models.User{}, ErrUnauthorized
	}

	user, err := s.st.GetUser(userID)
	if err != nil {
		return models.User{}, ErrUnauthorized
	}

	return user.Sanitize(), nil
}

func (s *AuthService) Logout(ctx context.Context, sessionID string) error {
	if strings.TrimSpace(sessionID) == "" {
		return nil
	}
	err := s.st.DeleteSession(sessionID)
	if errors.Is(err, store.ErrNotFound) {
		return nil
	}
	return err
}

func (s *AuthService) CleanupExpiredSessions(ctx context.Context) int {
	return s.st.CleanupExpiredSessions()
}
