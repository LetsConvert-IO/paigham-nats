const API_BASE = '/api';

async function fetchJSON(url, options = {}) {
	const response = await fetch(url, {
		...options,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		}
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: response.statusText }));
		throw new Error(error.error || 'Request failed');
	}

	return response.json();
}

// Auth
export async function getMe() {
	return fetchJSON(`${API_BASE}/auth/me`);
}

export function getLoginUrl() {
	return `${API_BASE}/auth/login`;
}

export async function logout() {
	return fetchJSON(`${API_BASE}/auth/logout`);
}

// Streams
export async function getStreams() {
	return fetchJSON(`${API_BASE}/streams`);
}

export async function getStream(name) {
	return fetchJSON(`${API_BASE}/streams/${encodeURIComponent(name)}`);
}

export async function deleteStream(name) {
	return fetchJSON(`${API_BASE}/streams/${encodeURIComponent(name)}`, {
		method: 'DELETE'
	});
}

export async function purgeStream(name) {
	return fetchJSON(`${API_BASE}/streams/${encodeURIComponent(name)}/purge`, {
		method: 'POST'
	});
}

// Consumers
export async function getConsumers(streamName) {
	return fetchJSON(`${API_BASE}/streams/${encodeURIComponent(streamName)}/consumers`);
}

export async function getConsumer(streamName, consumerName) {
	return fetchJSON(
		`${API_BASE}/streams/${encodeURIComponent(streamName)}/consumers/${encodeURIComponent(consumerName)}`
	);
}

export async function deleteConsumer(streamName, consumerName) {
	return fetchJSON(
		`${API_BASE}/streams/${encodeURIComponent(streamName)}/consumers/${encodeURIComponent(consumerName)}`,
		{ method: 'DELETE' }
	);
}

// Messages
export async function getMessages(streamName, startSeq = 0, limit = 50) {
	const params = new URLSearchParams();
	if (startSeq > 0) params.set('start_seq', startSeq.toString());
	if (limit !== 50) params.set('limit', limit.toString());

	const query = params.toString() ? `?${params.toString()}` : '';
	return fetchJSON(`${API_BASE}/streams/${encodeURIComponent(streamName)}/messages${query}`);
}

export async function getMessage(streamName, seq) {
	return fetchJSON(`${API_BASE}/streams/${encodeURIComponent(streamName)}/messages/${seq}`);
}

export async function deleteMessage(streamName, seq) {
	return fetchJSON(`${API_BASE}/streams/${encodeURIComponent(streamName)}/messages/${seq}`, {
		method: 'DELETE'
	});
}

// Health
export async function getHealth() {
	return fetchJSON('/health');
}
