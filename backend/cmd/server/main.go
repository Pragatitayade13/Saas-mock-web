package main

import (
	"context"
	"log"
	"path/filepath"
	"time"

	"nexora/backend/internal/config"
	"nexora/backend/internal/middleware"
	"nexora/backend/internal/routes"
	"nexora/backend/internal/services"
	"nexora/backend/internal/store"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Configure Gin Environment
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// Initialize In-Memory Application Store (ICM Core)
	memStore := store.NewMemoryStore()

	// Locate mock data directory
	mockDataDir := filepath.Join(".", "mockdata")
	if _, err := filepath.Abs(mockDataDir); err != nil {
		log.Fatalf("[NEXORA-BACKEND] Failed to resolve mockdata path: %v", err)
	}

	// Load initial seed mock datasets into memory
	log.Println("[NEXORA-BACKEND] Loading mock seed data into Go in-memory store...")
	if err := memStore.LoadMockDataAndReset(mockDataDir); err != nil {
		log.Fatalf("[NEXORA-BACKEND] Critical Startup Error - Failed to load mock seed data: %v", err)
	}

	counts := memStore.GetStateCounts()
	log.Printf("[NEXORA-BACKEND] In-Memory Application Store initialized successfully! Seed state: %+v", counts)

	// Initialize Auth Service
	authSvc := services.NewAuthService(memStore, cfg.SessionTTL)

	// Background ticker for periodic expired session cleanup (every 15 mins)
	cleanupTicker := time.NewTicker(15 * time.Minute)
	defer cleanupTicker.Stop()
	go func() {
		for range cleanupTicker.C {
			removed := authSvc.CleanupExpiredSessions(context.Background())
			if removed > 0 {
				log.Printf("[NEXORA-BACKEND] Expired session cleanup: purged %d expired session(s)", removed)
			}
		}
	}()

	// Initialize Gin router
	r := gin.New()

	// Register Middleware
	r.Use(middleware.CORSMiddleware(cfg.FrontendURL))
	r.Use(middleware.RequestLogger())
	r.Use(middleware.RecoveryMiddleware())

	// Register Routes
	routes.SetupRoutes(r, cfg, memStore, mockDataDir, authSvc)

	log.Printf("[NEXORA-BACKEND] Server starting in %s mode on port %s", cfg.AppEnv, cfg.Port)
	log.Printf("[NEXORA-BACKEND] Health endpoint: http://localhost%s/health", cfg.Port)
	log.Printf("[NEXORA-BACKEND] Dashboard API: http://localhost%s/api/dashboard", cfg.Port)

	if err := r.Run(cfg.Port); err != nil {
		log.Fatalf("[NEXORA-BACKEND] Failed to start server: %v", err)
	}
}
