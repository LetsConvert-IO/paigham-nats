import { c as stringify, b as attr_class, d as attr, e as escape_html, f as derived, s as store_get, u as unsubscribe_stores } from "../../../../../chunks/index.js";
import { p as page } from "../../../../../chunks/stores.js";
import "../../../../../chunks/toast.js";
import { C as ConfirmModal } from "../../../../../chunks/ConfirmModal.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let loading = true;
    let startSeq = 0;
    let limit = 50;
    let messageDetailOpen = false;
    let deleteModalOpen = false;
    let messageToDelete = null;
    let streamName = derived(() => store_get($$store_subs ??= {}, "$page", page).params.name);
    async function handleDelete() {
      return;
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmModal($$renderer3, {
        title: "Delete Message",
        message: `Are you sure you want to delete message sequence ${stringify(messageToDelete?.sequence)}?`,
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
      $$renderer3.push(`<!----> <dialog${attr_class("modal", void 0, { "modal-open": messageDetailOpen })}><div class="modal-box w-11/12 max-w-3xl">`);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <form method="dialog" class="modal-backdrop"><button>close</button></form></dialog> <div class="space-y-4 sm:space-y-6"><div class="text-sm breadcrumbs overflow-x-auto"><ul><li><a href="/streams">Streams</a></li> <li><a${attr("href", `/streams/${stringify(streamName())}`)} class="max-w-[150px] truncate">${escape_html(streamName())}</a></li> <li>Messages</li></ul></div> <div class="flex flex-col gap-4"><h1 class="text-xl sm:text-2xl font-bold">Messages</h1> <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div class="flex flex-wrap items-center gap-2"><input type="number" placeholder="Start seq" class="input input-bordered input-sm w-24 sm:w-32"${attr("value", startSeq)}/> `);
      $$renderer3.select({ class: "select select-bordered select-sm", value: limit }, ($$renderer4) => {
        $$renderer4.option({ value: 25 }, ($$renderer5) => {
          $$renderer5.push(`25`);
        });
        $$renderer4.option({ value: 50 }, ($$renderer5) => {
          $$renderer5.push(`50`);
        });
        $$renderer4.option({ value: 100 }, ($$renderer5) => {
          $$renderer5.push(`100`);
        });
      });
      $$renderer3.push(` <button class="btn btn-primary btn-sm"${attr("disabled", loading, true)}>Load</button></div></div></div> `);
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
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
