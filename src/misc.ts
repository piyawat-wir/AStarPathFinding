export function make2DArray(w: number, h: number, v: any) {
	let arr: any[][] = [];
	for (let x = 0; x < w; x++) {
		arr[x] = [];
		for (let y = 0; y < h; y++)
			arr[x][y] = v;
	}
	return arr;
}