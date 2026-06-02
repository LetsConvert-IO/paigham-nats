import { c as stringify, e as escape_html, f as derived, s as store_get, d as attr, a as ensure_array_like, u as unsubscribe_stores } from "../../../../chunks/index.js";
import { p as page } from "../../../../chunks/stores.js";
import { g as goto } from "../../../../chunks/client.js";
import { b as deleteStream, p as purgeStream, c as getStream, e as getConsumers } from "../../../../chunks/api.js";
import { t as toast } from "../../../../chunks/toast.js";
import { C as ConfirmModal } from "../../../../chunks/ConfirmModal.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let stream = null;
    let consumers = [];
    let loading = true;
    let error = null;
    let consumerSearch = "";
    let deleteStreamModalOpen = false;
    let purgeStreamModalOpen = false;
    let deleteConsumerModalOpen = false;
    let selectedConsumer = null;
    let streamName = derived(() => store_get($$store_subs ??= {}, "$page", page).params.name);
    async function loadData() {
      loading = true;
      error = null;
      try {
        const [streamData, consumersData] = await Promise.all([getStream(streamName()), getConsumers(streamName())]);
        stream = streamData;
        consumers = consumersData;
      } catch (e) {
        error = e.message;
      } finally {
        loading = false;
      }
    }
    let filteredConsumers = derived(() => () => {
      if (!consumerSearch.trim()) return consumers;
      const query = consumerSearch.toLowerCase();
      return consumers.filter((c) => c.name.toLowerCase().includes(query) || c.config?.filter_subject?.toLowerCase().includes(query));
    });
    async function handleDeleteStream() {
      try {
        await deleteStream(streamName());
        toast.success(`Stream "${streamName()}" deleted`);
        goto("/streams");
      } catch (e) {
        toast.error(`Failed to delete stream: ${e.message}`);
      }
    }
    async function handlePurgeStream() {
      try {
        await purgeStream(streamName());
        toast.success(`Stream "${streamName()}" purged`);
        await loadData();
      } catch (e) {
        toast.error(`Failed to purge stream: ${e.message}`);
      }
    }
    async function handleDeleteConsumer() {
      return;
    }
    function formatBytes(bytes) {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmModal($$renderer3, {
        title: "Delete Stream",
        message: `Are you sure you want to delete stream '${stringify(streamName())}'? This will also delete all consumers and messages. This action cannot be undone.`,
        confirmText: "Delete",
        onConfirm: handleDeleteStream,
        get open() {
          return deleteStreamModalOpen;
        },
        set open($$value) {
          deleteStreamModalOpen = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ConfirmModal($$renderer3, {
        title: "Purge Stream",
        message: `Are you sure you want to purge all messages from stream '${stringify(streamName())}'?`,
        confirmText: "Purge",
        confirmClass: "btn-warning",
        onConfirm: handlePurgeStream,
        get open() {
          return purgeStreamModalOpen;
        },
        set open($$value) {
          purgeStreamModalOpen = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ConfirmModal($$renderer3, {
        title: "Delete Consumer",
        message: `Are you sure you want to delete consumer '${stringify(selectedConsumer?.name)}'?`,
        confirmText: "Delete",
        onConfirm: handleDeleteConsumer,
        get open() {
          return deleteConsumerModalOpen;
        },
        set open($$value) {
          deleteConsumerModalOpen = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="space-y-4 sm:space-y-6"><div class="text-sm breadcrumbs overflow-x-auto"><ul><li><a href="/streams">Streams</a></li> <li class="max-w-[200px] truncate">${escape_html(streamName())}</li></ul></div> `);
      if (loading) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex justify-center p-8"><span class="loading loading-spinner loading-lg"></span></div>`);
      } else if (error) {
        $$renderer3.push("<!--[1-->");
        $$renderer3.push(`<div class="alert alert-error"><svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>${escape_html(error)}</span> <a href="/streams" class="btn btn-sm">Back to Streams</a></div>`);
      } else if (stream) {
        $$renderer3.push("<!--[2-->");
        $$renderer3.push(`<div class="flex flex-col gap-4"><div><h1 class="text-xl sm:text-2xl font-bold break-all">${escape_html(stream.name)}</h1> `);
        if (stream.description) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<p class="text-base-content/60 mt-1">${escape_html(stream.description)}</p>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div> <div class="flex flex-wrap gap-2"><a${attr("href", `/streams/${stringify(streamName())}/messages`)} class="btn btn-outline btn-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> <span class="hidden sm:inline">View</span> Messages</a> <button class="btn btn-warning btn-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> Purge</button> <button class="btn btn-error btn-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> Delete</button></div></div> <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"><div class="stat bg-base-100 rounded-lg shadow p-3 sm:p-4"><div class="stat-title text-xs sm:text-sm">Messages</div> <div class="stat-value text-base sm:text-lg">${escape_html(stream.messages.toLocaleString())}</div></div> <div class="stat bg-base-100 rounded-lg shadow p-3 sm:p-4"><div class="stat-title text-xs sm:text-sm">Storage</div> <div class="stat-value text-base sm:text-lg">${escape_html(formatBytes(stream.bytes))}</div></div> <div class="stat bg-base-100 rounded-lg shadow p-3 sm:p-4"><div class="stat-title text-xs sm:text-sm">Consumers</div> <div class="stat-value text-base sm:text-lg">${escape_html(stream.consumer_count)}</div></div> <div class="stat bg-base-100 rounded-lg shadow p-3 sm:p-4"><div class="stat-title text-xs sm:text-sm">Sequence</div> <div class="stat-value text-base sm:text-lg font-mono">${escape_html(stream.first_seq)}-${escape_html(stream.last_seq)}</div></div></div> <div class="card bg-base-100 shadow"><div class="card-body p-4 sm:p-6"><h2 class="card-title text-base sm:text-lg">Subjects</h2> <div class="flex flex-wrap gap-2"><!--[-->`);
        const each_array = ensure_array_like(stream.subjects);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let subject = each_array[$$index];
          $$renderer3.push(`<span class="badge badge-lg badge-outline break-all">${escape_html(subject)}</span>`);
        }
        $$renderer3.push(`<!--]--></div></div></div> <div class="card bg-base-100 shadow"><div class="card-body p-4 sm:p-6"><div class="flex items-center justify-between"><h2 class="card-title text-base sm:text-lg">Configuration</h2> <button class="btn btn-ghost btn-sm">${escape_html("Show")} JSON</button></div> `);
        {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<div class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4"><div><p class="text-xs sm:text-sm text-base-content/60">Retention</p> <p class="font-medium text-sm sm:text-base">${escape_html(stream.config.retention || "Limits")}</p></div> <div><p class="text-xs sm:text-sm text-base-content/60">Max Messages</p> <p class="font-medium text-sm sm:text-base">${escape_html(stream.config.max_msgs === -1 ? "Unlimited" : stream.config.max_msgs?.toLocaleString())}</p></div> <div><p class="text-xs sm:text-sm text-base-content/60">Max Bytes</p> <p class="font-medium text-sm sm:text-base">${escape_html(stream.config.max_bytes === -1 ? "Unlimited" : formatBytes(stream.config.max_bytes))}</p></div> <div><p class="text-xs sm:text-sm text-base-content/60">Max Age</p> <p class="font-medium text-sm sm:text-base">${escape_html(stream.config.max_age === 0 ? "Unlimited" : stream.config.max_age)}</p></div> <div><p class="text-xs sm:text-sm text-base-content/60">Storage Type</p> <p class="font-medium text-sm sm:text-base">${escape_html(stream.config.storage || "File")}</p></div> <div><p class="text-xs sm:text-sm text-base-content/60">Replicas</p> <p class="font-medium text-sm sm:text-base">${escape_html(stream.config.num_replicas || 1)}</p></div></div>`);
        }
        $$renderer3.push(`<!--]--></div></div> <div class="card bg-base-100 shadow"><div class="card-body p-4 sm:p-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><h2 class="card-title text-base sm:text-lg">Consumers (${escape_html(consumers.length)})</h2> `);
        if (consumers.length > 0) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="join w-full sm:w-auto"><div class="relative flex-1 sm:flex-initial"><input type="text" placeholder="Search consumers..." class="input input-bordered input-sm join-item w-full sm:w-48 pl-8"${attr("value", consumerSearch)}/> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div> `);
          {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div> `);
        if (consumers.length === 0) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<p class="text-base-content/60 mt-2">No consumers configured for this stream.</p>`);
        } else if (filteredConsumers()().length === 0) {
          $$renderer3.push("<!--[1-->");
          $$renderer3.push(`<div class="text-center py-4"><p class="text-base-content/60">No consumers match "${escape_html(consumerSearch)}"</p> <button class="btn btn-ghost btn-sm mt-2">Clear search</button></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<div class="block lg:hidden space-y-3 mt-3"><!--[-->`);
          const each_array_1 = ensure_array_like(filteredConsumers()());
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let consumer = each_array_1[$$index_1];
            $$renderer3.push(`<div class="bg-base-200 rounded-lg p-3"><div class="flex items-start justify-between gap-2"><a${attr("href", `/consumers/${stringify(streamName())}/${stringify(consumer.name)}`)} class="link link-primary font-medium break-all">${escape_html(consumer.name)}</a> <button class="btn btn-ghost btn-xs text-error flex-shrink-0">Delete</button></div> <div class="grid grid-cols-2 gap-2 mt-2 text-sm"><div><span class="text-base-content/60">Pending:</span> <span class="font-medium ml-1">${escape_html(consumer.num_pending.toLocaleString())}</span></div> <div><span class="text-base-content/60">Ack Pending:</span> <span class="font-medium ml-1">${escape_html(consumer.num_ack_pending)}</span></div> <div><span class="text-base-content/60">Redelivered:</span> <span class="font-medium ml-1">${escape_html(consumer.num_redelivered)}</span></div> <div><span class="text-base-content/60">Delivered:</span> <span class="font-medium ml-1">${escape_html(consumer.delivered?.stream_seq || 0)}</span></div></div></div>`);
          }
          $$renderer3.push(`<!--]--></div> <div class="hidden lg:block overflow-x-auto mt-3"><table class="table"><thead><tr><th>Name</th><th>Pending</th><th>Ack Pending</th><th>Redelivered</th><th>Delivered</th><th></th></tr></thead><tbody><!--[-->`);
          const each_array_2 = ensure_array_like(filteredConsumers()());
          for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
            let consumer = each_array_2[$$index_2];
            $$renderer3.push(`<tr class="hover"><td><a${attr("href", `/consumers/${stringify(streamName())}/${stringify(consumer.name)}`)} class="link link-primary font-medium">${escape_html(consumer.name)}</a></td><td>${escape_html(consumer.num_pending.toLocaleString())}</td><td>${escape_html(consumer.num_ack_pending)}</td><td>${escape_html(consumer.num_redelivered)}</td><td>${escape_html(consumer.delivered?.stream_seq || 0)}</td><td><button class="btn btn-ghost btn-sm text-error">Delete</button></td></tr>`);
          }
          $$renderer3.push(`<!--]--></tbody></table></div>`);
        }
        $$renderer3.push(`<!--]--></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
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
