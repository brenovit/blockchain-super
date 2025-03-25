<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { teleport } from './teleport';
	import { browser } from '$app/environment';

	const dispatch = createEventDispatcher();

	export let id: string;
	export let title = 'Modal Title';
	export let backdrop: 'static' | true = true;
	export let keyboard = true;

	let container: HTMLDivElement;
	let modalInstance: any;

	onMount(async () => {
		if (!browser) return;

		document.body.appendChild(container);

		// ✅ Dynamically import Bootstrap Modal ONLY on client
		const { default: Modal } = await import('bootstrap/js/dist/modal');
		modalInstance = new Modal(container, {
			backdrop: backdrop,
			keyboard: keyboard
		});

		container.addEventListener('hidden.bs.modal', () => {
			dispatch('close');
		});
	});

	onDestroy(() => {
		if (browser && modalInstance) {
			modalInstance?.dispose();
			container.remove();
		}
	});

	export function open() {
		if (browser) modalInstance?.show();
	}

	export function close() {
		if (browser) {
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
			modalInstance?.hide();
		}
	}
</script>

<div use:teleport={'teleport'}>
	<div class="modal fade" {id} tabindex="-1" aria-hidden="true" bind:this={container}>
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">{title}</h5>
					<button type="button" class="btn-close" aria-label="Close" on:click={close}></button>
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
</div>
