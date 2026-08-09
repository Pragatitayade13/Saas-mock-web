package handlers

import (
	"errors"
	"net/http"

	"nexora/backend/internal/config"
	"nexora/backend/internal/models"
	"nexora/backend/internal/services"

	"github.com/gin-gonic/gin"
)

const SessionCookieName = "nexora_session"

type AuthHandler struct {
	authSvc *services.AuthService
	cfg     *config.Config
}

func NewAuthHandler(authSvc *services.AuthService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		authSvc: authSvc,
		cfg:     cfg,
	}
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIErrorResponse{
			Success: false,
			Error: models.APIErrorDetails{
				Code:    "INVALID_INPUT",
				Message: "Invalid request payload. Email and password are required.",
			},
		})
		return
	}

	user, session, err := h.authSvc.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, services.ErrUserInactive) {
			c.JSON(http.StatusForbidden, models.APIErrorResponse{
				Success: false,
				Error: models.APIErrorDetails{
					Code:    "USER_INACTIVE",
					Message: "User account is inactive.",
				},
			})
			return
		}

		c.JSON(http.StatusUnauthorized, models.APIErrorResponse{
			Success: false,
			Error: models.APIErrorDetails{
				Code:    "INVALID_CREDENTIALS",
				Message: "Invalid email or password.",
			},
		})
		return
	}

	isSecure := h.cfg.AppEnv == "production"
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		SessionCookieName,
		session.ID,
		int(h.cfg.SessionTTL.Seconds()),
		"/",
		"",
		isSecure,
		true, // HttpOnly
	)

	RespondSuccess(c, gin.H{
		"user": user,
	})
}

func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIErrorResponse{
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
		c.JSON(http.StatusUnauthorized, models.APIErrorResponse{
			Success: false,
			Error: models.APIErrorDetails{
				Code:    "UNAUTHORIZED",
				Message: "Authentication required.",
			},
		})
		return
	}

	RespondSuccess(c, gin.H{
		"user": user.Sanitize(),
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	// Attempt to read session cookie
	sessionID, _ := c.Cookie(SessionCookieName)
	if sessionID == "" {
		// Fallback to context or header if cookie wasn't present
		if sessVal, exists := c.Get("session"); exists {
			if sess, ok := sessVal.(models.Session); ok {
				sessionID = sess.ID
			}
		}
	}

	if sessionID != "" {
		_ = h.authSvc.Logout(c.Request.Context(), sessionID)
	}

	isSecure := h.cfg.AppEnv == "production"
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		SessionCookieName,
		"",
		-1,
		"/",
		"",
		isSecure,
		true, // HttpOnly
	)

	RespondSuccess(c, gin.H{
		"message": "Logged out successfully.",
	})
}
