package nats

import (
	"context"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
)

type Client struct {
	conn *nats.Conn
	js   jetstream.JetStream
}

func NewClient(url string) (*Client, error) {
	opts := []nats.Option{
		nats.Name("paigham-nats"),
		nats.ReconnectWait(2 * time.Second),
		nats.MaxReconnects(-1),
	}

	conn, err := nats.Connect(url, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to NATS: %w", err)
	}

	js, err := jetstream.New(conn)
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to create JetStream context: %w", err)
	}

	return &Client{
		conn: conn,
		js:   js,
	}, nil
}

func (c *Client) Close() {
	if c.conn != nil {
		c.conn.Close()
	}
}

func (c *Client) IsConnected() bool {
	return c.conn != nil && c.conn.IsConnected()
}

type StreamInfo struct {
	Name         string              `json:"name"`
	Description  string              `json:"description,omitempty"`
	Subjects     []string            `json:"subjects"`
	Messages     uint64              `json:"messages"`
	Bytes        uint64              `json:"bytes"`
	FirstSeq     uint64              `json:"first_seq"`
	LastSeq      uint64              `json:"last_seq"`
	ConsumerCnt  int                 `json:"consumer_count"`
	Created      time.Time           `json:"created"`
	Config       jetstream.StreamConfig `json:"config"`
}

func (c *Client) ListStreams(ctx context.Context) ([]StreamInfo, error) {
	var streams []StreamInfo

	streamLister := c.js.ListStreams(ctx)
	for si := range streamLister.Info() {
		streams = append(streams, StreamInfo{
			Name:        si.Config.Name,
			Description: si.Config.Description,
			Subjects:    si.Config.Subjects,
			Messages:    si.State.Msgs,
			Bytes:       si.State.Bytes,
			FirstSeq:    si.State.FirstSeq,
			LastSeq:     si.State.LastSeq,
			ConsumerCnt: si.State.Consumers,
			Created:     si.Created,
			Config:      si.Config,
		})
	}

	if streamLister.Err() != nil {
		return nil, streamLister.Err()
	}

	return streams, nil
}

func (c *Client) GetStream(ctx context.Context, name string) (*StreamInfo, error) {
	stream, err := c.js.Stream(ctx, name)
	if err != nil {
		return nil, err
	}

	info, err := stream.Info(ctx)
	if err != nil {
		return nil, err
	}

	return &StreamInfo{
		Name:        info.Config.Name,
		Description: info.Config.Description,
		Subjects:    info.Config.Subjects,
		Messages:    info.State.Msgs,
		Bytes:       info.State.Bytes,
		FirstSeq:    info.State.FirstSeq,
		LastSeq:     info.State.LastSeq,
		ConsumerCnt: info.State.Consumers,
		Created:     info.Created,
		Config:      info.Config,
	}, nil
}

func (c *Client) DeleteStream(ctx context.Context, name string) error {
	return c.js.DeleteStream(ctx, name)
}

func (c *Client) PurgeStream(ctx context.Context, name string) error {
	stream, err := c.js.Stream(ctx, name)
	if err != nil {
		return err
	}
	return stream.Purge(ctx)
}

type ConsumerInfo struct {
	Name           string                  `json:"name"`
	StreamName     string                  `json:"stream_name"`
	Created        time.Time               `json:"created"`
	NumPending     uint64                  `json:"num_pending"`
	NumAckPending  int                     `json:"num_ack_pending"`
	NumRedelivered int                     `json:"num_redelivered"`
	NumWaiting     int                     `json:"num_waiting"`
	Delivered      jetstream.SequenceInfo  `json:"delivered"`
	AckFloor       jetstream.SequenceInfo  `json:"ack_floor"`
	Config         jetstream.ConsumerConfig `json:"config"`
}

