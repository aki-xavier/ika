import { Scene } from "./src";

let canvas = document.createElement("canvas");
canvas.style["width"] = "100vw";
canvas.style["height"] = "100vh";

document.getElementById("container").appendChild(canvas);

let scene = new Scene({ el: canvas });
scene.backgroundColor = "yellow";

function resize() {
	scene.resize();
	scene.render();
}

resize();

window.addEventListener("resize", () => {
	resize();
});
