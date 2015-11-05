var utils = require("./utils");

function Event(eventName, x, y) {
	this.eventName = eventName;
	this.x = x || 0;
	this.y = y || 0;
}

Event.prototype.clone = function() {
	var ne = new Event(this.eventName, this.x, this.y);
	var keys = ["wheelDeltaX", "wheelDeltaY", "keyCode", "keyName", "touches"];
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		if (this[key]) {
			ne[key] = this[key];
		}
	}
	return ne;
};

function EventDelegate(scene) {
	this.scene = scene;
	this.watchMouseDrag = false;
};

EventDelegate.prototype.init = function() {
	var el = this.scene.el;
	if (!el.addEventListener) {
		el = document;
	}
	el.addEventListener("mousedown", utils.delegate(this, "onmousedown"));
	el.addEventListener("mouseup", utils.delegate(this, "onmouseup"));
	el.addEventListener("mousemove", utils.delegate(this, "onmousemove"));
	el.addEventListener("touchstart", utils.delegate(this, "ontouchstart"));
	el.addEventListener("touchmove", utils.delegate(this, "ontouchmove"));
	el.addEventListener("touchend", utils.delegate(this, "ontouchend"));
	el.addEventListener("mouseout", utils.delegate(this, "onmouseout"));
	el.addEventListener("mousewheel", utils.delegate(this, "onmousewheel"));
	//mousewheel for firefox
	el.addEventListener("DOMMouseScroll", utils.delegate(this, "onmousewheel"));
	return this;
};

EventDelegate.prototype.translatePoint = function(x, y) {
	if (this.offsetX == null) {
		var el = this.scene.el;
		if (el.getBoundingClientRect) {
			var bbox = el.getBoundingClientRect();
			this.offsetX = bbox.left * (el.width / bbox.width);
			this.offsetY = bbox.top * (el.height / bbox.height);
		} else {
			this.offsetX = this.offsetY = 0;
		}
	}
	x -= this.offsetX;
	y -= this.offsetY;
	return {x: x, y: y};
};

EventDelegate.prototype.onmousedown = function(e) {
	this.watchMouseDrag = true;
	var p = this.translatePoint(e.clientX, e.clientY);
	var event = new Event("mousedown", p.x, p.y);
	this.scene._trigger_mousedown(event);
	if (e.preventDefault) {
		e.preventDefault();
	}
};

EventDelegate.prototype.onmouseup = function(e) {
	this.watchMouseDrag = false;
	var p = this.translatePoint(e.clientX, e.clientY);
	var event = new Event("mouseup", p.x, p.y);
	this.scene._trigger_mouseup(event);
	if (e.preventDefault) {
		e.preventDefault();
	}
};

// Redirect mouseout event to mouseup event
EventDelegate.prototype.onmouseout = function(e) {
	if (this.watchMouseDrag) {
		this.onmouseup(e);
	}
};

EventDelegate.prototype.onmousemove = function(e) {
	if (this.watchMouseDrag) {
		var p = this.translatePoint(e.clientX, e.clientY);
		var event = new Event("mousemove", p.x, p.y);
		this.scene._trigger_mousemove(event);
	}
	if (e.preventDefault) {
		e.preventDefault();
	}
};

EventDelegate.prototype.ontouchstart = function(e) {
	if (e.touches.length === 1) {
		this.onmousedown({
			clientX: e.touches[0].pageX,
			clientY: e.touches[0].pageY
		});
	}
	var event = new Event("touchstart");
	var touches = [];
	for (var i = 0; i < e.touches.length; i++) {
		var touch = this.translatePoint(e.touches[i].pageX, e.touches[i].pageY);
		touches.push(touch);
	}
	event.touches = touches;
	this.scene.emit("touchstart", event);
	if (e.preventDefault) {
		e.preventDefault();
	}
};

EventDelegate.prototype.ontouchmove = function(e) {
	if (e.touches.length === 1) {
		this.onmousemove({
			clientX: e.touches[0].pageX,
			clientY: e.touches[0].pageY
		});
	}
	var event = new Event("touchmove");
	var touches = [];
	for (var i = 0; i < e.touches.length; i++) {
		var touch = this.translatePoint(e.touches[i].pageX, e.touches[i].pageY);
		touches.push(touch);
	}
	event.touches = touches;
	this.scene.emit("touchmove", event);
	if (e.preventDefault) {
		e.preventDefault();
	}
};

EventDelegate.prototype.ontouchend = function(e) {
	if (e.changedTouches.length === 1) {
		this.onmouseup({
			clientX: e.changedTouches[0].pageX,
			clientY: e.changedTouches[0].pageY
		});
	}
	var event = new Event("touchend");
	var touches = [];
	for (var i = 0; i < e.touches.length; i++) {
		var touch = this.translatePoint(e.touches[i].pageX, e.touches[i].pageY);
		touches.push(touch);
	}
	event.touches = touches;
	this.scene.emit("touchend", event);
	if (e.preventDefault) {
		e.preventDefault();
	}
};

EventDelegate.prototype.onmousewheel = function(e) {
	var p = this.translatePoint(e.clientX, e.clientY);
	var event = new Event("mousewheel", p.x, p.y);
	if (e.wheelDeltaY) {
		event.wheelDeltaY = e.wheelDeltaY || 0;
		event.wheelDeltaX = e.wheelDeltaX || 0;
	} else if (e.wheelDelta) {
		event.wheelDeltaY = e.wheelDelta;
		event.wheelDeltaX = 0;
	} else {
		event.wheelDeltaY = - 120 * e.detail / 3;
		event.wheelDeltaX = 0;
	}
	this.scene._trigger_mousewheel(event);
	if (e.preventDefault) {
		e.preventDefault();
	}
	NotificationReceiver.emit("render");
};

module.exports.EventDelegate = EventDelegate;
module.exports.Event = Event;