import { EventEmitter2 } from "eventemitter2";

/**
 * @typedef Rect
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

export class Element extends EventEmitter2 {
	constructor(props) {
		super(props);
		this.visible = true;
		this.id = props.id || "";
		this.x = props.x || 0;
		this.y = props.y || 0;
		this.width = props.width || 0;
		this.height = props.height || 0;
	}

	updateAnimation() {}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @returns {boolean}
	 */
	render(ctx) {
		return false;
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {CanvasRenderingContext2D} ctx
	 * @returns {Element}
	 */
	hitTest(x, y, ctx) {
		return this;
	}

	/** @returns {Rect} */
	getBound() {
		return { x: this.x, y: this.y, width: this.width, height: this.height };
	}

	centralize(width, height) {
		let b = this.getBound();
		this.x = (width - b.width) / 2;
		this.y = (height - b.height) / 2;
	}

	/**
	 * @param {Element} item
	 * @returns {boolean}
	 */
	haveIntersection(item) {
		let a = this.getBound();
		let b = item.getBound();
		var a1x = a.x;
		var a2x = a.x + a.width;
		var a1y = a.y;
		var a2y = a.y + a.height;
		var b1x = b.x;
		var b2x = b.x + b.width;
		var b1y = b.y;
		var b2y = b.y + b.height;
		return a1x <= b2x && a2x >= b1x && a1y <= b2y && a2y >= b1y;
	}

	makeDraggable(disableX, disableY) {
		this.on("mousedown", (e) => {
			this._on_dragging = true;
			if (!disableX) {
				this._originalX = this.x;
				this._startDraggingX = e.x;
			}
			if (!disableY) {
				this._originalY = this.y;
				this._startDraggingY = e.y;
			}
		});

		this.on("mousedrag", (e) => {
			if (!this._on_dragging) {
				return;
			}
			if (!disableX) {
				this.x = this._originalX + e.x - this._startDraggingX;
			}
			if (!disableY) {
				this.y = this._originalY + e.y - this._startDraggingY;
			}
		});

		this.on("mousedragend", (e) => {
			this._on_dragging = false;
		});
	}
}
