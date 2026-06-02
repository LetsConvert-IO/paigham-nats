<script>
	let { open = $bindable(false), title = 'Confirm', message = 'Are you sure?', confirmText = 'Confirm', cancelText = 'Cancel', confirmClass = 'btn-error', onConfirm = () => {} } = $props();

	function handleConfirm() {
		onConfirm();
		open = false;
	}
</script>

<dialog class="modal" class:modal-open={open}>
	<div class="modal-box">
		<h3 class="text-lg font-bold">{title}</h3>
		<p class="py-4">{message}</p>
		<div class="modal-action">
			<button class="btn" onclick={() => (open = false)}>{cancelText}</button>
			<button class="btn {confirmClass}" onclick={handleConfirm}>{confirmText}</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => (open = false)}>close</button>
	</form>
</dialog>
