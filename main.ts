const cv = document.getElementsByTagName('canvas')[0];
const ctx = cv.getContext('2d');

class Vector2 {
	x: number;
	y: number;
	constructor(x = 0, y = 0) {
		this.x = x; this.y = y;
	}
	clone() { return new Vector2(this.x, this.y); }
	add(v: Vector2) { return new Vector2(this.x + v.x, this.y + v.y); }
	sub(v: Vector2) { return new Vector2(this.x - v.x, this.y - v.y); }
	dist(v: Vector2) { return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2); }
	equals(v: Vector2) { return this.x == v.x && this.y == v.y; }

	toString() { return `(${this.x}, ${this.y})` }
}

function make2DArray(w: number, h: number, v: any) {
	let arr: any[][] = [];
	for (let x = 0; x < w; x++) {
		arr[x] = [];
		for (let y = 0; y < h; y++)
			arr[x][y] = v;
	}
	return arr;
}

function calcScore(distCovered: number[][], current: Vector2, end: Vector2) {
	return distCovered[current.x][current.y] + current.dist(end);
}

function getPossibleNeighbours(current: Vector2) {
	let result: Vector2[] = [];

	for (let i = -1; i < 2; i++) {
		for (let j = -1; j < 2; j++) {
			// Skip if center;
			if (i == 0 && j == 0) continue;

			let neighbour = current.add(new Vector2(i, j));

			// Skip if neighbour is out of bound
			if (neighbour.x < 0 || neighbour.x >= MapDimension.x) continue;
			if (neighbour.y < 0 || neighbour.y >= MapDimension.y) continue;

			// Skip if neighbour is wall
			if (Map2D[neighbour.x][neighbour.y]) continue;

			// Skip if hit corner
			if ((i != 0 && j != 0) &&
				(Map2D[neighbour.x][current.y] || Map2D[current.x][neighbour.y])) continue;

			result.push(neighbour);
		}
	}

	return result;

}

function A_star(start: Vector2, end: Vector2) {
	let possibleWay = new Set<Vector2>([start]);
	let cameFrom: Vector2[][] = make2DArray(MapDimension.x, MapDimension.y, undefined);
	let checkedWay: boolean[][] = make2DArray(MapDimension.x, MapDimension.y, false);
	let distCovered: number[][] = make2DArray(MapDimension.x, MapDimension.y, Infinity);
	distCovered[start.x][start.y] = 0;

	while (possibleWay.size > 0) {

		// Get best way from unchecked possible ways
		let bestWay: Vector2 = start;
		let bestScore = Infinity;
		for (let way of possibleWay) {
			let score = calcScore(distCovered, way, end);
			if (score < bestScore) {
				bestWay = way;
				bestScore = score;
			}
		}
		let current = bestWay;
		let currentScore = bestScore;

		// Destination reached
		if (current.equals(end)) {
			let path = [current];
			let from = cameFrom[current.x][current.y];
			while (from) {
				path.push(from);
				from = cameFrom[current.x][current.y];
			}
			return path;
		}

		// Check the best way
		possibleWay.delete(current);
		checkedWay[current.x][current.y] = true;

		// Scan neighbours
		let neighbours = getPossibleNeighbours(current);
		for (let neighbour of neighbours) {

			// Proceed if neighbour is better.
			let neighbourScore = currentScore + current.dist(neighbour)
			if (neighbourScore > currentScore) {

				//  Add neighbour to possible way if unchecked.
				if (!checkedWay[current.x][current.y]) possibleWay.add(neighbour)

				// Save score and path
				distCovered[neighbour.x][neighbour.y] = neighbourScore;
				cameFrom[neighbour.x][neighbour.y] = current;
			}
		}
	}

	// f(a) = g(a) + h(a)
	// g(a) = covered distance
	// h(a) = displacement between source and target

	return [];
}

const Map2D: number[][] = [];
const MapDimension = new Vector2(50, 50);
generateMap();

function generateMap() {
	let luckyX = Math.floor(Math.random() * MapDimension.x);
	console.log(luckyX)
	for (let x = 0; x < MapDimension.x; x++) {
		Map2D[x] = [];
		for (let y = 0; y < MapDimension.y; y++) {
			let xx = x + Math.random() * 10;
			let yy = y + Math.random() * 10;
			let z = Math.sin(xx) * Math.sin(2 * yy);
			z += - Math.cos(2 * xx) * Math.cos(yy);
			let da = new Vector2(x, y).dist(new Vector2(0, 0));
			let db = new Vector2(x, y).dist(MapDimension.sub(new Vector2(1, 1)));
			let dthreshold = 5;
			if (z >= 0.4 && da > dthreshold && db > dthreshold && y != 0 && y != MapDimension.y - 1 && x != luckyX) Map2D[x][y] = 1;
			else Map2D[x][y] = 0;
		}
	}
}

const scale = Math.floor(window.innerHeight / MapDimension.y); // px per block

