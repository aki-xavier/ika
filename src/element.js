import { EventEmitter2 } from "eventemitter2";
import { isPointInRect, Animation } from "./helpers";

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
		if (props.visible != null) {
			this.visible = props.visible;
		} else {
			this.visible = true;
		}
		this.id = props.id || "";
		this.x = props.x || 0;
		this.y = props.y || 0;
		this.width = props.width || 0;
		this.height = props.height || 0;

		this.styles = {
			"border-width": 0,
			"box-shadow-x": 0,
			"box-shadow-y": 0,
			"box-shadow-blur": 0,
			"box-shadow-color": "rgba(0, 0, 0, 0)",
			"border-color": "rgba(0, 0, 0, 0)",
			"background-color": "rgba(0, 0, 0, 0)",
			"border-radius": 0,
			color: "black",
			"font-size": 14,
			"font-name": "helvetica",
		};

		/** @type {Animation[]} */
		this.animations = [];
		this.cssChangeWatchers = {};
		this.attrChangeWatchers = {};
	}

	watchCSS(name, cb) {
		if (this.cssChangeWatchers[name] == null) {
			this.cssChangeWatchers[name] = [];
		}
		this.cssChangeWatchers[name].push(cb);
	}

	watchAttr(name, cb) {
		if (this.attrChangeWatchers[name] == null) {
			this.attrChangeWatchers[name] = [];
		}
		this.attrChangeWatchers[name].push(cb);
	}

	updateAnimation() {
		for (let ani of this.animations) {
			if (ani.isAnimating) {
				ani.step();
			}
		}
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @returns {boolean}
	 */
	render(ctx) {
		return false;
	}

	clip(ctx, startFromZero) {
		let bound = this.getBound();
		let x = startFromZero ? 0 : bound.x;
		let y = startFromZero ? 0 : bound.y;
		let width = bound.width;
		let height = bound.height;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + width, y);
		ctx.lineTo(x + width, y + height);
		ctx.lineTo(x, y + height);
		ctx.closePath();
		ctx.clip();
	}

	applyFillStyle(ctx, css) {
		var bc = this.css(css);
		var b = this.getBound();
		if (typeof bc === "object") {
			// Gradient
			var type = bc.type || "linear";
			var colors = bc.colors || [];
			var startX, startY, endX, endY, startR, endR;
			startX = bc.startX || b.x;
			startY = bc.startY || b.y;
			endX = bc.endX || b.x;
			endY = bc.endY || b.y + b.height;
			var gradient = ctx.createLinearGradient(startX, startY, endX, endY);
			for (var i = 0; i < colors.length; i++) {
				gradient.addColorStop(colors[i][0], colors[i][1]);
			}
			ctx.fillStyle = gradient;
		} else {
			ctx.fillStyle = bc;
		}
		ctx.shadowOffsetX = this.css("box-shadow-x");
		ctx.shadowOffsetY = this.css("box-shadow-y");
		ctx.shadowBlur = this.css("box-shadow-blur");
		ctx.shadowColor = this.css("box-shadow-color");
	}

	renderBackground(ctx, startFromZero) {
		ctx.save();
		var b = this.getBound();
		var x = startFromZero ? 0 : b.x;
		var y = startFromZero ? 0 : b.y;
		this.applyFillStyle(ctx, "background-color");
		if (this.css("border-radius")) {
			this.drawRadiusPath(ctx, x, y, b);
			ctx.fill();
		} else {
			ctx.fillRect(x, y, b.width, b.height);
		}
		ctx.restore();
	}

	drawRadiusPath(ctx, x, y, b) {
		var r = this.css("border-radius");
		if (r * 2 > b.height) {
			r = b.height / 2;
		}
		if (r * 2 > b.width) {
			r = b.width / 2;
		}
		ctx.beginPath();
		ctx.moveTo(x, y + r);
		ctx.arc(x + r, y + r, r, Math.PI, (Math.PI * 3) / 2);
		ctx.lineTo(x + b.width - r, y);
		ctx.arc(x + b.width - r, y + r, r, (Math.PI * 3) / 2, 0);
		ctx.lineTo(x + b.width, y + b.height - r);
		ctx.arc(x + b.width - r, y + b.height - r, r, 0, Math.PI / 2);
		ctx.lineTo(x + r, y + b.height);
		ctx.arc(x + r, y + b.height - r, r, Math.PI / 2, Math.PI);
		ctx.lineTo(x, y + r);
		ctx.closePath();
	}

	renderBorder(ctx, startFromZero) {
		var b = this.getBound();
		var x = startFromZero ? 0 : b.x;
		var y = startFromZero ? 0 : b.y;
		ctx.strokeStyle = this.css("border-color");
		ctx.lineWidth = this.css("border-width");
		if (this.css("border-radius")) {
			this.drawRadiusPath(ctx, x, y, b);
			ctx.stroke();
		} else {
			ctx.strokeRect(x, y, b.width, b.height);
		}
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {CanvasRenderingContext2D} ctx
	 * @returns {Element}
	 */
	hitTest(x, y, ctx) {
		let b = this.getBound();
		if (isPointInRect(x, y, b.x, b.y, b.width, b.height)) {
			return this;
		}
		return null;
	}

	/** @returns {Rect} */
	getBound() {
		return { x: this.x, y: this.y, width: this.width, height: this.height };
	}

	attr(key, val) {
		if (typeof key == "object" && val == null) {
			for (var k in key) {
				this.attr(k, key[k]);
			}
			return;
		}
		if (key == null) {
			return;
		}
		if (val == null) {
			return this[key];
		}
		this[key] = val;
		if (this.attrChangeWatchers[key] != null) {
			for (let cb of this.attrChangeWatchers[key]) {
				cb(val);
			}
		}
	}

	css(key, val) {
		if (typeof key == "object" && val == null) {
			for (var k in key) {
				this.css(k, key[k]);
			}
			return;
		}
		if (key == null) {
			return;
		}
		if (val == null) {
			return this.styles[key];
		}
		this.styles[key] = val;
		if (this.cssChangeWatchers[key] != null) {
			for (let cb of this.cssChangeWatchers[key]) {
				cb(val);
			}
		}
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
