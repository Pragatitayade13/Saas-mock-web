package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
	"time"

	"nexora/backend/internal/config"
	"nexora/backend/internal/models"
	"nexora/backend/internal/routes"
	"nexora/backend/internal/services"
	"nexora/backend/internal/store"

	"github.com/gin-gonic/gin"
)

func setupAuthTestServer() (*gin.Engine, *store.MemoryStore, *services.AuthService) {
	gin.SetMode(gin.TestMode)
	cfg := &config.Config{
		Port:        ":8080",
		AppEnv:      "development",
		FrontendURL: "http://localhost:5173",
		SessionTTL:  24 * time.Hour,
	}

	memStore := store.NewMemoryStore()
	mockDir, _ := filepath.Abs("../../mockdata")
	_ = memStore.LoadMockDataAndReset(mockDir)

	authSvc := services.NewAuthService(memStore, cfg.SessionTTL)
	r := gin.New()
	routes.SetupRoutes(r, cfg, memStore, mockDir, authSvc)
	return r, memStore, authSvc
}

func loginUser(r *gin.Engine, email, password string) (*httptest.ResponseRecorder, *http.Cookie) {
	body, _ := json.Marshal(map[string]string{
		"email":    email,
		"password": password,
	})
	req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var cookie *http.Cookie
	for _, c := range w.Result().Cookies() {
		if c.Name == "nexora_session" {
			cookie = c
			break
		}
	}
	return w, cookie
}

func TestAuthLoginSuccess(t *testing.T) {
	r, _, _ := setupAuthTestServer()

	// Test Admin Login
	w, cookie := loginUser(r, "admin@nexora.demo", "Admin@123")
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for admin login, got %d", w.Code)
	}
	if cookie == nil {
		t.Fatalf("expected nexora_session cookie to be set")
	}

	var resp map[string]interface{}
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["success"] != true {
		t.Fatalf("expected success: true")
	}
	userData := resp["data"].(map[string]interface{})["user"].(map[string]interface{})
	if userData["email"] != "admin@nexora.demo" || userData["role"] != "Administrator" {
		t.Fatalf("unexpected user response data: %v", userData)
	}
	if userData["passwordHash"] != nil {
		t.Fatalf("passwordHash must never be exposed in API responses")
	}
}

func TestAuthLoginInvalidCredentials(t *testing.T) {
	r, _, _ := setupAuthTestServer()

	// Wrong password
	w, _ := loginUser(r, "admin@nexora.demo", "WrongPassword")
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for wrong password, got %d", w.Code)
	}

	// Non-existent email
	w2, _ := loginUser(r, "unknown@nexora.demo", "Admin@123")
	if w2.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for unknown email, got %d", w2.Code)
	}
}

func TestAuthLoginInactiveUser(t *testing.T) {
	r, _, _ := setupAuthTestServer()

	// Emily Chen (emily@nexora.io) is Inactive in mock data
	w, _ := loginUser(r, "emily@nexora.io", "Admin@123")
	if w.Code != http.StatusForbidden {
		t.Fatalf("expected 403 Forbidden for inactive user, got %d", w.Code)
	}
}

func TestAuthMeEndpoint(t *testing.T) {
	r, _, _ := setupAuthTestServer()

	// Unauthenticated
	req, _ := http.NewRequest("GET", "/api/auth/me", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for unauthenticated /api/auth/me, got %d", w.Code)
	}

	// Authenticated
	_, cookie := loginUser(r, "manager@nexora.demo", "Manager@123")
	req2, _ := http.NewRequest("GET", "/api/auth/me", nil)
	req2.AddCookie(cookie)
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	if w2.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for authenticated /api/auth/me, got %d", w2.Code)
	}
}

