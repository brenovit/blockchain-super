<script lang="ts">

	export let isOpen = false;
	export let close = () => {};

	export let id: string;
	export let title = 'Modal Title';

</script>

{#if isOpen}

	<div class="modal fade" {id} tabindex="-1" aria-hidden="true">
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div class="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full relative">
				<div class="modal-header">
					<h5 class="modal-title">{title}</h5>
					<button type="button" class="btn-close" aria-label="Close" on:click={close}>✕</button>
				</div>

				<div class="modal-body">
					<slot name="body" />
				</div>

				<div class="modal-footer">
					<slot name="footer" />
				</div>
			</div>
		</div>
	</div>
{/if}
