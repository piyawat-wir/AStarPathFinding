import "./style.css";
import { App } from "./app";

const cv = document.createElement('canvas');
document.body.appendChild(cv);

const app = new App(cv);

app.init();


//console.log(A_star(new Vector2(0, 0), MapDimension.sub(new Vector2(1, 1))))