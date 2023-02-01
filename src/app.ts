import { make2DArray } from "./misc";
import { Vector2 } from "./Vector2";

export class App {

	private isStarted = false;

	private MapDimension = new Vector2(50, 50);
	private Map2D: number[][] = make2DArray(this.MapDimension.x, this.MapDimension.y, 0);
	private scale = Math.floor(window.innerHeight / this.MapDimension.y); // px per block

	private Mouse = {
		position: new Vector2(),
		LButton: false,
		RButton: false,
		MButton: false,
	}

	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	private renderer: Renderer;

	constructor(cv: HTMLCanvasElement) {
		this.canvas = cv;
		this.context = <CanvasRenderingContext2D>this.canvas.getContext('2d');
		this.renderer = new Renderer(this.context);
		this.renderer.setScale(this.scale);
		this.resize();
		window.addEventListener('resize', this.resize);

		window.addEventListener('mousemove', e => {
			this.Mouse.position.x = Math.floor(e.clientX / this.scale);
			this.Mouse.position.y = Math.floor(e.clientY / this.scale);
		})
		window.addEventListener('mousedown', e => {
			e.preventDefault();
			this.checkMouseState(e.button, true);
		})
		window.addEventListener('mouseup', e => this.checkMouseState(e.button, false))
		window.addEventListener('contextmenu', e => e.preventDefault())
		window.addEventListener('keypress', e => {
			if (e.key.match(' ')) {
				this.resetMap();
				this.generateMap();
			}
		})
	}

	private resetMap() {
		this.Map2D = make2DArray(this.MapDimension.x, this.MapDimension.y, 0)
	}
	private generateMap() {
		let luckyX = Math.floor(Math.random() * this.MapDimension.x);
		for (let x = 0; x < this.MapDimension.x; x++) {
			for (let y = 0; y < this.MapDimension.y; y++) {
				let xx = x + Math.random() * 10;
				let yy = y + Math.random() * 10;
				let z = Math.sin(xx) * Math.sin(2 * yy);
				z += - Math.cos(2 * xx) * Math.cos(yy);
				let da = new Vector2(x, y).dist(new Vector2(0, 0));
				let db = new Vector2(x, y).dist(this.MapDimension.sub(new Vector2(1, 1)));
				let dthreshold = 5;
				if (z >= 0.4 && da > dthreshold && db > dthreshold && y != 0 && y != this.MapDimension.y - 1 && x != luckyX) this.Map2D[x][y] = 1;
				else this.Map2D[x][y] = 0;
			}
		}
	}


	static calcScore(distCovered: number[][], current: Vector2, end: Vector2) {
		return distCovered[current.x][current.y] + current.dist(end);
	}
	private getPossibleNeighbours(current: Vector2) {
		let result: Vector2[] = [];

		for (let i = -1; i < 2; i++) {
			for (let j = -1; j < 2; j++) {
				// Skip if center;
				if (i == 0 && j == 0) continue;

				let neighbour = current.add(new Vector2(i, j));

				// Skip if neighbour is out of bound
				if (neighbour.x < 0 || neighbour.x >= this.MapDimension.x) continue;
				if (neighbour.y < 0 || neighbour.y >= this.MapDimension.y) continue;

				// Skip if neighbour is wall
				if (this.Map2D[neighbour.x][neighbour.y]) continue;

				// Skip if hit corner
				if ((i != 0 && j != 0) &&
					(this.Map2D[neighbour.x][current.y] || this.Map2D[current.x][neighbour.y])) continue;

				result.push(neighbour);
			}
		}

		return result;

	}

	private resize() {
		let cv = this.canvas;
		cv.width = window.innerWidth;
		cv.height = window.innerHeight;
		cv.style.width = cv.width.toString();
		cv.style.height = cv.height.toString();
	}

	private checkMouseState(button: number, state: boolean) {
		let map: ['LButton', 'MButton', 'RButton'] = ['LButton', 'MButton', 'RButton'];
		this.Mouse[map[button]] = state;
	}

