var Emitter = require("emitter");
var EventDelegate = require("./event").EventDelegate;
var Event = require("./event").Event;
var utils = require("./utils");
var ArrayMgr = require("arraymgr");
var Query = require("./query");
var Popover = require("./groups/popover");
var Circle = require("./elements/circle");
var Group = require("./group");

function Scene(w, h, el) {
	Emitter.call(this);
	if (w == null || h == null || el == null) {
		console.log("missing arguments");
		return;
	}
	var ctx = el.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	this.el = el;
	this.ctx = ctx;
	
	this.resize(w, h);
	// ctx.translate(0.5, 0.5);
	
	this.backgroundColor = "white";
	this._downPoint = null;
	this.enableFinger = false;
}

Scene.prototype = new Emitter();

Scene.prototype.resize = function(w, h) {
	this.width = w;
	this.height = h;
	
	var el = this.el;
	var ctx = this.ctx;
	
	el.width = w;
	el.height = h;
	el.style.width = w + "px";
	el.style.height = h + "px";
	
	// Retina ready!
	if (window.devicePixelRatio) {
		el.width *= window.devicePixelRatio;
		el.height *= window.devicePixelRatio;
		ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
	}
};

Scene.prototype.init = function() {
	// Child elements to be rendered
	this.children = new ArrayMgr();
	this._ed = new EventDelegate(this).init();
	this._popover = new Popover().init()
	.attr("visible", false);
	this._popover.on("should-hide", utils.delegate(this, "hidePopover"));
	this.children.add(this._popover);
	this._createFinger();
	return this;
};

Scene.prototype._createFinger = function() {
	var finger = new Group().init()
	.attr("visible", false)
	var circle1 = new Circle().init()
	.attr({
		"radius": 20
	})
	.css({
		"background-color": "rgba(255,255,255,0.5)",
		"box-shadow-color": "rgba(0,0,0,0.5)",
		"box-shadow-blur": 3
	});
	finger.add(circle1);
	var circle2 = new Circle().init()
	.attr("radius", 17)
	.css({
		"background-color": "rgba(255,255,255,0.7)"
	});
	finger.add(circle2);
	var circle3 = new Circle().init()
	.attr("radius", 14)
	.css({
		"background-color": "rgba(255,255,255,1)"
	});
	finger.add(circle3);
	this._finger = finger;
};

Scene.prototype.add = function(item) {
	this.children.add(item);
};

Scene.prototype.addToBottom = function(item) {
	this.add(item);
	this.children.move(item, 0);
};

Scene.prototype.rm = function(item) {
	this.children.rm(item);
};

Scene.prototype.moveToFront = function(item) {
	this.children.move(item, this.children.length() - 1);
};

Scene.prototype.render = function() {
	this.clear();
	var self = this;
	var rerender = false;
	this.children.iterate(function(item) {
		item._updateAnimation();
		if (!item.visible) {
			return;
		}
		if (item.render(self.ctx)) {
			// Set the flag to true
			rerender = true;
		}
	});
	if (this.enableFinger && this._finger.visible) {
		this._finger.render(this.ctx);
	}
	if (rerender) {
		this.render();
	}
};

Scene.prototype.clear = function() {
	var ctx = this.ctx;
	var w = this.width;
	var h = this.height;
	ctx.clearRect(0, 0, w, h);
	ctx.save();
	ctx.fillStyle = this.backgroundColor;
	ctx.fillRect(0, 0, w, h);
	ctx.restore();
};

Scene.prototype.hitTest = function(x, y, emitHitBackgroundEvent) {
	var self = this;
	var item;
	this.children.backIterate(function(_item) {
		if (!_item.visible) {
			return;
		}
		if (item = _item.hitTest(x, y, self.ctx)) {
			return true;
		}
	});
	if (emitHitBackgroundEvent && !item) {
		this.emit("hit-background");
	}
	return item;
};

Scene.prototype._trigger_mousedown = function(event) {
	if (this.enableFinger) {
		this._finger.attr({
			x: event.x,
			y: event.y,
			visible: true
		});
	}
	NotificationReceiver.emit("start-render");
	this.emit("mousedown", event);
	this._downPoint = {
		x: event.x,
		y: event.y
	};
	var item = this.hitTest(event.x, event.y, true);
	this.mouseTarget = item;
	item && item.emit("mousedown", event, this.ctx);
};

Scene.prototype._trigger_mouseup = function(event) {
	if (this.enableFinger) {
		this._finger.attr("visible", false);
	}
	this.emit("mouseup", event);
	if (!this._downPoint) {
		return;
	}
	var item = this.hitTest(event.x, event.y);
	item && item.emit("mouseup", event, this.ctx);
	if (this.mouseTarget && this._isDragging) {
		var event_dragend = new Event("mousedragend", event.x, event.y);
		this.mouseTarget.emit("mousedragend", event_dragend, this.ctx);
		this.mouseTarget = null;
	}
	var x1 = this._downPoint.x;
	var y1 = this._downPoint.y;
	var x2 = event.x;
	var y2 = event.y;
	if (Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) <= 10) {
		var event_click = new Event("click", event.x, event.y);
		item && item.emit("click", event_click, this.ctx);
	}
	this._isDragging = false;
	this._downPoint = null;
	this.render();
};

Scene.prototype._trigger_mousemove = function(event) {
	this.emit("mousemove", event);
	if (this.enableFinger) {
		this._finger.attr({
			x: event.x,
			y: event.y
		});
	}
	if (this._downPoint) {
		this._isDragging = true;
	}
	var item = this.hitTest(event.x, event.y);
	item && item.emit("mousemove", event, this.ctx);
	if (this.mouseTarget) {
		var event_drag = new Event("mousedrag", event.x, event.y);
		this.mouseTarget.emit("mousedrag", event_drag, this.ctx);
	}
};

Scene.prototype._trigger_mousewheel = function(event) {
	this.emit("mousewheel", event);
	var item = this.hitTest(event.x, event.y);
	item && item.emit("mousewheel", event, this.ctx);
};

// Get a child"s position relative to the scene
Scene.prototype.getChildPosition = function(item) {
	return utils.searchItemInGroup(this, item);
};

// Query using the web"s querystring style
// group?id=groupID1&value=guess
Scene.prototype.query = function(selector) {
	return new Query(this, selector);
};

Scene.prototype.getElementById = function(id, parent) {
	id = id.replace("#", "");
	var item;
	if (parent == null) {
		parent = this;
	}
	var self = this;
	parent.children.iterate(function(_item) {
		if (_item.id === id) {
			item = _item;
			return true;
		}
		if (_item.children) {
			var result = self.getElementById(id, _item);
			if (result) {
				item = result;
				return true;
			}
		}
	});
	return item;
};

Scene.prototype.showPopover = function(item, x, y) {
	if (this._popover.visible) {
		return;
	}
	this.moveToFront(this._popover);
	if (x != null && y != null) {
		this._popover.attr({
			x: x,
			y: y
		});
	}
	this._popover.add(item);
	this._popover.visible = true;
	this.render();
};

Scene.prototype.hidePopover = function() {
	this._popover.children.empty();
	this._popover.visible = false;
	this.render();
};

module.exports = Scene;