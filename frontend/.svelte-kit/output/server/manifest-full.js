export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.BKVnliKO.js",app:"_app/immutable/entry/app.DUOyTCVQ.js",imports:["_app/immutable/entry/start.BKVnliKO.js","_app/immutable/chunks/BoNuTP23.js","_app/immutable/chunks/DO3A__Qy.js","_app/immutable/chunks/C7Bjw99l.js","_app/immutable/entry/app.DUOyTCVQ.js","_app/immutable/chunks/DO3A__Qy.js","_app/immutable/chunks/BIdo5cAH.js","_app/immutable/chunks/mDAQS6EC.js","_app/immutable/chunks/CiAtqx9n.js","_app/immutable/chunks/C7Bjw99l.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/consumers/[stream]/[name]",
				pattern: /^\/consumers\/([^/]+?)\/([^/]+?)\/?$/,
				params: [{"name":"stream","optional":false,"rest":false,"chained":false},{"name":"name","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/streams",
				pattern: /^\/streams\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/streams/[name]",
				pattern: /^\/streams\/([^/]+?)\/?$/,
				params: [{"name":"name","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/streams/[name]/messages",
				pattern: /^\/streams\/([^/]+?)\/messages\/?$/,
				params: [{"name":"name","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
