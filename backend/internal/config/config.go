package config

import (
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	AppEnv      string
	FrontendURL string
	SessionTTL  time.Duration
}

// LoadConfig loads application configuration from environment variables or sensible defaults.
func LoadConfig() *Config {
	// Attempt to load .env file if available (ignore error if missing)
	_ = godotenv.Load("../.env", ".env")

	port := getEnv("PORT", "8080")
	if !strings.HasPrefix(port, ":") && port != "" {
		port = ":" + port
	}

	ttlStr := getEnv("SESSION_TTL", "24h")
	ttl, err := time.ParseDuration(ttlStr)
	if err != nil {
		ttl = 24 * time.Hour
	}

	return &Config{
		Port:        port,
		AppEnv:      getEnv("APP_ENV", "development"),
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:5173"),
		SessionTTL:  ttl,
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}
