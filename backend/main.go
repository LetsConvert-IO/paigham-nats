package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/paigham/paigham-nats/config"
	"github.com/paigham/paigham-nats/handlers"
	"github.com/paigham/paigham-nats/middleware"
	"github.com/paigham/paigham-nats/nats"
)

//go:embed static/*
var staticFiles embed.FS

func main() {
	cfg := config.Load()

	// Connect to NATS
	log.Printf("Connecting to NATS at %s...", cfg.NatsURL)
	natsClient, err := nats.NewClient(cfg.NatsURL)
	if err != nil {
		log.Fatalf("Failed to connect to NATS: %v", err)
	}
	defer natsClient.Close()
	log.Println("Connected to NATS successfully")

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(cfg)
	streamHandler := handlers.NewStreamHandler(natsClient)
	consumerHandler := handlers.NewConsumerHandler(natsClient)
	messageHandler := handlers.NewMessageHandler(natsClient)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(cfg, authHandler.GetStore())

	// Setup router
	r := chi.NewRouter()

	// Global middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:8080"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if natsClient.IsConnected() {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"status":"healthy","nats":"connected"}`))
		} else {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte(`{"status":"unhealthy","nats":"disconnected"}`))
		}
	})

	// Auth routes (no auth required)
	r.Route("/api/auth", func(r chi.Router) {
		r.Get("/login", authHandler.Login)
		r.Get("/callback", authHandler.Callback)
		r.Get("/logout", authHandler.Logout)
		r.Get("/me", authHandler.Me)
	})

	// Protected API routes
	r.Route("/api", func(r chi.Router) {
		r.Use(authMiddleware.RequireAuth)

		// Streams
		r.Get("/streams", streamHandler.List)
		r.Get("/streams/{name}", streamHandler.Get)
		r.Delete("/streams/{name}", streamHandler.Delete)
		r.Post("/streams/{name}/purge", streamHandler.Purge)

		// Consumers
		r.Get("/streams/{stream}/consumers", consumerHandler.List)
		r.Get("/streams/{stream}/consumers/{name}", consumerHandler.Get)
		r.Delete("/streams/{stream}/consumers/{name}", consumerHandler.Delete)

		// Messages
		r.Get("/streams/{stream}/messages", messageHandler.List)
		r.Get("/streams/{stream}/messages/{seq}", messageHandler.Get)
		r.Delete("/streams/{stream}/messages/{seq}", messageHandler.Delete)
	})

	// Serve static files (SvelteKit build output)
	staticFS, err := fs.Sub(staticFiles, "static")
	if err != nil {
		log.Printf("Warning: No static files embedded, will serve from filesystem")
		// Fallback to filesystem for development
		r.Handle("/*", http.FileServer(http.Dir("./static")))
	} else {
		fileServer := http.FileServer(http.FS(staticFS))
		r.Handle("/*", http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			// Try to serve the file directly
			path := strings.TrimPrefix(req.URL.Path, "/")
			if path == "" {
				path = "index.html"
			}

			// Check if file exists
			if _, err := staticFS.Open(path); err != nil {
				// File doesn't exist, serve index.html for SPA routing
				req.URL.Path = "/"
				path = "index.html"
			}

			fileServer.ServeHTTP(w, req)
		}))
	}

	// Start server
	addr := ":" + cfg.Port
	log.Printf("Starting Paigham-NATS server on %s", addr)
	log.Printf("Auth mode: %s", cfg.AuthMode)

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan
		log.Println("Shutting down...")
		natsClient.Close()
		os.Exit(0)
	}()

	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
