package handlers

import (
	"net/http"

	"nexora/backend/internal/config"
	"nexora/backend/internal/models"
	"nexora/backend/internal/store"

	"github.com/gin-gonic/gin"
)

type DemoHandler struct {
	memStore    *store.MemoryStore
	mockDataDir string
	cfg         *config.Config
}

func NewDemoHandler(memStore *store.MemoryStore, mockDataDir string, cfg *config.Config) *DemoHandler {
	return &DemoHandler{
		memStore:    memStore,
		mockDataDir: mockDataDir,
		cfg:         cfg,
	}
}

func (h *DemoHandler) Reset(c *gin.Context) {
	if h.cfg.AppEnv != "development" {
		c.JSON(http.StatusForbidden, models.APIErrorResponse{
			Success: false,
			Error: models.APIErrorDetails{
				Code:    "FORBIDDEN",
				Message: "Demo reset endpoint is only available in development environment.",
			},
		})
		return
	}

	if err := h.memStore.LoadMockDataAndReset(h.mockDataDir); err != nil {
		RespondError(c, err)
		return
	}

	counts := h.memStore.GetStateCounts()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Demo in-memory application store successfully reset to seed state.",
		"data":    counts,
	})
}

func (h *DemoHandler) GetState(c *gin.Context) {
	if h.cfg.AppEnv != "development" {
		c.JSON(http.StatusForbidden, models.APIErrorResponse{
			Success: false,
			Error: models.APIErrorDetails{
				Code:    "FORBIDDEN",
				Message: "Demo state endpoint is only available in development environment.",
			},
		})
		return
	}

	counts := h.memStore.GetStateCounts()
	RespondSuccess(c, counts)
}