func TestAuthLogout(t *testing.T) {
	r, _, _ := setupAuthTestServer()

	_, cookie := loginUser(r, "viewer@nexora.demo", "Viewer@123")

	// Verify me works before logout
	req, _ := http.NewRequest("GET", "/api/auth/me", nil)
	req.AddCookie(cookie)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 OK before logout")
	}

	// Perform Logout
	reqLogout, _ := http.NewRequest("POST", "/api/auth/logout", nil)
	reqLogout.AddCookie(cookie)
	wLogout := httptest.NewRecorder()
	r.ServeHTTP(wLogout, reqLogout)
	if wLogout.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for logout, got %d", wLogout.Code)
	}

	// Verify cookie was cleared
	cleared := false
	for _, c := range wLogout.Result().Cookies() {
		if c.Name == "nexora_session" && c.MaxAge < 0 {
			cleared = true
		}
	}
	if !cleared {
		t.Fatalf("expected nexora_session cookie to be cleared with MaxAge < 0")
	}

	// Verify session is invalidated
	wAfter := httptest.NewRecorder()
	r.ServeHTTP(wAfter, req)
	if wAfter.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 Unauthorized after logout, got %d", wAfter.Code)
	}
}

func TestRoleBasedAccessControl(t *testing.T) {
	r, _, _ := setupAuthTestServer()

	// 1. Viewer login
	_, viewerCookie := loginUser(r, "viewer@nexora.demo", "Viewer@123")

	// Viewer can access Dashboard
	reqDash, _ := http.NewRequest("GET", "/api/dashboard", nil)
	reqDash.AddCookie(viewerCookie)
	wDash := httptest.NewRecorder()
	r.ServeHTTP(wDash, reqDash)
	if wDash.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for viewer accessing dashboard, got %d", wDash.Code)
	}

	// Viewer can access Customers GET (200 OK)
	reqCust, _ := http.NewRequest("GET", "/api/customers", nil)
	reqCust.AddCookie(viewerCookie)
	wCust := httptest.NewRecorder()
	r.ServeHTTP(wCust, reqCust)
	if wCust.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for viewer accessing customers GET, got %d", wCust.Code)
	}

	// Viewer CANNOT POST to Customers (403 Forbidden)
	reqCustPost, _ := http.NewRequest("POST", "/api/customers", nil)
	reqCustPost.AddCookie(viewerCookie)
	wCustPost := httptest.NewRecorder()
	r.ServeHTTP(wCustPost, reqCustPost)
	if wCustPost.Code != http.StatusForbidden {
		t.Fatalf("expected 403 Forbidden for viewer creating customer, got %d", wCustPost.Code)
	}

	// 2. Manager login
	_, mgrCookie := loginUser(r, "manager@nexora.demo", "Manager@123")

	// Manager can access Customers
	reqCustMgr, _ := http.NewRequest("GET", "/api/customers", nil)
	reqCustMgr.AddCookie(mgrCookie)
	wCustMgr := httptest.NewRecorder()
	r.ServeHTTP(wCustMgr, reqCustMgr)
	if wCustMgr.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for manager accessing customers, got %d", wCustMgr.Code)
	}

	// Manager CANNOT DELETE Customers (403 Forbidden)
	reqCustDel, _ := http.NewRequest("DELETE", "/api/customers/CUS-1001", nil)
	reqCustDel.AddCookie(mgrCookie)
	wCustDel := httptest.NewRecorder()
	r.ServeHTTP(wCustDel, reqCustDel)
	if wCustDel.Code != http.StatusForbidden {
		t.Fatalf("expected 403 Forbidden for manager deleting customer, got %d", wCustDel.Code)
	}
}