func (c *Client) ListConsumers(ctx context.Context, streamName string) ([]ConsumerInfo, error) {
	stream, err := c.js.Stream(ctx, streamName)
	if err != nil {
		return nil, err
	}

	var consumers []ConsumerInfo
	consumerLister := stream.ListConsumers(ctx)
	for ci := range consumerLister.Info() {
		consumers = append(consumers, ConsumerInfo{
			Name:           ci.Name,
			StreamName:     streamName,
			Created:        ci.Created,
			NumPending:     ci.NumPending,
			NumAckPending:  ci.NumAckPending,
			NumRedelivered: ci.NumRedelivered,
			NumWaiting:     ci.NumWaiting,
			Delivered:      ci.Delivered,
			AckFloor:       ci.AckFloor,
			Config:         ci.Config,
		})
	}

	if consumerLister.Err() != nil {
		return nil, consumerLister.Err()
	}

	return consumers, nil
}

func (c *Client) GetConsumer(ctx context.Context, streamName, consumerName string) (*ConsumerInfo, error) {
	stream, err := c.js.Stream(ctx, streamName)
	if err != nil {
		return nil, err
	}

	consumer, err := stream.Consumer(ctx, consumerName)
	if err != nil {
		return nil, err
	}

	info, err := consumer.Info(ctx)
	if err != nil {
		return nil, err
	}

	return &ConsumerInfo{
		Name:           info.Name,
		StreamName:     streamName,
		Created:        info.Created,
		NumPending:     info.NumPending,
		NumAckPending:  info.NumAckPending,
		NumRedelivered: info.NumRedelivered,
		NumWaiting:     info.NumWaiting,
		Delivered:      info.Delivered,
		AckFloor:       info.AckFloor,
		Config:         info.Config,
	}, nil
}

func (c *Client) DeleteConsumer(ctx context.Context, streamName, consumerName string) error {
	stream, err := c.js.Stream(ctx, streamName)
	if err != nil {
		return err
	}
	return stream.DeleteConsumer(ctx, consumerName)
}

type Message struct {
	Subject  string            `json:"subject"`
	Sequence uint64            `json:"sequence"`
	Time     time.Time         `json:"time"`
	Data     string            `json:"data"`
	Headers  map[string]string `json:"headers,omitempty"`
}

func (c *Client) GetMessages(ctx context.Context, streamName string, startSeq uint64, limit int) ([]Message, error) {
	stream, err := c.js.Stream(ctx, streamName)
	if err != nil {
		return nil, err
	}

	info, err := stream.Info(ctx)
	if err != nil {
		return nil, err
	}

	if startSeq == 0 {
		startSeq = info.State.FirstSeq
	}

	if startSeq < info.State.FirstSeq {
		startSeq = info.State.FirstSeq
	}

	var messages []Message
	for seq := startSeq; seq <= info.State.LastSeq && len(messages) < limit; seq++ {
		msg, err := stream.GetMsg(ctx, seq)
		if err != nil {
			continue
		}

		headers := make(map[string]string)
		for k, v := range msg.Header {
			if len(v) > 0 {
				headers[k] = v[0]
			}
		}

		messages = append(messages, Message{
			Subject:  msg.Subject,
			Sequence: msg.Sequence,
			Time:     msg.Time,
			Data:     string(msg.Data),
			Headers:  headers,
		})
	}

	return messages, nil
}

func (c *Client) GetMessage(ctx context.Context, streamName string, seq uint64) (*Message, error) {
	stream, err := c.js.Stream(ctx, streamName)
	if err != nil {
		return nil, err
	}

	msg, err := stream.GetMsg(ctx, seq)
	if err != nil {
		return nil, err
	}

	headers := make(map[string]string)
	for k, v := range msg.Header {
		if len(v) > 0 {
			headers[k] = v[0]
		}
	}

	return &Message{
		Subject:  msg.Subject,
		Sequence: msg.Sequence,
		Time:     msg.Time,
		Data:     string(msg.Data),
		Headers:  headers,
	}, nil
}

func (c *Client) DeleteMessage(ctx context.Context, streamName string, seq uint64) error {
	stream, err := c.js.Stream(ctx, streamName)
	if err != nil {
		return err
	}
	return stream.DeleteMsg(ctx, seq)
}
