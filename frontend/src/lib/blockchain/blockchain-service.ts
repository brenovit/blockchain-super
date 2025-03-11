import type { Blockchain } from './model/blockchain';

const getBlockchain = async (): Promise<Blockchain> => {
	const res = await fetch('http://localhost:3001/blockchain');
	return await res.json();
};

const createBlock = async (data: any) => {
	if (!data) return;
	await fetch('http://localhost:3001/create-block', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ data })
	});
};

const mineBlock = async (index: number) => {
	await fetch('http://localhost:3001/mine-block/' + index, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' }
	});
};

const updateBlock = async (data: any) => {
	await fetch('http://localhost:3001/update-block/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },

		body: JSON.stringify({ data })
	});
};

export { getBlockchain, createBlock, mineBlock, updateBlock };
