const API_BASE = "/api";
async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || "Request failed");
  }
  return response.json();
}
async function getMe() {
  return fetchJSON(`${API_BASE}/auth/me`);
}
function getLoginUrl() {
  return `${API_BASE}/auth/login`;
}
async function logout() {
  return fetchJSON(`${API_BASE}/auth/logout`);
}
async function getStream(name) {
  return fetchJSON(`${API_BASE}/streams/${encodeURIComponent(name)}`);
}
async function deleteStream(name) {
  return fetchJSON(`${API_BASE}/streams/${encodeURIComponent(name)}`, {
    method: "DELETE"
  });
}
async function purgeStream(name) {
  return fetchJSON(`${API_BASE}/streams/${encodeURIComponent(name)}/purge`, {
    method: "POST"
  });
}
async function getConsumers(streamName) {
  return fetchJSON(`${API_BASE}/streams/${encodeURIComponent(streamName)}/consumers`);
}
async function deleteConsumer(streamName, consumerName) {
  return fetchJSON(
    `${API_BASE}/streams/${encodeURIComponent(streamName)}/consumers/${encodeURIComponent(consumerName)}`,
    { method: "DELETE" }
  );
}
export {
  getLoginUrl as a,
  deleteStream as b,
  getStream as c,
  deleteConsumer as d,
  getConsumers as e,
  getMe as g,
  logout as l,
  purgeStream as p
};
