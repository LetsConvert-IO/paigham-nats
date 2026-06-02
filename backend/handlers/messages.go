package handlers

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/paigham/paigham-nats/nats"
)

type MessageHandler struct {
	client *nats.Client
}

func NewMessageHandler(client *nats.Client) *MessageHandler {
	return &MessageHandler{client: client}
}

func (h *MessageHandler) List(w http.ResponseWriter, r *http.Request) {
	streamName := chi.URLParam(r, "stream")
	if streamName == "" {
		writeError(w, http.StatusBadRequest, "Stream name is required")
		return
	}

	startSeq := uint64(0)
	if s := r.URL.Query().Get("start_seq"); s != "" {
		if parsed, err := strconv.ParseUint(s, 10, 64); err == nil {
			startSeq = parsed
		}
	}

	limit := 50
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	messages, err := h.client.GetMessages(r.Context(), streamName, startSeq, limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to get messages: "+err.Error())
		return
	}

	if messages == nil {
		messages = []nats.Message{}
	}

	writeJSON(w, http.StatusOK, messages)
}

func (h *MessageHandler) Get(w http.ResponseWriter, r *http.Request) {
	streamName := chi.URLParam(r, "stream")
	seqStr := chi.URLParam(r, "seq")

	if streamName == "" || seqStr == "" {
		writeError(w, http.StatusBadRequest, "Stream name and sequence are required")
		return
	}

	seq, err := strconv.ParseUint(seqStr, 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid sequence number")
		return
	}

	message, err := h.client.GetMessage(r.Context(), streamName, seq)
	if err != nil {
		writeError(w, http.StatusNotFound, "Message not found: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, message)
}

func (h *MessageHandler) Delete(w http.ResponseWriter, r *http.Request) {
	streamName := chi.URLParam(r, "stream")
	seqStr := chi.URLParam(r, "seq")

	if streamName == "" || seqStr == "" {
		writeError(w, http.StatusBadRequest, "Stream name and sequence are required")
		return
	}

	seq, err := strconv.ParseUint(seqStr, 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid sequence number")
		return
	}

	if err := h.client.DeleteMessage(r.Context(), streamName, seq); err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to delete message: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Message deleted successfully"})
}
