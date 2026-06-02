import { c as stringify, d as attr } from "../../../chunks/index.js";
import "../../../chunks/toast.js";
import { C as ConfirmModal } from "../../../chunks/ConfirmModal.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let loading = true;
    let deleteModalOpen = false;
    let purgeModalOpen = false;
    let selectedStream = null;
    async function handleDelete() {
      return;
    }
    async function handlePurge() {
      return;
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmModal($$renderer3, {
        title: "Delete Stream",
        message: `Are you sure you want to delete stream '${stringify(selectedStream?.name)}'? This action cannot be undone.`,
        confirmText: "Delete",
        onConfirm: handleDelete,
        get open() {
          return deleteModalOpen;
        },
        set open($$value) {
          deleteModalOpen = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ConfirmModal($$renderer3, {
        title: "Purge Stream",
        message: `Are you sure you want to purge all messages from stream '${stringify(selectedStream?.name)}'?`,
        confirmText: "Purge",
        confirmClass: "btn-warning",
        onConfirm: handlePurge,
        get open() {
          return purgeModalOpen;
        },
        set open($$value) {
          purgeModalOpen = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="space-y-4 sm:space-y-6"><div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><h1 class="text-xl sm:text-2xl font-bold">Streams</h1> <button class="btn btn-ghost btn-sm self-start sm:self-auto"${attr("disabled", loading, true)}><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> <span class="hidden sm:inline">Refresh</span></button></div> `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex justify-center p-8"><span class="loading loading-spinner loading-lg"></span></div>`);
      }
      $$renderer3.push(`<!--]--></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export {
  _page as default
};
