package store

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"nexora/backend/internal/models"
)

func generateSecureSessionToken() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("SES-%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(b)
}

func (s *MemoryStore) CreateSession(session models.Session) (models.Session, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if session.ID == "" {
		session.ID = generateSecureSessionToken()
	}

	now := time.Now().UTC()
	if session.CreatedAt.IsZero() {
		session.CreatedAt = now
	}
	if session.ExpiresAt.IsZero() {
		session.ExpiresAt = now.Add(24 * time.Hour)
	}

	s.sessions[session.ID] = session
	return session, nil
}

func (s *MemoryStore) GetSession(id string) (models.Session, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	session, ok := s.sessions[id]
	if !ok {
		return models.Session{}, ErrNotFound
	}
	return session, nil
}

func (s *MemoryStore) DeleteSession(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.sessions[id]; !ok {
		return ErrNotFound
	}

	delete(s.sessions, id)
	return nil
}

func (s *MemoryStore) ValidateSession(id string) (models.Session, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	session, ok := s.sessions[id]
	if !ok {
		return models.Session{}, false
	}

	if time.Now().UTC().After(session.ExpiresAt) {
		delete(s.sessions, id)
		return models.Session{}, false
	}

	return session, true
}

func (s *MemoryStore) CleanupExpiredSessions() int {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now().UTC()
	count := 0
	for id, sess := range s.sessions {
		if now.After(sess.ExpiresAt) {
			delete(s.sessions, id)
			count++
		}
	}
	return count
}

func (s *MemoryStore) ListSessionsByUser(userID string) ([]models.Session, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Session
	now := time.Now().UTC()
	for _, sess := range s.sessions {
		if sess.UserID == userID && now.Before(sess.ExpiresAt) {
			result = append(result, sess)
		}
	}
	return result, nil
}

func (s *MemoryStore) RevokeOtherSessions(userID string, currentSessionID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for id, sess := range s.sessions {
		if sess.UserID == userID && id != currentSessionID {
			delete(s.sessions, id)
		}
	}
	return nil
}
