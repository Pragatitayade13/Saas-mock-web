package routes

import (
	"os"
	"path/filepath"
	"strings"
	"time"

	"nexora/backend/internal/config"
	"nexora/backend/internal/handlers"
	"nexora/backend/internal/middleware"
	"nexora/backend/internal/models"
	"nexora/backend/internal/services"
	"nexora/backend/internal/store"

	"github.com/gin-gonic/gin"
)

// SetupRoutes registers all API endpoints and route groups.
func SetupRoutes(r *gin.Engine, cfg *config.Config, memStore *store.MemoryStore, mockDataDir string, authSvc *services.AuthService) {
	// Static File & SPA Fallback Handler for Production / Local Unified Server
	distDir := filepath.Join(".", "frontend", "dist")
	if _, err := os.Stat(distDir); err == nil {
		r.Static("/assets", filepath.Join(distDir, "assets"))
		r.StaticFile("/hero_3d.png", filepath.Join(distDir, "hero_3d.png"))
		r.StaticFile("/dashboard_3d_showcase.png", filepath.Join(distDir, "dashboard_3d_showcase.png"))
		r.StaticFile("/analytics_3d_landscape.png", filepath.Join(distDir, "analytics_3d_landscape.png"))
		r.StaticFile("/automation_3d_workflow.png", filepath.Join(distDir, "automation_3d_workflow.png"))
		r.StaticFile("/security_3d_shield.png", filepath.Join(distDir, "security_3d_shield.png"))
		r.StaticFile("/team_collaboration_3d.png", filepath.Join(distDir, "team_collaboration_3d.png"))
		r.StaticFile("/integrations_3d_ecosystem.png", filepath.Join(distDir, "integrations_3d_ecosystem.png"))
		r.StaticFile("/subscriptions_3d_growth.png", filepath.Join(distDir, "subscriptions_3d_growth.png"))
		r.StaticFile("/cta_3d_core.png", filepath.Join(distDir, "cta_3d_core.png"))
		r.StaticFile("/favicon.svg", filepath.Join(distDir, "favicon.svg"))

		r.NoRoute(func(c *gin.Context) {
			if !strings.HasPrefix(c.Request.URL.Path, "/api") && c.Request.URL.Path != "/health" {
				c.File(filepath.Join(distDir, "index.html"))
				return
			}
			handlers.NotFoundHandler(c)
		})
	} else {
		r.NoRoute(handlers.NotFoundHandler)
	}

	// Foundation Endpoints (Public)
	r.GET("/health", handlers.HealthCheckHandler)
	r.GET("/api", handlers.ApiInfoHandler(cfg))

	// Instantiate Services
	customerSvc := services.NewCustomerService(memStore)
	subSvc := services.NewSubscriptionService(memStore)
	txnSvc := services.NewTransactionService(memStore)
	notifSvc := services.NewNotificationService(memStore)
	userSvc := services.NewUserService(memStore)
	dashboardSvc := services.NewDashboardService(memStore)
	analyticsSvc := services.NewAnalyticsService(memStore)
	reportSvc := services.NewReportService(memStore)
	activitySvc := services.NewActivityService(memStore)
	auditSvc := services.NewAuditService(memStore)
	orgSvc := services.NewOrganizationService(memStore)
	teamSvc := services.NewTeamService(memStore)
	invSvc := services.NewInvitationService(memStore)
	roleSvc := services.NewRoleService(memStore)
	securitySvc := services.NewSecurityService(memStore)

	// Instantiate Handlers
	authHandler := handlers.NewAuthHandler(authSvc, cfg)
	custHandler := handlers.NewCustomerHandler(customerSvc)
	subHandler := handlers.NewSubscriptionHandler(subSvc)
	txnHandler := handlers.NewTransactionHandler(txnSvc)
	notifHandler := handlers.NewNotificationHandler(notifSvc)
	userHandler := handlers.NewUserHandler(userSvc)
	dashboardHandler := handlers.NewDashboardHandler(dashboardSvc)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsSvc)
	reportsHandler := handlers.NewReportsHandler(reportSvc)
	activityHandler := handlers.NewActivityHandler(activitySvc)
	auditHandler := handlers.NewAuditHandler(auditSvc)
	orgHandler := handlers.NewOrganizationHandler(orgSvc)
	teamHandler := handlers.NewTeamHandler(teamSvc)
	invHandler := handlers.NewInvitationsHandler(invSvc)
	rolesHandler := handlers.NewRolesHandler(roleSvc)
	securityHandler := handlers.NewSecurityHandler(securitySvc)
	demoHandler := handlers.NewDemoHandler(memStore, mockDataDir, cfg)

	// Central API Route Group
	api := r.Group("/api")
	{
		// Public Auth Routes
		auth := api.Group("/auth")
		{
			loginLimiter := middleware.NewLoginRateLimiter(10, 1*time.Minute)
			auth.POST("/login", loginLimiter, authHandler.Login)
		}

		// Protected Routes Group
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(authSvc))
		{
			// Current user & Logout
			protected.GET("/auth/me", authHandler.GetCurrentUser)
			protected.POST("/auth/logout", authHandler.Logout)

			// Dashboard (Accessible by Administrator, Manager, Viewer)
			protected.GET("/dashboard", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer), dashboardHandler.GetDashboard)

			// Analytics (Accessible by Administrator, Manager, Viewer)
			protected.GET("/analytics", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer), analyticsHandler.GetSummary)

			// Customers
			// Read: Administrator, Manager, Viewer
			customersRead := protected.Group("/customers", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer))
			{
				customersRead.GET("", custHandler.List)
				customersRead.GET("/:id", custHandler.Get)
				customersRead.GET("/:id/transactions", custHandler.GetTransactions)
				customersRead.GET("/:id/subscription", subHandler.GetCustomerSubscription)
			}
			// Write/Edit: Administrator, Manager
			customersWrite := protected.Group("/customers", middleware.RequireRole(models.RoleAdministrator, models.RoleManager))
			{
				customersWrite.POST("", custHandler.Create)
				customersWrite.PUT("/:id", custHandler.Update)
			}
			// Delete: Administrator only
			customersDelete := protected.Group("/customers", middleware.RequireRole(models.RoleAdministrator))
			{
				customersDelete.DELETE("/:id", custHandler.Delete)
			}

			// Centralized Plans (Accessible by Administrator, Manager, Viewer)
			protected.GET("/plans", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer), subHandler.GetPlans)

			// Subscriptions
			// Read: Administrator, Manager, Viewer
			subscriptionsRead := protected.Group("/subscriptions", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer))
			{
				subscriptionsRead.GET("", subHandler.List)
				subscriptionsRead.GET("/:id", subHandler.Get)
				subscriptionsRead.GET("/:id/transactions", subHandler.GetTransactions)
			}
			// Write/Edit/Action: Administrator, Manager
			subscriptionsWrite := protected.Group("/subscriptions", middleware.RequireRole(models.RoleAdministrator, models.RoleManager))
			{
				subscriptionsWrite.POST("", subHandler.Create)
				subscriptionsWrite.PUT("/:id", subHandler.Update)
				subscriptionsWrite.POST("/:id/change-plan", subHandler.ChangePlan)
				subscriptionsWrite.POST("/:id/cancel", subHandler.Cancel)
			}
			// Delete: Administrator only
			subscriptionsDelete := protected.Group("/subscriptions", middleware.RequireRole(models.RoleAdministrator))
			{
				subscriptionsDelete.DELETE("/:id", subHandler.Delete)
			}

			// Revenue Analytics & Transaction Summary (Accessible by Administrator, Manager, Viewer)
			protected.GET("/revenue/analytics", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer), txnHandler.GetRevenueAnalytics)
			protected.GET("/transactions/summary", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer), txnHandler.GetSummary)

			// Comprehensive Analytics Routes
			analyticsRead := protected.Group("/analytics", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer))
			{
				analyticsRead.GET("/summary", analyticsHandler.GetSummary)
				analyticsRead.GET("/revenue", analyticsHandler.GetRevenue)
				analyticsRead.GET("/customers", analyticsHandler.GetCustomerAnalytics)
				analyticsRead.GET("/customers/growth", analyticsHandler.GetCustomerGrowth)
				analyticsRead.GET("/subscriptions", analyticsHandler.GetSubscriptionAnalytics)
				analyticsRead.GET("/subscriptions/by-plan", analyticsHandler.GetTopPlans)
				analyticsRead.GET("/mrr", analyticsHandler.GetMRR)
				analyticsRead.GET("/churn", analyticsHandler.GetChurn)
				analyticsRead.GET("/transactions", analyticsHandler.GetTransactionAnalytics)
				analyticsRead.GET("/top-customers", analyticsHandler.GetTopCustomers)
				analyticsRead.GET("/top-plans", analyticsHandler.GetTopPlans)
			}
			// Analytics Export: Administrator, Manager
			protected.GET("/analytics/export", middleware.RequireRole(models.RoleAdministrator, models.RoleManager), analyticsHandler.ExportReport)

			// Transactions
			// Read: Administrator, Manager, Viewer
			transactionsRead := protected.Group("/transactions", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer))
			{
				transactionsRead.GET("", txnHandler.List)
				transactionsRead.GET("/:id", txnHandler.Get)
			}
			// Write/Refund: Administrator, Manager
			transactionsWrite := protected.Group("/transactions", middleware.RequireRole(models.RoleAdministrator, models.RoleManager))
			{
				transactionsWrite.POST("", txnHandler.Create)
				transactionsWrite.POST("/:id/refund", txnHandler.Refund)
			}

			// Notifications (Accessible by Administrator, Manager, Viewer)
			notifications := protected.Group("/notifications", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer))
			{
				notifications.GET("", notifHandler.List)
				notifications.PATCH("/read-all", notifHandler.MarkAllRead)
				notifications.PATCH("/:id/read", notifHandler.MarkRead)
				notifications.PATCH("/:id/unread", notifHandler.MarkUnread)
			}

			// Reports Routes
			reportsRead := protected.Group("/reports", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer))
			{
				reportsRead.GET("/summary", reportsHandler.GetSummary)
				reportsRead.GET("", reportsHandler.ListReports)
				reportsRead.GET("/:id", reportsHandler.GetReport)
				reportsRead.GET("/:id/download", reportsHandler.DownloadReport)
			}
			reportsWrite := protected.Group("/reports", middleware.RequireRole(models.RoleAdministrator, models.RoleManager))
			{
				reportsWrite.POST("", reportsHandler.CreateReport)
			}
			reportsDelete := protected.Group("/reports", middleware.RequireRole(models.RoleAdministrator))
			{
				reportsDelete.DELETE("/:id", reportsHandler.DeleteReport)
			}

			// Activity Center Routes (Accessible by Administrator, Manager, Viewer)
			activityRead := protected.Group("/activity", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer))
			{
				activityRead.GET("/summary", activityHandler.GetSummary)
				activityRead.GET("", activityHandler.List)
				activityRead.GET("/:id", activityHandler.Get)
			}

			// Security Audit Log Routes (Accessible by Administrator, Manager)
			auditRead := protected.Group("/audit", middleware.RequireRole(models.RoleAdministrator, models.RoleManager))
			{
				auditRead.GET("/summary", auditHandler.GetSummary)
				auditRead.GET("", auditHandler.List)
				auditRead.GET("/:id", auditHandler.Get)
			}

			// Organization Routes
			protected.GET("/organization", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer), orgHandler.Get)
			protected.PUT("/organization", middleware.RequireRole(models.RoleAdministrator), orgHandler.Update)

			// Team Routes
			teamRead := protected.Group("/team", middleware.RequireRole(models.RoleAdministrator, models.RoleManager))
			{
				teamRead.GET("", teamHandler.List)
				teamRead.GET("/:id", teamHandler.Get)
			}
			teamWrite := protected.Group("/team", middleware.RequireRole(models.RoleAdministrator))
			{
				teamWrite.PATCH("/:id/role", teamHandler.UpdateRole)
				teamWrite.PATCH("/:id/status", teamHandler.UpdateStatus)
			}

			// Team Invitations Routes
			invRead := protected.Group("/team/invitations", middleware.RequireRole(models.RoleAdministrator, models.RoleManager))
			{
				invRead.GET("", invHandler.List)
			}
			invWrite := protected.Group("/team/invitations", middleware.RequireRole(models.RoleAdministrator))
			{
				invWrite.POST("", invHandler.Create)
				invWrite.POST("/:id/revoke", invHandler.Revoke)
				invWrite.POST("/:id/resend", invHandler.Resend)
			}

			// Roles & Permissions Routes
			protected.GET("/roles", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer), rolesHandler.List)
			protected.GET("/roles/matrix", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer), rolesHandler.GetMatrix)

			// Security & Sessions Routes
			protected.GET("/security/sessions", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer), securityHandler.ListSessions)
			protected.POST("/security/sessions/revoke-others", middleware.RequireRole(models.RoleAdministrator, models.RoleManager, models.RoleViewer), securityHandler.RevokeOtherSessions)

			// Users (Accessible by Administrator, Manager)
			users := protected.Group("/users", middleware.RequireRole(models.RoleAdministrator, models.RoleManager))
			{
				users.GET("", userHandler.List)
				users.GET("/:id", userHandler.Get)
			}

			// Demo Controls
			demo := protected.Group("/demo", middleware.RequireRole(models.RoleAdministrator))
			{
				demo.POST("/reset", demoHandler.Reset)
				demo.GET("/state", demoHandler.GetState)
			}
		}

		// Public Invitation Accept Routes
		api.GET("/team/invitations/token/:token", invHandler.GetByToken)
		api.POST("/team/invitations/token/:token/accept", invHandler.Accept)
	}
}
