package middleware

import (
	"net/http"
	"strings"

	"nexora/backend/internal/models"
	"nexora/backend/internal/services"

	"github.com/gin-gonic/gin"
)

const SessionCookieName = "nexora_session"

// AuthMiddleware validates active session cookies or Bearer tokens.
func AuthMiddleware(authSvc *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var sessionID string

		// 1. Try reading HTTP-Only session cookie
		cookieVal, err := c.Cookie(SessionCookieName)
		if err == nil && cookieVal != "" {
			sessionID = cookieVal
		}

		// 2. Fallback to Authorization: Bearer <token> header
		if sessionID == "" {
			authHeader := c.GetHeader("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				sessionID = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if sessionID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.APIErrorResponse{
				Success: false,
				Error: models.APIErrorDetails{
					Code:    "UNAUTHORIZED",
					Message: "Authentication required.",
				},
			})
			return
		}

		session, user, err := authSvc.ValidateSession(c.Request.Context(), sessionID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.APIErrorResponse{
				Success: false,
				Error: models.APIErrorDetails{
					Code:    "UNAUTHORIZED",
					Message: "Authentication required.",
				},
			})
			return
		}

		c.Set("user", user)
		c.Set("session", session)
		c.Next()
	}
}
