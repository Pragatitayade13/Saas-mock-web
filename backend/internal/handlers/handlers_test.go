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
	"nexora/backend/internal/routes"
	"nexora/backend/internal/services"
	"nexora/backend/internal/store"

	"github.com/gin-gonic/gin"
)

func setupTestServer() (*gin.Engine, *services.AuthService) {
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
	return r, authSvc
}

func getAdminCookie(t *testing.T, r *gin.Engine) *http.Cookie {
	loginPayload := map[string]string{
		"email":    "admin@nexora.demo",
		"password": "Admin@123",
	}
	body, _ := json.Marshal(loginPayload)
	req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("login failed in test setup: expected 200, got %d", w.Code)
	}

	for _, c := range w.Result().Cookies() {
		if c.Name == "nexora_session" {
			return c
		}
	}
	t.Fatalf("nexora_session cookie not set during login")
	return nil
}

func TestGetDashboardAPI(t *testing.T) {
	r, _ := setupTestServer()
	cookie := getAdminCookie(t, r)

	req, _ := http.NewRequest("GET", "/api/dashboard", nil)
	req.AddCookie(cookie)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected HTTP 200, got %d", w.Code)
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("invalid json response: %v", err)
	}

	if resp["success"] != true {
		t.Fatalf("expected success: true, got %v", resp["success"])
	}
	data, ok := resp["data"].(map[string]interface{})
	if !ok || data["revenue"] == nil {
		t.Fatalf("expected dashboard data object with revenue metrics")
	}
}

func TestListCustomersAPI(t *testing.T) {
	r, _ := setupTestServer()
	cookie := getAdminCookie(t, r)

	req, _ := http.NewRequest("GET", "/api/customers?page=1&limit=5", nil)
	req.AddCookie(cookie)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected HTTP 200, got %d", w.Code)
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("invalid json response: %v", err)
	}

	if resp["success"] != true {
		t.Fatalf("expected success: true")
	}
	items, ok := resp["data"].([]interface{})
	if !ok || len(items) != 5 {
		t.Fatalf("expected 5 customer items, got %d", len(items))
	}
}

func TestDemoStateAPI(t *testing.T) {
	r, _ := setupTestServer()
	cookie := getAdminCookie(t, r)

	req, _ := http.NewRequest("GET", "/api/demo/state", nil)
	req.AddCookie(cookie)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected HTTP 200 for demo state, got %d", w.Code)
	}
}
