import "./style.css";
import { Vector2 } from "./Vector2";
import { make2DArray } from "./misc";
import { App } from "./app";

const cv = document.createElement('canvas');
document.body.appendChild(cv);

const app = new App(cv);

app.init();


//console.log(A_star(new Vector2(0, 0), MapDimension.sub(new Vector2(1, 1))))