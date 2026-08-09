package handlers

import (
	"net/http"
	"nexora/backend/internal/config"
	"nexora/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// ApiInfoHandler handles GET /api requests returning API metadata.
func ApiInfoHandler(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, models.ApiInfoResponse{
			Success:     true,
			Service:     "nexora-api",
			Version:     "1.0.0",
			Environment: cfg.AppEnv,
		})
	}
}

// NotFoundHandler provides clean standardized JSON response for unhandled routes.
func NotFoundHandler(c *gin.Context) {
	c.JSON(http.StatusNotFound, models.APIErrorResponse{
		Success: false,
		Error: models.APIErrorDetails{
			Code:    "RESOURCE_NOT_FOUND",
			Message: "The requested API endpoint was not found.",
		},
	})
}
