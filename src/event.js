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
	}

	clone() {
		let ne = new Event(this.name, this.x, this.y);
		ne.wheelDeltaX = this.wheelDeltaX;
		ne.wheelDeltaY = this.wheelDeltaY;
		ne.keyCode = this.keyCode;
		ne.keyName = this.keyName;
		return ne;
	}
}

export class EventDelegate extends EventEmitter2 {
	constructor(props) {
		super(props);
		this.watchMouseDrag = false;
		/** @type {HTMLCanvasElement} */
		this.el = props.el;
		this.el.addEventListener("mousedown", this.onMouseDown.bind(this), {
			passive: true,
		});
		this.el.addEventListener("mouseup", this.onMouseUp.bind(this), {
			passive: true,
		});
		this.el.addEventListener("mousemove", this.onMouseMove.bind(this), {
			passive: true,
		});
		this.el.addEventListener("mouseout", this.onMouseOut.bind(this), {
			passive: true,
		});
		this.el.addEventListener("wheel", this.onMouseWheel.bind(this), {
			passive: true,
		});

		this.ctx = this.el.getContext("2d");
		this.ctx.imageSmoothingEnabled = false;

		this.resize();

		this.offsetX = 0;
		this.offsetY = 0;
		this.calcOffset();
	}

	resize() {
		let rect = this.el.getBoundingClientRect();
		this.w = rect.width;
		this.h = rect.height;

		if (window.devicePixelRatio !== 1) {
			this.el.setAttribute(
				"width",
				(this.w * window.devicePixelRatio).toString()
			);
			this.el.setAttribute(
				"height",
				(this.h * window.devicePixelRatio).toString()
			);
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
	}

	/** @param {MouseEvent} e */
	onMouseUp(e) {
		this.watchMouseDrag = false;
		let p = this.translatePoint(e.clientX, e.clientY);
		let event = new Event("mouseup", p.x, p.y);
		this.triggerMouseUp(event);
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
