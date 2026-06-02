import { c as stringify, d as attr, e as escape_html, f as derived, s as store_get, u as unsubscribe_stores } from "../../../../../chunks/index.js";
import { p as page } from "../../../../../chunks/stores.js";
import { g as goto } from "../../../../../chunks/client.js";
import { d as deleteConsumer } from "../../../../../chunks/api.js";
import { t as toast } from "../../../../../chunks/toast.js";
import { C as ConfirmModal } from "../../../../../chunks/ConfirmModal.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let deleteModalOpen = false;
    let streamName = derived(() => store_get($$store_subs ??= {}, "$page", page).params.stream);
    let consumerName = derived(() => store_get($$store_subs ??= {}, "$page", page).params.name);
    async function handleDelete() {
      try {
        await deleteConsumer(streamName(), consumerName());
        toast.success(`Consumer "${consumerName()}" deleted`);
        goto(`/streams/${streamName()}`);
      } catch (e) {
        toast.error(`Failed to delete consumer: ${e.message}`);
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmModal($$renderer3, {
        title: "Delete Consumer",
        message: `Are you sure you want to delete consumer '${stringify(consumerName())}'? This action cannot be undone.`,
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
      $$renderer3.push(`<!----> <div class="space-y-4 sm:space-y-6"><div class="text-sm breadcrumbs overflow-x-auto"><ul><li><a href="/streams">Streams</a></li> <li><a${attr("href", `/streams/${stringify(streamName())}`)} class="max-w-[100px] truncate">${escape_html(streamName())}</a></li> <li class="max-w-[150px] truncate">${escape_html(consumerName())}</li></ul></div> `);
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
