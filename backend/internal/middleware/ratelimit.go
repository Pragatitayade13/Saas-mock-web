package middleware

import (
	"net/http"
	"sync"
	"time"

	"nexora/backend/internal/models"

	"github.com/gin-gonic/gin"
)

type ipLimiter struct {
	mu       sync.Mutex
	attempts map[string][]time.Time
	limit    int
	window   time.Duration
}

func NewLoginRateLimiter(limit int, window time.Duration) gin.HandlerFunc {
	l := &ipLimiter{
		attempts: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}

	return func(c *gin.Context) {
		ip := c.ClientIP()
		now := time.Now()

		l.mu.Lock()
		// Clean up old entries
		var valid []time.Time
		for _, t := range l.attempts[ip] {
			if now.Sub(t) <= l.window {
				valid = append(valid, t)
			}
		}

		if len(valid) >= l.limit {
			l.attempts[ip] = valid
			l.mu.Unlock()

			c.AbortWithStatusJSON(http.StatusTooManyRequests, models.APIErrorResponse{
				Success: false,
				Error: models.APIErrorDetails{
					Code:    "RATE_LIMIT_EXCEEDED",
					Message: "Too many login attempts. Please try again later.",
				},
			})
			return
		}

		l.attempts[ip] = append(valid, now)
		l.mu.Unlock()

		c.Next()
	}
}