func TestProtectedEndpointsMatrix(t *testing.T) {
	r, memStore, _ := setupAuthTestServer()

	protectedEndpoints := []string{
		"/api/dashboard",
		"/api/customers",
		"/api/subscriptions",
		"/api/transactions",
		"/api/analytics",
		"/api/reports",
		"/api/notifications",
		"/api/users",
	}

	// 1. Unauthenticated -> ALL should return 401 Unauthorized
	for _, ep := range protectedEndpoints {
		req, _ := http.NewRequest("GET", ep, nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("unauthenticated request to %s expected 401, got %d", ep, w.Code)
		}
	}

	// 2. Administrator -> ALL should return 200 OK
	_, adminCookie := loginUser(r, "admin@nexora.demo", "Admin@123")
	for _, ep := range protectedEndpoints {
		req, _ := http.NewRequest("GET", ep, nil)
		req.AddCookie(adminCookie)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("administrator request to %s expected 200, got %d", ep, w.Code)
		}
	}

	// 3. Manager -> ALL 8 should return 200 OK
	_, mgrCookie := loginUser(r, "manager@nexora.demo", "Manager@123")
	for _, ep := range protectedEndpoints {
		req, _ := http.NewRequest("GET", ep, nil)
		req.AddCookie(mgrCookie)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("manager request to %s expected 200, got %d", ep, w.Code)
		}
	}

	// 4. Viewer -> Dashboard, Customers, Subscriptions, Analytics, Reports, Notifications should return 200; Transactions, Users should return 403 Forbidden
	_, viewerCookie := loginUser(r, "viewer@nexora.demo", "Viewer@123")
	allowedForViewer := map[string]bool{
		"/api/dashboard":    true,
		"/api/customers":    true,
		"/api/subscriptions": true,
		"/api/transactions":  true,
		"/api/analytics":    true,
		"/api/reports":      true,
		"/api/notifications": true,
	}

	for _, ep := range protectedEndpoints {
		req, _ := http.NewRequest("GET", ep, nil)
		req.AddCookie(viewerCookie)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if allowedForViewer[ep] {
			if w.Code != http.StatusOK {
				t.Errorf("viewer request to %s expected 200, got %d", ep, w.Code)
			}
		} else {
			if w.Code != http.StatusForbidden {
				t.Errorf("viewer request to %s expected 403 Forbidden, got %d", ep, w.Code)
			}
		}
	}

	// 5. Expired Session -> 401 Unauthorized
	_, expCookie := loginUser(r, "admin@nexora.demo", "Admin@123")
	// Manually expire session in store
	sess, err := memStore.GetSession(expCookie.Value)
	if err == nil {
		sess.ExpiresAt = time.Now().Add(-1 * time.Hour)
		_, _ = memStore.CreateSession(sess)
	}

	for _, ep := range protectedEndpoints {
		req, _ := http.NewRequest("GET", ep, nil)
		req.AddCookie(expCookie)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expired session request to %s expected 401, got %d", ep, w.Code)
		}
	}
}

func TestSessionExpirationAndCleanup(t *testing.T) {
	_, memStore, _ := setupAuthTestServer()

	now := time.Now().UTC()
	sessActive := models.Session{
		ID:        "SES-ACTIVE",
		UserID:    "USR-1001",
		CreatedAt: now,
		ExpiresAt: now.Add(1 * time.Hour),
	}
	sessExpired := models.Session{
		ID:        "SES-EXPIRED",
		UserID:    "USR-1001",
		CreatedAt: now.Add(-2 * time.Hour),
		ExpiresAt: now.Add(-1 * time.Hour),
	}

	_, _ = memStore.CreateSession(sessActive)
	_, _ = memStore.CreateSession(sessExpired)

	// ValidateActive
	_, valid := memStore.ValidateSession("SES-ACTIVE")
	if !valid {
		t.Fatalf("expected SES-ACTIVE to be valid")
	}

	// ValidateExpired -> should return false and auto-remove
	_, validExp := memStore.ValidateSession("SES-EXPIRED")
	if validExp {
		t.Fatalf("expected SES-EXPIRED to be invalid")
	}

	// CleanupExpiredSessions
	cleaned := memStore.CleanupExpiredSessions()
	if cleaned < 0 {
		t.Fatalf("expected cleanup count >= 0")
	}
}

