package middleware

import (
	"log"
	"net/http"
	"nexora/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// RecoveryMiddleware handles panics gracefully and formats standard error JSON responses.
func RecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("[PANIC RECOVERY] Internal server error: %v", err)
				c.AbortWithStatusJSON(http.StatusInternalServerError, models.APIErrorResponse{
					Success: false,
					Error: models.APIErrorDetails{
						Code:    "INTERNAL_SERVER_ERROR",
						Message: "An unexpected error occurred on the server.",
					},
				})
			}
		}()
		c.Next()
	}
}
