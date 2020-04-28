export { ArrayMgr } from "./arraymgr";
export { NotificationCenter } from "./notification";

import { Element } from "../element";

let lastTime = 0;
var vendors = ["ms", "moz", "webkit", "o"];
for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
	window.cancelAnimationFrame =
		window[vendors[x] + "CancelAnimationFrame"] ||
		window[vendors[x] + "CancelRequestAnimationFrame"];
}

if (window.requestAnimationFrame === undefined) {
	window.requestAnimationFrame = function (callback) {
		var currTime = Date.now(),
			timeToCall = Math.max(0, 16 - (currTime - lastTime));
		var id = window.setTimeout(function () {
			callback(currTime + timeToCall);
		}, timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	};
}

if (window.cancelAnimationFrame === undefined) {
	window.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};
}

export let colorOne = "rgb(50,50,50)";
export let colorTwo = "white";
export let colorThree = "#eaeaea";

/**
 * @param {number} x
 * @param {number} y
 * @param {number} x1
 * @param {number} y1
 * @param {number} width
 * @param {number} height
 * @returns {boolean}
 */
export function isPointInRect(x, y, x1, y1, width, height) {
	return x >= x1 && x <= x1 + width && y >= y1 && y <= y1 + height;
}

/**
 * @param {number} from
 * @param {number} to
 * @param {boolean} no_floor
 */
export function random(from, to, no_floor) {
	if (Array.isArray(from)) {
		return from[Math.floor(Math.random() * from.length)];
	}
	var _from = from == null ? 0 : from,
		_to = to == null ? 0 : to;
	if (to < from) {
		_from = to;
		_to = from;
	} else if (to == from) {
		_to = _from + 10;
	}
	if (no_floor) {
		return Math.random() * (_to - _from) + _from;
	} else {
		return Math.floor(Math.random() * (_to - _from) + _from);
	}
}

/**
 *
 * @param {*} group
 * @param {Element} item
 * @return {import("../event").Point}
 */
export function searchItemInGroup(group, item) {
	var found = false;
	var pos = {
		x: 0,
		y: 0,
	};

	if (group.name === "Scrollbase") {
		pos.x += group.offsetX;
		pos.y += group.offsetY;
	}

	for (let _item of group.children.items) {
		if (_item === item) {
			found = true;
			break;
		}
	}

	if (found) {
		let b = item.getBound();
		pos.x += b.x;
		pos.y += b.y;
		return pos;
	}

	for (let _item of group.children.items) {
		if (_item.children == null) {
			continue;
		}
		let b = _item.getBound();
		pos.x += b.x;
		pos.y += b.y;
		let result = searchItemInGroup(_item, item);
		if (result != null) {
			found = true;
			pos.x += result.x;
			pos.y += result.y;
			break;
		} else {
			pos.x -= b.x;
			pos.y -= b.y;
		}
	}

	if (found) {
		return pos;
	} else {
		return null;
	}
}
