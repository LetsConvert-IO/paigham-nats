import { w as writable } from "./index2.js";
function createToastStore() {
  const { subscribe, update } = writable([]);
  let id = 0;
  function add(message, type = "info", duration = 4e3) {
    const toastId = ++id;
    update((toasts) => [...toasts, { id: toastId, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        remove(toastId);
      }, duration);
    }
    return toastId;
  }
  function remove(toastId) {
    update((toasts) => toasts.filter((t) => t.id !== toastId));
  }
  return {
    subscribe,
    success: (message, duration) => add(message, "success", duration),
    error: (message, duration) => add(message, "error", duration),
    warning: (message, duration) => add(message, "warning", duration),
    info: (message, duration) => add(message, "info", duration),
    remove
  };
}
const toast = createToastStore();
export {
  toast as t
};
