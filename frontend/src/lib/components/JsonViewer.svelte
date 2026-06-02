<script>
	let { data = '', expanded = true } = $props();

	function formatJson(str) {
		try {
			const parsed = JSON.parse(str);
			return JSON.stringify(parsed, null, 2);
		} catch {
			return str;
		}
	}

	function syntaxHighlight(json) {
		if (typeof json !== 'string') {
			json = JSON.stringify(json, null, 2);
		}
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return json.replace(
			/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
			function (match) {
				let cls = 'json-number';
				if (/^"/.test(match)) {
					if (/:$/.test(match)) {
						cls = 'json-key';
					} else {
						cls = 'json-string';
					}
				} else if (/true|false/.test(match)) {
					cls = 'json-boolean';
				} else if (/null/.test(match)) {
					cls = 'json-null';
				}
				return '<span class="' + cls + '">' + match + '</span>';
			}
		);
	}

	let formatted = $derived(formatJson(data));
	let highlighted = $derived(syntaxHighlight(formatted));
</script>

<div class="json-viewer bg-base-200 rounded-lg p-4 overflow-auto max-h-96">
	<pre class="whitespace-pre-wrap break-words">{@html highlighted}</pre>
</div>
