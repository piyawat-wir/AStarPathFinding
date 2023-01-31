
const cv = document.getElementsByTagName('canvas')[0];
const ctx = cv.getContext('2d');

class Vector2 {
	x; y;
	constructor(x = 0, y = 0) {
		this.x = x; this.y = y;
	}
	add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
	sub(v) { return new Vector2(this.x - v.x, this.y - v.y); }
	dist(v) { return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2); }
}

class Node {
	position;
	path = [];
	constructor(x, y) {
		this.position = new Vector2(x, y);
	}
	connect(node, dist) {
		this.path.push(new Edge(this, node, dist));
	}
}

class Edge {
	source;
	target;
	weight;
	constructor(src, tar, weight) {
		this.source = src;
		this.target = tar;
		this.weight = weight;
	}
}

function A_star(start, end, nodeList) {
	let walker = start;

	// f(a) = g(a) + h(a)
	// g(a) = covered distance
	// h(a) = displacement between source and target
}

const Map2D = [];
const MapDimension = new Vector2(30,30);

for (let x = 0; x < MapDimension.x; x++) {
	Map2D[x] = [];
	for (let y = 0; y < MapDimension.y; y++) {
		Map2D[x][y] = 0;
	}
}

const scale = 20; // px per block

function draw() {
	for (let x = 0; x < MapDimension.x; x++) {
		for (let y = 0; y < MapDimension.y; y++) {
			if (Map2D[x][y]) {
				ctx.fillStyle = "black" //Wall
			} else {
				ctx.fillStyle = "white" //Space
			}
			ctx.fillRect(x * scale, y * scale, scale, scale)
		}
	}
}

function resize() {
	cv.width = window.innerWidth;
	cv.height = window.innerHeight;
	cv.style.width = cv.width;
	cv.style.height = cv.height;
}

resize();
window.addEventListener('resize', resize);

const Mouse = {
	position: new Vector2(),
	LButton: false,
	RButton: false,
	MButton: false,
}

function checkMouseState(button, state) {
	let map = ['LButton', 'MButton', 'RButton'];
	Mouse[map[button]] = state;
}
window.addEventListener('mousemove', e => {
	Mouse.position.x = parseInt(e.clientX / scale);
	Mouse.position.y = parseInt(e.clientY / scale);
})
window.addEventListener('mousedown', e => {
	e.preventDefault();
	checkMouseState(e.button, true);
})
window.addEventListener('mouseup', e => checkMouseState(e.button, false))
window.addEventListener('contextmenu', e => e.preventDefault())

var rt = setInterval(() => {
	ctx.clearRect(0,0, cv.width, cv.height);
	if (Mouse.LButton) Map2D[Mouse.position.x][Mouse.position.y] = 1;
	if (Mouse.RButton) Map2D[Mouse.position.x][Mouse.position.y] = 0;
	draw();
	ctx.fillStyle = 'black';
	ctx.strokeStyle = 'white';
	ctx.font = "50px Tahoma";
	ctx.strokeText(`(${Mouse.position.x}, ${Mouse.position.y})`, 0, 50);
	ctx.fillText(`(${Mouse.position.x}, ${Mouse.position.y})`, 0, 50);
}, 1000 / 60)