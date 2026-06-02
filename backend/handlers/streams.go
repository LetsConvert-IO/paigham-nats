package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/paigham/paigham-nats/nats"
)

type StreamHandler struct {
	client *nats.Client
}

func NewStreamHandler(client *nats.Client) *StreamHandler {
	return &StreamHandler{client: client}
}

func (h *StreamHandler) List(w http.ResponseWriter, r *http.Request) {
	streams, err := h.client.ListStreams(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to list streams: "+err.Error())
		return
	}

	if streams == nil {
		streams = []nats.StreamInfo{}
	}

	writeJSON(w, http.StatusOK, streams)
}

func (h *StreamHandler) Get(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	if name == "" {
		writeError(w, http.StatusBadRequest, "Stream name is required")
		return
	}

	stream, err := h.client.GetStream(r.Context(), name)
	if err != nil {
		writeError(w, http.StatusNotFound, "Stream not found: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, stream)
}

func (h *StreamHandler) Delete(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	if name == "" {
		writeError(w, http.StatusBadRequest, "Stream name is required")
		return
	}

	if err := h.client.DeleteStream(r.Context(), name); err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to delete stream: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Stream deleted successfully"})
}

func (h *StreamHandler) Purge(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	if name == "" {
		writeError(w, http.StatusBadRequest, "Stream name is required")
		return
	}

	if err := h.client.PurgeStream(r.Context(), name); err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to purge stream: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Stream purged successfully"})
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
