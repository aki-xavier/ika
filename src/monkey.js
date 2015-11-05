var Event = require("./event").Event;
var Emitter = require("emitter");

function Monkey(scene) {
	Emitter.call(this);
	this.scene = scene;
	this.actions = [];
	this.interval = 2000;
}

Monkey.prototype = new Emitter();

Monkey.prototype.down = function(x, y, t) {
	this.actions.push({
		name: "mousedown",
		event: new Event("mousedown", x, y),
		time: t || this.interval
	});
};

Monkey.prototype.up = function(x, y, t) {
	this.actions.push({
		name: "mouseup",
		event: new Event("mouseup", x, y),
		time: t || this.interval
	});
};

Monkey.prototype.wheel = function(x, y, dx, dy, t) {
	var e = new Event("mousewheel", x, y);
	e.wheelDeltaX = dx;
	e.wheelDeltaY = dy;
	this.actions.push({
		name: "mousewheel",
		event: e,
		time: t || this.interval
	});
};

Monkey.prototype.swipe = function(x1, y1, x2, y2, t, delay) {
	t = t || this.interval;
	var delta = 15;
	this.down(x1, y1, delay || 300);
	for (var i = 1; i <= t / delta; i++) {
		var x = x1 + i * (x2 - x1) / (t / delta);
		var y = y1 + i * (y2 - y1) / (t / delta);
		var e = new Event("mousemove", x, y);
		this.actions.push({
			name: "mousemove",
			event: e,
			time: delta
		});
	}
	this.up(x2, y2, 300);
};

Monkey.prototype.click = function(obj, delay) {
	var pos = this.scene.getChildPosition(obj);
	var b = obj.getBound();
	this.down(pos.x + b.width / 2, pos.y + b.height / 2, delay);
	this.up(pos.x + b.width / 2, pos.y + b.height / 2, 300);
};

Monkey.prototype.input = function(value, t) {
	this.actions.push({
		name: "input",
		value: value,
		time: t || this.interval
	});
};

Monkey.prototype._step = function(index) {
	var data = this.actions[index];
	if (!data) {
		this.stop();
		this.emit("stop");
		return;
	}
	var self = this;
	setTimeout(function() {
		if (data.name === "input") {
			if (NotificationReceiver.input) {
				NotificationReceiver.input.value = data.value;
			}
		} else {
			self.scene["_trigger_" + data.name](data.event);
		}
		self._step(index + 1);
	}, data.time);
};

Monkey.prototype.run = function() {
	if (this.isReplaying) {
		this.emit("stop");
		return;
	}
	if (this.actions.length === 0) {
		this.emit("stop");
		return;
	}
	this._step(0);
	this.isReplaying = true;
};

Monkey.prototype.stop = function() {
	this.isReplaying = false;
};

module.exports = Monkey;
