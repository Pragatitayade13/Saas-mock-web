package handlers

import (
	"net/http"
	"nexora/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// HealthCheckHandler handles GET /health requests.
func HealthCheckHandler(c *gin.Context) {
	c.JSON(http.StatusOK, models.HealthResponse{
		Success: true,
		Status:  "ok",
		Service: "nexora-api",
	})
}
