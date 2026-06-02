package handlers

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/paigham/paigham-nats/nats"
)

type ConsumerHandler struct {
	client *nats.Client
}

func NewConsumerHandler(client *nats.Client) *ConsumerHandler {
	return &ConsumerHandler{client: client}
}

func (h *ConsumerHandler) List(w http.ResponseWriter, r *http.Request) {
	streamName := chi.URLParam(r, "stream")
	if streamName == "" {
		writeError(w, http.StatusBadRequest, "Stream name is required")
		return
	}

	consumers, err := h.client.ListConsumers(r.Context(), streamName)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to list consumers: "+err.Error())
		return
	}

	if consumers == nil {
		consumers = []nats.ConsumerInfo{}
	}

	writeJSON(w, http.StatusOK, consumers)
}

func (h *ConsumerHandler) Get(w http.ResponseWriter, r *http.Request) {
	streamName := chi.URLParam(r, "stream")
	consumerName := chi.URLParam(r, "name")

	if streamName == "" || consumerName == "" {
		writeError(w, http.StatusBadRequest, "Stream and consumer names are required")
		return
	}

	consumer, err := h.client.GetConsumer(r.Context(), streamName, consumerName)
	if err != nil {
		writeError(w, http.StatusNotFound, "Consumer not found: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, consumer)
}

func (h *ConsumerHandler) Delete(w http.ResponseWriter, r *http.Request) {
	streamName := chi.URLParam(r, "stream")
	consumerName := chi.URLParam(r, "name")

	if streamName == "" || consumerName == "" {
		writeError(w, http.StatusBadRequest, "Stream and consumer names are required")
		return
	}

	if err := h.client.DeleteConsumer(r.Context(), streamName, consumerName); err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to delete consumer: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Consumer deleted successfully"})
}
