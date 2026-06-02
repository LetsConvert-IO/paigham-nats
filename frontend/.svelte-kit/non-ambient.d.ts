
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/consumers" | "/consumers/[stream]" | "/consumers/[stream]/[name]" | "/streams" | "/streams/[name]" | "/streams/[name]/messages";
		RouteParams(): {
			"/consumers/[stream]": { stream: string };
			"/consumers/[stream]/[name]": { stream: string; name: string };
			"/streams/[name]": { name: string };
			"/streams/[name]/messages": { name: string }
		};
		LayoutParams(): {
			"/": { stream?: string | undefined; name?: string | undefined };
			"/consumers": { stream?: string | undefined; name?: string | undefined };
			"/consumers/[stream]": { stream: string; name?: string | undefined };
			"/consumers/[stream]/[name]": { stream: string; name: string };
			"/streams": { name?: string | undefined };
			"/streams/[name]": { name: string };
			"/streams/[name]/messages": { name: string }
		};
		Pathname(): "/" | `/consumers/${string}/${string}` & {} | "/streams" | `/streams/${string}` & {} | `/streams/${string}/messages` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.svg" | string & {};
	}
}