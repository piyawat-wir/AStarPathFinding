import "./style.css";
import { App } from "./app";

const cv = document.createElement('canvas');
document.body.appendChild(cv);

const text = document.createElement('div');
text.innerHTML = `
<b>[LeftMouse]</b> Set wall<br>
<b>[RightMouse]</b> Remove wall<br>
<b>[MiddleMouse]</b> Start Path-Finding<br>
<b>[Space]</b> Generate Random Obstacle<br>
<b>[F5]</b> Reset<br>
`
text.id = 'detail'
document.body.appendChild(text);

const app = new App(cv);

app.init();


//console.log(A_star(new Vector2(0, 0), MapDimension.sub(new Vector2(1, 1))))