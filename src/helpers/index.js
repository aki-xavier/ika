export { ArrayMgr } from "./arraymgr";
export { NotificationCenter } from "./notification";

import { Element } from "../element";

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
 * @param {boolean} noFloor
 */
export function random(from, to, noFloor) {
	if (Array.isArray(from)) {
		return from[Math.floor(Math.random() * from.length)];
	}
	var f = from == null ? 0 : from,
		t = to == null ? 0 : to;
	if (to < from) {
		f = to;
		t = from;
	} else if (to == from) {
		t = f + 10;
	}
	if (noFloor) {
		return Math.random() * (t - f) + f;
	} else {
		return Math.floor(Math.random() * (t - f) + f);
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

	for (let i of group.children.items) {
		if (i === item) {
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

	for (let i of group.children.items) {
		if (i.children == null) {
			continue;
		}
		let b = i.getBound();
		pos.x += b.x;
		pos.y += b.y;
		let result = searchItemInGroup(i, item);
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
