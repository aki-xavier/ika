var Element = require("../element");
var utils = require("../utils");
var Ease = require("ika-animations").Ease;

function Switch() {
	Element.call(this);
	this.name = "Switch";
	this.isInput = true;
	this.height = 30;
	this.width = 80;
	
	this.switchButtonWidth = 30;
	this.switchButtonOffset = 0;
	this.isAnimating = false;
	//on & off
	this.status = "off";
}

Switch.prototype = new Element();

Switch.prototype.init = function() {
	Element.prototype.init.call(this);
	this.css({
		"background-color": {
			type: "linear",
			colors: [
				[0, "black"],
				[0.9, "rgb(80,80,80)"],
				[1, "rgb(100,100,100)"]
			]
		},
		"color": {
		type: "linear",
			colors: [
				[0, "white"],
				[1, "rgb(235,235,235)"]
			]
		},
		"border-width": 1,
		"border-color": utils.colorOne,
		"front-color": {
			type: "linear",
			colors: [
				[0, "rgb(235,235,235)"],
				[1, "white"]
			]
		}
	});
	this.on("click", this.bind("onclick"));
	this.on("mousedrag", this.bind("onmousedrag"));
	this.on("mousedragend", this.bind("onmousedragend"));
	return this;
};

Switch.prototype.render = function(ctx) {
	ctx.save();
	this.renderBackground(ctx);
	this._applyStyle(ctx, "front-color");
	ctx.fillRect(this.x + this.switchButtonOffset + this.switchButtonWidth, this.y, this.width - this.switchButtonWidth - this.switchButtonOffset, this.height);
	this._applyStyle(ctx, "color");
	ctx.fillRect(this.x + this.switchButtonOffset, this.y, this.switchButtonWidth, this.height);
	this.renderBorder(ctx);
	ctx.strokeRect(this.x + this.switchButtonOffset, this.y, this.switchButtonWidth, this.height);
	ctx.restore();
};

Switch.prototype.onclick = function(event) {
	if (this.isAnimating) {
		return;
	}
	var to;
	if (this.status === "off") {
		this.status = "on";
		to = this.width - this.switchButtonWidth;
	} else {
		this.status = "off";
		to = 0;
	}
	this.emit("change", this.status);
	var ea = new Ease(this.switchButtonOffset, to, 200);
	this.isAnimating = true;
	this.animations.add(ea);
	var self = this;
	ea.on("step", function(value) {
		self.switchButtonOffset = value;
	});
	ea.on("end", function() {
		self.switchButtonOffset = to;
		self.animations.rm(ea);
		self.isAnimating = false;
	});
	ea.animate();
};

Switch.prototype.click = Switch.prototype.onclick;

Switch.prototype.onmousedrag = function(event) {
	if (!this._ondragging) {
		this._ondragging = true;
		this._originalOffset = this.switchButtonOffset;
		this._startDraggingX = event.x;
		this._startDraggingY = event.y;
	} else {
		var deltaX = event.x - this._startDraggingX;
		var newOffset = this._originalOffset + deltaX;
		if (newOffset > this.width - this.switchButtonWidth) {
			newOffset = this.width - this.switchButtonWidth;
		} else if (newOffset < 0) {
			newOffset = 0;
		}
		this.switchButtonOffset = newOffset;
		NotificationReceiver.emit("render", this);
	}
};

Switch.prototype.onmousedragend = function(event) {
	var to;
	if (this.switchButtonOffset >= (this.width - this.switchButtonWidth) / 2) {
		to = this.width - this.switchButtonWidth;
		if (this.status === "off") {
			this.status = "on";
			this.emit("change", this.status);
		}
	} else {
		to = 0;
		if (this.status === "on") {
			this.status = "off";
			this.emit("change", this.status);
		}
	}
	var self = this;
	var ea = new Ease(this.switchButtonOffset, to);
	ea.on("step", function(value) {
		self.switchButtonOffset = value;
	});
	ea.on("end", function() {
		self.switchButtonOffset = to;
		self.animations.rm(ea);
		self._ondragging = false;
		self._originalOffset = null;
		self._startDraggingPoint = null;
	});
	this.animations.add(ea);
	ea.animate();
};

Switch.prototype.getValue = function() {
	return this.status;
};

Switch.prototype.setValue = function(value) {
	this.status = value;
	this.switchButtonOffset = this.status === "on" ? this.width - this.switchButtonWidth : 0;
};

Switch.prototype.reset = function() {
	this.status = "off";
	this.switchButtonOffset = 0;
	NotificationReceiver.emit("render");
};

module.exports = Switch;