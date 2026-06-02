import { a as ensure_array_like, s as store_get, b as attr_class, c as stringify, e as escape_html, u as unsubscribe_stores, d as attr, h as head } from "../../chunks/index.js";
import { w as writable } from "../../chunks/index2.js";
import { l as logout, g as getMe, a as getLoginUrl } from "../../chunks/api.js";
import { t as toast } from "../../chunks/toast.js";
function createAuthStore() {
  const { subscribe, set, update } = writable({
    loading: true,
    authenticated: false,
    authEnabled: false,
    user: null
  });
  return {
    subscribe,
    async init() {
      try {
        const data = await getMe();
        set({
          loading: false,
          authenticated: data.authenticated,
          authEnabled: data.auth_enabled,
          user: data.user || null
        });
      } catch (error) {
        set({
          loading: false,
          authenticated: false,
          authEnabled: true,
          user: null
        });
      }
    },
    async logout() {
      try {
        await logout();
        set({
          loading: false,
          authenticated: false,
          authEnabled: true,
          user: null
        });
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };
}
const auth = createAuthStore();
function Toast($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const alertClass = {
      success: "alert-success",
      error: "alert-error",
      warning: "alert-warning",
      info: "alert-info"
    };
    $$renderer2.push(`<div class="toast toast-end toast-top z-50"><!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$toast", toast));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let t = each_array[$$index];
      $$renderer2.push(`<div${attr_class(`alert ${stringify(alertClass[t.type] || "alert-info")} shadow-lg`)}><span>${escape_html(t.message)}</span> <button class="btn btn-ghost btn-xs"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Logo($$renderer, $$props) {
  let { size = 40 } = $$props;
  $$renderer.push(`<svg${attr("width", size)}${attr("height", size)} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block"><ellipse cx="32" cy="34" rx="16" ry="12" fill="oklch(var(--bc) / 0.8)"></ellipse><circle cx="44" cy="24" r="8" fill="oklch(var(--bc) / 0.8)"></circle><circle cx="46" cy="23" r="2" fill="oklch(var(--b1))"></circle><circle cx="46.5" cy="22.5" r="1" fill="oklch(var(--bc))"></circle><polygon points="52,24 58,26 52,28" fill="oklch(var(--wa))"></polygon><ellipse cx="28" cy="32" rx="10" ry="6" fill="oklch(var(--bc) / 0.6)"></ellipse><polygon points="16,34 8,28 10,34 8,40 16,34" fill="oklch(var(--bc) / 0.7)"></polygon><line x1="28" y1="44" x2="26" y2="54" stroke="oklch(var(--wa))" stroke-width="2" stroke-linecap="round"></line><line x1="36" y1="44" x2="38" y2="54" stroke="oklch(var(--wa))" stroke-width="2" stroke-linecap="round"></line><path d="M23 54 L26 54 L28 56" stroke="oklch(var(--wa))" stroke-width="2" stroke-linecap="round"></path><path d="M35 56 L38 54 L41 54" stroke="oklch(var(--wa))" stroke-width="2" stroke-linecap="round"></path><rect x="30" y="48" width="8" height="6" rx="1" fill="oklch(var(--p))"></rect><line x1="32" y1="50" x2="36" y2="50" stroke="oklch(var(--pc))" stroke-width="0.5"></line><line x1="32" y1="52" x2="36" y2="52" stroke="oklch(var(--pc))" stroke-width="0.5"></line><line x1="34" y1="48" x2="36" y2="46" stroke="oklch(var(--bc) / 0.5)" stroke-width="0.5"></line></svg>`);
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    let sidebarOpen = true;
    let theme = "corporate";
    head("12qhfyh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Paigham - NATS JetStream Manager</title>`);
      });
    });
    Toast($$renderer2);
    $$renderer2.push(`<!----> `);
    if (store_get($$store_subs ??= {}, "$auth", auth).loading) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex items-center justify-center min-h-screen"><span class="loading loading-spinner loading-lg"></span></div>`);
    } else if (!store_get($$store_subs ??= {}, "$auth", auth).authenticated && store_get($$store_subs ??= {}, "$auth", auth).authEnabled) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="flex items-center justify-center min-h-screen bg-base-200"><div class="card w-96 bg-base-100 shadow-xl"><div class="card-body items-center text-center">`);
      Logo($$renderer2, { size: 80 });
      $$renderer2.push(`<!----> <h1 class="card-title text-3xl mt-4">Paigham</h1> <p class="text-base-content/70">NATS JetStream Manager</p> <div class="card-actions mt-6"><a${attr("href", getLoginUrl())} class="btn btn-primary gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path></svg> Sign in with Google</a></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="drawer lg:drawer-open"><input id="sidebar" type="checkbox" class="drawer-toggle"${attr("checked", sidebarOpen, true)}/> <div class="drawer-content flex flex-col min-h-screen"><div class="navbar bg-base-100 border-b border-base-200 sticky top-0 z-30"><div class="flex-none lg:hidden"><label for="sidebar" class="btn btn-square btn-ghost"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></label></div> <div class="flex-1"><span class="text-xl font-semibold lg:hidden">Paigham</span></div> <div class="flex-none gap-2"><label class="swap swap-rotate btn btn-ghost btn-circle"><input type="checkbox"${attr("checked", theme === "business", true)}/> <svg class="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"></path></svg> <svg class="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"></path></svg></label> `);
      if (store_get($$store_subs ??= {}, "$auth", auth).authenticated) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="dropdown dropdown-end"><div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar placeholder">`);
        if (store_get($$store_subs ??= {}, "$auth", auth).user?.picture) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="w-10 rounded-full"><img${attr("alt", store_get($$store_subs ??= {}, "$auth", auth).user.name)}${attr("src", store_get($$store_subs ??= {}, "$auth", auth).user.picture)}/></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<div class="bg-neutral text-neutral-content rounded-full w-10"><span>${escape_html(store_get($$store_subs ??= {}, "$auth", auth).user?.name?.charAt(0) || "U")}</span></div>`);
        }
        $$renderer2.push(`<!--]--></div> <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"><li class="menu-title">${escape_html(store_get($$store_subs ??= {}, "$auth", auth).user?.email || "User")}</li> `);
        if (store_get($$store_subs ??= {}, "$auth", auth).authEnabled) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<li><button>Logout</button></li>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></ul></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div> <main class="flex-1 p-4 md:p-6 bg-base-200">`);
      children($$renderer2);
      $$renderer2.push(`<!----></main></div> <div class="drawer-side z-40"><label for="sidebar" aria-label="close sidebar" class="drawer-overlay"></label> <aside class="bg-base-100 w-64 min-h-full border-r border-base-200"><div class="sticky top-0 bg-base-100 p-4 border-b border-base-200"><a href="/" class="flex items-center gap-3">`);
      Logo($$renderer2, { size: 40 });
      $$renderer2.push(`<!----> <div><h1 class="text-xl font-bold">Paigham</h1> <p class="text-xs text-base-content/60">NATS JetStream</p></div></a></div> <ul class="menu p-4 gap-1"><li><a href="/" class="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> Dashboard</a></li> <li><a href="/streams" class="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg> Streams</a></li></ul></aside></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
