import { b as attr_class, e as escape_html, ab as bind_props, c as stringify } from "./index.js";
function ConfirmModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      open = false,
      title = "Confirm",
      message = "Are you sure?",
      confirmText = "Confirm",
      cancelText = "Cancel",
      confirmClass = "btn-error",
      onConfirm = () => {
      }
    } = $$props;
    $$renderer2.push(`<dialog${attr_class("modal", void 0, { "modal-open": open })}><div class="modal-box"><h3 class="text-lg font-bold">${escape_html(title)}</h3> <p class="py-4">${escape_html(message)}</p> <div class="modal-action"><button class="btn">${escape_html(cancelText)}</button> <button${attr_class(`btn ${stringify(confirmClass)}`)}>${escape_html(confirmText)}</button></div></div> <form method="dialog" class="modal-backdrop"><button>close</button></form></dialog>`);
    bind_props($$props, { open });
  });
}
export {
  ConfirmModal as C
};
