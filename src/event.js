import { EventEmitter2 } from "eventemitter2";

/**
 * @typedef Point
 * @property {number} x
 * @property {number} y
 */

export class Event {
	/**
	 * @param {string} name
	 * @param {number} [x]
	 * @param {number} [y]
	 */
	constructor(name, x, y) {
		this.name = name;
		this.x = x || 0;
		this.y = y || 0;
		this.wheelDeltaX = 0;
		this.wheelDeltaY = 0;
		this.keyCode = 0;
		this.keyName = 0;
		this.touches = [];
	}

	clone() {
		let ne = new Event(this.name, this.x, this.y);
		ne.wheelDeltaX = this.wheelDeltaX;
		ne.wheelDeltaY = this.wheelDeltaY;
		ne.keyCode = this.keyCode;
		ne.keyName = this.keyName;
		for (let t of this.touches) {
			ne.touches.push(t);
		}
		return ne;
	}
}

export class EventDelegate extends EventEmitter2 {
	constructor(props) {
		super(props);
		this.watchMouseDrag = false;
		this.w = props.w || 800;
		this.h = props.h || 600;
		/** @type {HTMLCanvasElement} */
		this.el = props.el;
		this.el.onmousedown = this.onMouseDown.bind(this);
		this.el.onmouseup = this.onMouseUp.bind(this);
		this.el.onmousemove = this.onMouseMove.bind(this);
		this.el.onmouseout = this.onMouseOut.bind(this);
		this.el.ontouchstart = this.onTouchStart.bind(this);
		this.el.ontouchmove = this.onTouchMove.bind(this);
		this.el.ontouchend = this.onTouchEnd.bind(this);
		this.el.onwheel = this.onMouseWheel.bind(this);

		this.ctx = this.el.getContext("2d");

		this.resize(this.w, this.h);

		this.offsetX = 0;
		this.offsetY = 0;
		this.calcOffset();
	}

	resize(w, h) {
		this.w = w;
		this.h = h;

		this.el.width = w;
		this.el.height = h;
		this.el.style.width = w + "px";
		this.el.style.height = h + "px";

		if (window.devicePixelRatio) {
			this.el.width *= window.devicePixelRatio;
			this.el.height *= window.devicePixelRatio;
			this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
		}
	}

	calcOffset() {
		let bbox = this.el.getBoundingClientRect();
		this.offsetX = bbox.left * (this.el.width / bbox.width);
		this.offsetY = bbox.top * (this.el.height / bbox.height);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns {Point}
	 */
	translatePoint(x, y) {
		return {
			x: x - this.offsetX,
			y: y - this.offsetY,
		};
	}

	/** @param {MouseEvent} e */
	onMouseDown(e) {
		this.watchMouseDrag = true;
		let p = this.translatePoint(e.clientX, e.clientY);
		this.triggerMouseDown(p);
		e.preventDefault();
	}

	onMouseUp(e) {}

	onMouseMove(e) {}

	onMouseOut(e) {}

	onTouchStart(e) {}

	onTouchMove(e) {}

	onTouchEnd(e) {}

	onMouseWheel(e) {}

	//============================

	triggerMouseDown(point) {}
}
