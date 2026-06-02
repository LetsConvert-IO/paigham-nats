package middleware

import (
	"net/http"

	"github.com/gorilla/sessions"
	"github.com/paigham/paigham-nats/config"
)

const sessionName = "paigham-session"

type AuthMiddleware struct {
	cfg   *config.Config
	store *sessions.CookieStore
}

func NewAuthMiddleware(cfg *config.Config, store *sessions.CookieStore) *AuthMiddleware {
	return &AuthMiddleware{
		cfg:   cfg,
		store: store,
	}
}

func (m *AuthMiddleware) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// If auth is disabled, allow all requests
		if !m.cfg.IsAuthEnabled() {
			next.ServeHTTP(w, r)
			return
		}

		session, err := m.store.Get(r, sessionName)
		if err != nil {
			http.Error(w, `{"error":"Invalid session"}`, http.StatusUnauthorized)
			return
		}

		auth, ok := session.Values["authenticated"].(bool)
		if !ok || !auth {
			http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}
