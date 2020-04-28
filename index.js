import { Scene } from "./src";

let canvas = document.createElement("canvas");

document.body.appendChild(canvas);

let scene = new Scene({ el: canvas });
