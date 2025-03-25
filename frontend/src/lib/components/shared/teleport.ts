export function teleport(node: any, name: any) {
	let teleportContainer = document.getElementById(name);
	teleportContainer?.appendChild(node);

	return {
		destroy() {
			node.remove();
		}
	};
}