function drawAt(x: number, y: number) {
	if (ctx != null) ctx.fillRect(x * scale, y * scale, scale, scale)
}

function draw() {
	if (ctx == null) return;
	ctx.fillStyle = "black"
	for (let x = 0; x < MapDimension.x; x++) {
		for (let y = 0; y < MapDimension.y; y++) {
			if (Map2D[x][y])
				ctx.fillRect(x * scale, y * scale, scale, scale)
		}
	}
}

function drawPath(path: Vector2[]) {
	if (ctx == null) return;
	ctx.beginPath();
	let c = scale / 2;
	ctx.moveTo(path[0].x * scale + c, path[0].y * scale + c);
	for (let v of path) {
		ctx.lineTo(v.x * scale + c, v.y * scale + c);
	}
	ctx.lineWidth = 5;
	ctx.strokeStyle = "cyan";
	ctx.stroke();
}

function resize() {
	cv.width = window.innerWidth;
	cv.height = window.innerHeight;
	cv.style.width = cv.width.toString();
	cv.style.height = cv.height.toString();
}

resize();
window.addEventListener('resize', resize);

const Mouse = {
	position: new Vector2(),
	LButton: false,
	RButton: false,
	MButton: false,
}

function checkMouseState(button: number, state: boolean) {
	let map: ['LButton', 'MButton', 'RButton'] = ['LButton', 'MButton', 'RButton'];
	Mouse[map[button]] = state;
}
window.addEventListener('mousemove', e => {
	Mouse.position.x = Math.floor(e.clientX / scale);
	Mouse.position.y = Math.floor(e.clientY / scale);
})
window.addEventListener('mousedown', e => {
	e.preventDefault();
	checkMouseState(e.button, true);
})
window.addEventListener('mouseup', e => checkMouseState(e.button, false))
window.addEventListener('contextmenu', e => e.preventDefault())

function init() {
	if (ctx == null) return;
	ctx.clearRect(0, 0, cv.width, cv.height);
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, MapDimension.x * scale, MapDimension.y * scale);
	draw();

	let start = new Vector2(0, 0);
	let end = MapDimension.sub(new Vector2(1, 1));

	let possibleWaySet = new Set<Vector2>([start]);
	let cameFrom: Vector2[][] = make2DArray(MapDimension.x, MapDimension.y, undefined);
	let isInPossibleWaySet: boolean[][] = make2DArray(MapDimension.x, MapDimension.y, false);
	let distCovered: number[][] = make2DArray(MapDimension.x, MapDimension.y, Infinity);

	isInPossibleWaySet[start.x][start.y] = true;
	distCovered[start.x][start.y] = 0;

	const loop = () => {

		if (possibleWaySet.size <= 0) return;

		// Get best way from unchecked possible ways
		let bestWay: Vector2 = start;
		let bestScore = Infinity;
		for (let way of possibleWaySet) {
			let score = calcScore(distCovered, way, end);
			if (score < bestScore) {
				bestWay = way;
				bestScore = score;
			}
		}
		let current = bestWay;
		let currentDistCovered = distCovered[current.x][current.y];


		// Check the best way
		possibleWaySet.delete(current);
		isInPossibleWaySet[current.x][current.y] = false;
		ctx.fillStyle = 'gray';
		drawAt(current.x, current.y);


		// Destination reached
		if (current.equals(end)) {

			console.log('reached')

			let path = [current];
			while (true) {
				if (!cameFrom[current.x]) break;
				if (!cameFrom[current.x][current.y]) break;
				current = cameFrom[current.x][current.y];
				path.push(current);
			}
			clearInterval(rt);
			drawPath(path);
			return path;
		}

		// Scan neighbours
		let neighbours = getPossibleNeighbours(current);
		for (let neighbour of neighbours) {

			// Proceed if neighbour is better.
			let newNeighbourScore = currentDistCovered + current.dist(neighbour)
			if (newNeighbourScore < distCovered[neighbour.x][neighbour.y]) {

				//  Add neighbour to possible way if unchecked.
				if (!isInPossibleWaySet[neighbour.x][neighbour.y]) {
					possibleWaySet.add(neighbour);
					isInPossibleWaySet[neighbour.x][neighbour.y] = true;


					let ratio = current.dist(end) / start.dist(end);
					let red = Math.floor(255 * ratio);
					let green = 255 - red;
					ctx.fillStyle = `rgb(${red},${green},0)`;
					drawAt(neighbour.x, neighbour.y);
				}

				// Save score and path
				distCovered[neighbour.x][neighbour.y] = newNeighbourScore;
				cameFrom[neighbour.x][neighbour.y] = current;
			}
		}
	}

	var rt = setInterval(() => {
		for (let i = 0; i < 1; i++) loop();
	}, 10)
}

init();


//console.log(A_star(new Vector2(0, 0), MapDimension.sub(new Vector2(1, 1))))