package config

import (
	"crypto/rand"
	"encoding/base64"
	"os"
	"strings"
)

type Config struct {
	NatsURL            string
	Port               string
	AuthMode           string
	GoogleClientID     string
	GoogleClientSecret string
	AllowedUsers       []string
	SessionSecret      []byte
	BaseURL            string
}

func Load() *Config {
	cfg := &Config{
		NatsURL:            getEnv("NATS_URL", "nats://localhost:4222"),
		Port:               getEnv("PORT", "8080"),
		AuthMode:           getEnv("AUTH_MODE", "none"),
		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		BaseURL:            getEnv("BASE_URL", "http://localhost:8080"),
	}

	allowedUsers := getEnv("ALLOWED_USERS", "")
	if allowedUsers != "" {
		cfg.AllowedUsers = strings.Split(allowedUsers, ",")
		for i, u := range cfg.AllowedUsers {
			cfg.AllowedUsers[i] = strings.TrimSpace(u)
		}
	}

	sessionSecret := getEnv("SESSION_SECRET", "")
	if sessionSecret != "" {
		cfg.SessionSecret = []byte(sessionSecret)
	} else {
		cfg.SessionSecret = generateRandomKey(32)
	}

	return cfg
}

func (c *Config) IsAuthEnabled() bool {
	return c.AuthMode == "google"
}

func (c *Config) IsUserAllowed(email string) bool {
	if len(c.AllowedUsers) == 0 {
		return true
	}
	for _, u := range c.AllowedUsers {
		if strings.EqualFold(u, email) {
			return true
		}
	}
	return false
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func generateRandomKey(length int) []byte {
	key := make([]byte, length)
	if _, err := rand.Read(key); err != nil {
		return []byte(base64.StdEncoding.EncodeToString([]byte("default-session-secret-change-me")))[:length]
	}
	return key
}
