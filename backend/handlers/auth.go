package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gorilla/sessions"
	"github.com/paigham/paigham-nats/config"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

const (
	sessionName = "paigham-session"
	userInfoURL = "https://www.googleapis.com/oauth2/v2/userinfo"
)

type AuthHandler struct {
	cfg         *config.Config
	oauthConfig *oauth2.Config
	store       *sessions.CookieStore
}

type User struct {
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	store := sessions.NewCookieStore(cfg.SessionSecret)
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7, // 7 days
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}

	var oauthConfig *oauth2.Config
	if cfg.IsAuthEnabled() {
		oauthConfig = &oauth2.Config{
			ClientID:     cfg.GoogleClientID,
			ClientSecret: cfg.GoogleClientSecret,
			RedirectURL:  cfg.BaseURL + "/api/auth/callback",
			Scopes:       []string{"email", "profile"},
			Endpoint:     google.Endpoint,
		}
	}

	return &AuthHandler{
		cfg:         cfg,
		oauthConfig: oauthConfig,
		store:       store,
	}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if !h.cfg.IsAuthEnabled() {
		writeJSON(w, http.StatusOK, map[string]string{"message": "Auth is disabled"})
		return
	}

	state := "paigham-state" // In production, use a random state
	url := h.oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (h *AuthHandler) Callback(w http.ResponseWriter, r *http.Request) {
	if !h.cfg.IsAuthEnabled() {
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	code := r.URL.Query().Get("code")
	if code == "" {
		writeError(w, http.StatusBadRequest, "Missing authorization code")
		return
	}

	token, err := h.oauthConfig.Exchange(context.Background(), code)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to exchange token: "+err.Error())
		return
	}

	client := h.oauthConfig.Client(context.Background(), token)
	resp, err := client.Get(userInfoURL)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to get user info: "+err.Error())
		return
	}
	defer resp.Body.Close()

	var user User
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to decode user info: "+err.Error())
		return
	}

	if !h.cfg.IsUserAllowed(user.Email) {
		writeError(w, http.StatusForbidden, "User not allowed")
		return
	}

	session, _ := h.store.Get(r, sessionName)
	session.Values["email"] = user.Email
	session.Values["name"] = user.Name
	session.Values["picture"] = user.Picture
	session.Values["authenticated"] = true

	if err := session.Save(r, w); err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to save session: "+err.Error())
		return
	}

	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	session, _ := h.store.Get(r, sessionName)
	session.Values["authenticated"] = false
	session.Options.MaxAge = -1
	session.Save(r, w)

	writeJSON(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	if !h.cfg.IsAuthEnabled() {
		writeJSON(w, http.StatusOK, map[string]interface{}{
			"authenticated": true,
			"auth_enabled":  false,
			"user": User{
				Email: "anonymous",
				Name:  "Anonymous User",
			},
		})
		return
	}

	session, _ := h.store.Get(r, sessionName)
	auth, ok := session.Values["authenticated"].(bool)
	if !ok || !auth {
		writeJSON(w, http.StatusOK, map[string]interface{}{
			"authenticated": false,
			"auth_enabled":  true,
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"authenticated": true,
		"auth_enabled":  true,
		"user": User{
			Email:   session.Values["email"].(string),
			Name:    session.Values["name"].(string),
			Picture: session.Values["picture"].(string),
		},
	})
}

func (h *AuthHandler) GetStore() *sessions.CookieStore {
	return h.store
}
