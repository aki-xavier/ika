var Element = require("../element");
var utils = require("../utils");
var Ease = require("ika-animations").Ease;

function Slider() {
	Element.call(this);
	this.name = "Slider";
	this.isInput = true;
	this.offset = 0;
	this.value = 0;
	this.min = 0;
	this.max = 1;
	this.active = false;
	this.type = "horizontal";
	this.length = 150;
	this.secondLength = 24;
	this.isSliding = false;
}

Slider.prototype = new Element();

Slider.prototype.init = function() {
	Element.prototype.init.call(this);
	this.css({
		"front-color": utils.colorTwo,
		"stroke-color": utils.colorOne
	});
	this.on("mousedown", this.bind("onmousedown"));
	this.on("mousedrag", this.bind("onmousedrag"));
	this.on("mousedragend", this.bind("onmousedragend"));
	this.on("mouseup", this.bind("onmouseup"));
	return this;
};

Slider.prototype.onmousedown = function(event) {
	this.active = true;
	if (this.type === "horizontal") {
		this.offset = event.x - this.x - this.secondLength / 2;
	} else {
		this.offset = event.y - this.y - this.secondLength / 2;
	}
	this._finalizeOffset();
	this.dragStartX = event.x;
	this.dragStartY = event.y;
	this.dragStartOffset = this.offset;
};

Slider.prototype._finalizeOffset = function() {
	if (this.offset > this.length - this.secondLength) {
		this.offset = this.length - this.secondLength;
	} else if (this.offset < 0) {
		this.offset = 0;
	}
	this.emit("change", Math.floor(this.min + (this.max - this.min) * (this.offset / (this.length - this.secondLength))));
	NotificationReceiver.emit("render", this);
};

Slider.prototype.onmousedrag = function(event) {
	if (this.type === "horizontal") {
		this.offset = this.dragStartOffset + event.x - this.dragStartX;
	} else {
		this.offset = this.dragStartOffset + event.y - this.dragStartY;
	}
	this._finalizeOffset();
};

Slider.prototype.onmousedragend = function(event) {
	this.active = false;
	this.dragStartX = 0;
	this.dragStartY = 0;
	this.dragStartOffset = 0;
};

Slider.prototype.onmouseup = Slider.prototype.onmousedragend;

Slider.prototype.getBound = function() {
	if (this.type === "horizontal") {
		return {
			x: this.x,
			y: this.y,
			width: this.length,
			height: this.secondLength
		};
	} else {
		return {
			x: this.x,
			y: this.y,
			width: this.secondLength,
			height: this.length
		};
	}
};

Slider.prototype.slideTo = function(offset) {
	if (this.isSliding) {
		return;
	}
	if (offset < 0 || offset > (this.length - this.secondLength)) {
		return;
	}
	this.isSliding = true;
	var ea = new Ease(this.offset, offset);
	this.animations.add(ea);
	var self = this;
	ea.on("step", function(value) {
		self.offset = value;
	});
	ea.on("end", function() {
		self.offset = offset;
		self._finalizeOffset();
		self.animations.rm(ea);
		self.isSliding = false;
	});
	ea.animate();
};

Slider.prototype.render = function(ctx) {
	ctx.save();
	var bound = this.getBound();
	this._applyStyle(ctx, "front-color");
	ctx.strokeStyle = this.css("stroke-color");
	ctx.lineWidth = 1;
	if (this.type === "horizontal") {
		ctx.fillRect(bound.x, bound.y + (this.secondLength - 10) / 2, bound.width, 10);
		ctx.strokeRect(bound.x, bound.y + (this.secondLength - 10) / 2, bound.width, 10);
		ctx.fillRect(bound.x + this.offset, bound.y, this.secondLength, this.secondLength);
		ctx.strokeRect(bound.x + this.offset, bound.y, this.secondLength, this.secondLength);
	} else {
		ctx.fillRect(bound.x + (this.secondLength - 10) / 2, bound.y, 10, bound.height);
		ctx.strokeRect(bound.x + (this.secondLength - 10) / 2, bound.y, 10, bound.height);
		ctx.fillRect(bound.x, bound.y + this.offset, this.secondLength, this.secondLength);
		ctx.strokeRect(bound.x, bound.y + this.offset, this.secondLength, this.secondLength);
	}
	ctx.restore();
};

Slider.prototype.getValue = function() {
	return this.value;
};

Slider.prototype.setValue = function(value) {
	this.value = value;
	this.offset = (value - this.min) * (this.length - this.secondLength) / (this.max - this.min);
};

Slider.prototype.reset = function() {
	this.value = 0;
	this.offset = 0;
	NotificationReceiver.emit("render");
};

module.exports = Slider;