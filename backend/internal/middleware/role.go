package middleware

import (
	"net/http"

	"nexora/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// RequireRole checks if the authenticated user possesses one of the allowed roles.
func RequireRole(allowedRoles ...models.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		userVal, exists := c.Get("user")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.APIErrorResponse{
				Success: false,
				Error: models.APIErrorDetails{
					Code:    "UNAUTHORIZED",
					Message: "Authentication required.",
				},
			})
			return
		}

		user, ok := userVal.(models.User)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.APIErrorResponse{
				Success: false,
				Error: models.APIErrorDetails{
					Code:    "UNAUTHORIZED",
					Message: "Authentication required.",
				},
			})
			return
		}

		isAllowed := false
		for _, role := range allowedRoles {
			if user.Role == role {
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			c.AbortWithStatusJSON(http.StatusForbidden, models.APIErrorResponse{
				Success: false,
				Error: models.APIErrorDetails{
					Code:    "FORBIDDEN",
					Message: "You do not have permission to access this resource.",
				},
			})
			return
		}

		c.Next()
	}
}