	public init() {

		this.resetMap();

		// Setup start and destination
		let start = new Vector2(0, 0);
		let end = this.MapDimension.sub(new Vector2(1, 1));

		// Initialize A*star Path finding
		let possibleWaySet = new Set<Vector2>([start]);
		let cameFrom: Vector2[][] = make2DArray(this.MapDimension.x, this.MapDimension.y, undefined);
		let isInPossibleWaySet: boolean[][] = make2DArray(this.MapDimension.x, this.MapDimension.y, false);
		let distCovered: number[][] = make2DArray(this.MapDimension.x, this.MapDimension.y, Infinity);
		isInPossibleWaySet[start.x][start.y] = true;
		distCovered[start.x][start.y] = 0;

		const loop = () => {

			if (possibleWaySet.size <= 0) return;

			// Get best way from unchecked possible ways
			let bestWay: Vector2 = start;
			let bestScore = Infinity;
			for (let way of possibleWaySet) {
				let score = App.calcScore(distCovered, way, end);
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
			let ratio = current.dist(end) / start.dist(end);
			let deg = Math.floor(120 * ratio) + 180;
			this.context.fillStyle = `hsl(${deg},100%,40%)`;
			this.renderer.drawAt(current.x, current.y);


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
				this.renderer.drawPath(path);
				// return path;
			}

			// Scan neighbours
			let neighbours = this.getPossibleNeighbours(current);
			for (let neighbour of neighbours) {

				// Proceed if neighbour is better.
				let newNeighbourScore = currentDistCovered + current.dist(neighbour)
				if (newNeighbourScore < distCovered[neighbour.x][neighbour.y]) {

					//  Add neighbour to possible way if unchecked.
					if (!isInPossibleWaySet[neighbour.x][neighbour.y]) {
						possibleWaySet.add(neighbour);
						isInPossibleWaySet[neighbour.x][neighbour.y] = true;


						let ratio = current.dist(end) / start.dist(end);
						let deg = Math.floor(120 * ratio);
						this.context.fillStyle = `hsl(${deg},100%,50%)`;
						this.renderer.drawAt(neighbour.x, neighbour.y);
					}

					// Save score and path
					distCovered[neighbour.x][neighbour.y] = newNeighbourScore;
					cameFrom[neighbour.x][neighbour.y] = current;
				}
			}
		}

		let tps = 1000 / 60;
		var rt = setInterval(() => {


			if (this.isStarted) {
				for (let i = 0; i < tps; i++) loop();
			} else {
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.context.fillStyle = 'white';
				this.context.fillRect(0, 0, this.MapDimension.x * this.scale, this.MapDimension.y * this.scale);

				if (this.Mouse.LButton) this.Map2D[this.Mouse.position.x][this.Mouse.position.y] = 1;
				else if (this.Mouse.RButton) this.Map2D[this.Mouse.position.x][this.Mouse.position.y] = 0;
				else if (this.Mouse.MButton) this.start();

				this.renderer.draw(this.Map2D, this.MapDimension);
			}

		}, tps)
	}

	public start() { this.isStarted = true; }
}

class Renderer {
	context: CanvasRenderingContext2D;
	scale: number = 50;
	constructor(ctx: CanvasRenderingContext2D) {
		this.context = ctx;
	}

	private getVar() {
		return { ctx: this.context, scale: this.scale };
	}
	public setScale(scale: number) { this.scale = scale; }

	public drawAt(x: number, y: number) {
		let { ctx, scale } = this.getVar();
		ctx.fillRect(x * scale, y * scale, scale, scale);
	}
	public draw(Map2D: number[][], MapDimension: Vector2) {
		let { ctx, scale } = this.getVar();
		ctx.fillStyle = "black"
		for (let x = 0; x < MapDimension.x; x++) {
			for (let y = 0; y < MapDimension.y; y++) {
				if (Map2D[x][y])
					ctx.fillRect(x * scale, y * scale, scale, scale)
			}
		}
	}
	public drawPath(path: Vector2[]) {
		let { ctx, scale } = this.getVar();
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
}