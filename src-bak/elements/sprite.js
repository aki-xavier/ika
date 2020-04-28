var Element = require("../element");
var ArrayMgr = require("arraymgr");

function Sprite() {
	Element.call(this);
	this.name = "Sprite";
	this.width = 400;
	this.height = 300;
	this.ready = false;
	this.index = -1;
}

Sprite.prototype = new Element();

Sprite.prototype.init = function() {
	Element.prototype.init.call(this);
	this.slices = new ArrayMgr();
	this.img = document.createElement("img");
	var self = this;
	this.img.onload = function() {
		self.ready = true;
		NotificationReceiver.emit("render", this);
	};
	this.watchAttr("src", function(src) {
		self.ready = false;
		self.img.src = src;
	});
	this.watchAttr("index", function() {
		NotificationReceiver.emit("render", this);
	});
	return this;
};

// slice should be an array of four numbers
// indicating the four params: sx, sy, sWidth,
// sHeight of the ctx.drawImage method
Sprite.prototype.addSlice = function() {
	var slice = Array.prototype.slice.call(arguments, 0);
	this.slices.add(slice);
};

Sprite.prototype.render = function(ctx) {
	if (!this.ready || this.slices.length() === 0) {
		return;
	}
	var slice = this.slices.get(this.index);
	if (!slice) {
		return;
	}
	ctx.save();
	this.renderBackground(ctx);
	this.clip(ctx);
	
	ctx.drawImage(this.img, slice[0], slice[1], slice[2], slice[3], this.x, this.y, this.width, this.height);
	
	this.renderBorder(ctx);
	ctx.restore();
};

module.exports = Sprite;