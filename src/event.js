import { EventEmitter2 } from "eventemitter2";
import { NotificationCenter } from "./helpers";

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
		/** @type {Point[]} */
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
		this.ctx.imageSmoothingEnabled = false;

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
		let event = new Event("mousedown", p.x, p.y);
		this.triggerMouseDown(event);
		e.preventDefault();
	}

	/** @param {MouseEvent} e */
	onMouseUp(e) {
		this.watchMouseDrag = false;
		let p = this.translatePoint(e.clientX, e.clientY);
		let event = new Event("mouseup", p.x, p.y);
		this.triggerMouseUp(event);
		e.preventDefault();
	}

	/** @param {MouseEvent} e */
	onMouseOut(e) {
		if (this.watchMouseDrag) {
			this.onMouseUp(e);
		}
	}

	/** @param {MouseEvent} e */
	onMouseMove(e) {
		if (this.watchMouseDrag) {
			let p = this.translatePoint(e.clientX, e.clientY);
			let event = new Event("mousemove", p.x, p.y);
			this.triggerMouseMove(event);
		}
		e.preventDefault();
	}

	/** @param {TouchEvent} e */
	onTouchStart(e) {
		if (e.touches.length === 1) {
			let event = new MouseEvent("mousedown", {
				bubbles: true,
				cancelable: true,
				view: window,
				clientX: e.touches[0].pageX,
				clientY: e.touches[0].pageY,
			});
			this.onMouseDown(event);
		}

		let event = new Event("touchstart");
		let touches = [];
		for (let t of e.touches) {
			let touch = this.translatePoint(t.pageX, t.pageY);
			touches.push(touch);
		}
		event.touches = touches;
		this.emit("touchstart", event);
		e.preventDefault();
	}

	/** @param {TouchEvent} e */
	onTouchMove(e) {
		if (e.touches.length === 1) {
			let event = new MouseEvent("mousemove", {
				bubbles: true,
				cancelable: true,
				view: window,
				clientX: e.touches[0].pageX,
				clientY: e.touches[0].pageY,
			});
			this.onMouseMove(event);
		}

		let event = new Event("touchmove");
		let touches = [];
		for (let t of e.touches) {
			let touch = this.translatePoint(t.pageX, t.pageY);
			touches.push(touch);
		}
		event.touches = touches;
		this.emit("touchmove", event);
		e.preventDefault();
	}

	/** @param {TouchEvent} e */
	onTouchEnd(e) {
		if (e.touches.length === 1) {
			let event = new MouseEvent("mouseup", {
				bubbles: true,
				cancelable: true,
				view: window,
				clientX: e.touches[0].pageX,
				clientY: e.touches[0].pageY,
			});
			this.onMouseUp(event);
		}

		let event = new Event("touchend");
		let touches = [];
		for (let t of e.touches) {
			let touch = this.translatePoint(t.pageX, t.pageY);
			touches.push(touch);
		}
		event.touches = touches;
		this.emit("touchend", event);
		e.preventDefault();
	}

	/** @param {WheelEvent} e */
	onMouseWheel(e) {
		let p = this.translatePoint(e.clientY, e.clientY);
		let event = new Event("mousewheel", p.x, p.y);
		// @ts-ignore
		if (e.wheelDeltaY) {
			// @ts-ignore
			event.wheelDeltaY = e.wheelDeltaY || 0;
			// @ts-ignore
			event.wheelDeltaX = e.wheelDeltaX || 0;
			// @ts-ignore
		} else if (e.wheelDelta) {
			// @ts-ignore
			event.wheelDeltaY = e.wheelDelta;
			event.wheelDeltaX = 0;
		} else {
			event.wheelDeltaY = (-120 * e.detail) / 3;
			event.wheelDeltaX = 0;
		}
		this.triggerMouseWheel(event);
		e.preventDefault();

		NotificationCenter.emit("render");
	}

	//============================

	/** @param {Event} e */
	triggerMouseDown(e) {}
	/** @param {Event} e */
	triggerMouseUp(e) {}
	/** @param {Event} e */
	triggerMouseMove(e) {}
	/** @param {Event} e */
	triggerMouseWheel(e) {}
}
