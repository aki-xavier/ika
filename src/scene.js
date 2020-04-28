import { Event, EventDelegate } from "./event";
import { ArrayMgr, NotificationCenter, searchItemInGroup } from "./helpers";
import { Element } from "./element";

export class Scene extends EventDelegate {
	constructor(props) {
		super(props);
		this.backgroundColor = "white";
		/** @type {import("./event").Point} */
		this.downPoint = null;
		this.enableFinger = false;
		this.children = new ArrayMgr();
		/** @type {Element} */
		this.mouseTarget = null;
		this.isDragging = false;
	}

	add(item) {
		this.children.add(item);
	}

	addToBottom(item) {
		this.add(item);
		this.children.move(item, 0);
	}

	rm(item) {
		this.children.rm(item);
	}

	moveToFront(item) {
		this.children.move(item, this.children.items.length - 1);
	}

	render() {
		this.clear();
		let rerender = false;
		for (let i = 0; i < this.children.items.length; i++) {
			/** @type {Element} */
			let item = this.children.items[i];
			item.updateAnimation();
			if (!item.visible) {
				continue;
			}
			if (item.render(this.ctx)) {
				rerender = true;
			}
		}
		if (rerender) {
			this.render();
		}
	}

	clear() {
		this.ctx.clearRect(0, 0, this.w, this.h);
		this.ctx.save();
		this.ctx.fillStyle = this.backgroundColor;
		this.ctx.fillRect(0, 0, this.w, this.h);
		this.ctx.restore();
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns {Element}
	 */
	hitTest(x, y) {
		for (let i = this.children.items.length - 1; i >= 0; i--) {
			/** @type {Element} */
			let item = this.children.items[i];
			if (!item.visible) {
				continue;
			}
			let ret = item.hitTest(x, y, this.ctx);
			if (ret != null) {
				return ret;
			}
		}
	}

	/** @param {Event} e */
	triggerMouseDown(e) {
		super.triggerMouseDown(e);
		NotificationCenter.emit("start-render");
		this.emit("mousedown", e);
		this.downPoint = { x: e.x, y: e.y };
		this.mouseTarget = this.hitTest(e.x, e.y);
		if (this.mouseTarget != null) {
			this.mouseTarget.emit("mousedown", e, this.ctx);
		}
	}

	/** @param {Event} e */
	triggerMouseUp(e) {
		super.triggerMouseUp(e);
		this.emit("mouseup", e);
		if (this.downPoint == null) {
			return;
		}
		let item = this.hitTest(e.x, e.y);
		if (item != null) {
			item.emit("mouseup", e, this.ctx);
		}
		if (this.mouseTarget != null && this.isDragging) {
			let event = new Event("mousedragend", e.x, e.y);
			this.mouseTarget.emit("mousedragend", event, this.ctx);
			this.mouseTarget = null;
		}

		let x1 = this.downPoint.x;
		let y1 = this.downPoint.y;
		let x2 = e.x;
		let y2 = e.y;
		if (Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) <= 10) {
			let event = new Event("click", e.x, e.y);
			if (item != null) {
				item.emit("click", event, this.ctx);
			}
		}
		this.isDragging = false;
		this.downPoint = null;
		this.render();
	}

	/** @param {Event} e */
	triggerMouseMove(e) {
		this.emit("mousemove", e);
		if (this.downPoint != null) {
			this.isDragging = true;
		}
		let item = this.hitTest(e.x, e.y);
		if (item != null) {
			item.emit("mousemove", e, this.ctx);
		}
		if (this.mouseTarget != null) {
			var event_drag = new Event("mousedrag", e.x, e.y);
			this.mouseTarget.emit("mousedrag", event_drag, this.ctx);
		}
	}

	/** @param {Event} e */
	triggerMouseWheel(e) {
		this.emit("mousewheel", e);
		let item = this.hitTest(e.x, e.y);
		if (item != null) {
			item.emit("mousewheel", e, this.ctx);
		}
	}

	/**
	 * @param {Element} item
	 * @returns {import("./event").Point}
	 */
	getChildPosition(item) {
		return searchItemInGroup(this, item);
	}
}
